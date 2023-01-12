import { traverse, TraversalCallbackContext } from 'object-traversal';
import { SerialArray, SerialMap } from '../serialobjs';
import { SerializableObject, SerializeDescriptorProperty } from './decorators';
import { isSerializableObject } from './decorators/utils';
import SerialSymbol from './SerialSymbol';
import { Dictionary, Serialized } from './types';

export default class Serializer {
	constructor() {}

	public serialize<S extends Serialized, T extends SerializableObject<S> = SerializableObject<S>>(
		obj: T,
		descr?: Dictionary<SerializeDescriptorProperty>
	): S {
		const serialObj: Serialized = {};
		const classToken = typeof obj[SerialSymbol.classToken] === 'function' ? obj[SerialSymbol.classToken]() : undefined;

		if (!classToken) {
			const err = `ERR_MISSING_SYMBOL: Object not serializable. Missing Symbol: [${SerialSymbol.classToken.toString()}] or undefined token returned. Object: ${JSON.stringify(
				obj
			)}`;
			console.error(err);
			throw new TypeError(err);
		}

		traverse(
			obj,
			({ parent, key, value }: TraversalCallbackContext) => {
				if (parent && key) {
					let serialValue;
					const sdp = descr ? descr[key] : undefined;
					if (sdp) {
						if (sdp.lazy) return;
						if (sdp.type === 'Serializable')
							if (isSerializableObject(value)) {
								serialValue = value.serialize();
							} else {
								console.warn(
									`WRN_SERIAL_IGNORE: Property: ${key} of class: ${classToken.toString()} has a descriptor but is not a @Serializable object and wont be serialized.`
								);
							}
						else if (sdp.type === 'Array') {
							if (Array.isArray(value)) {
								const sa = SerialArray.from(value);
								serialValue = sa.serialize();
							} else {
								console.warn(
									`WRN_SERIAL_IGNORE: Property: ${key} of class: ${classToken.toString()} has a descriptor type Array but it is not an Array and wont be serialized.`
								);
							}
						} else if (sdp.type === 'Map') {
							if (value instanceof Map) {
								const sm = SerialMap.from(value);
								serialValue = sm.serialize();
							} else {
								console.warn(
									`WRN_SERIAL_IGNORE: Property: ${key} of class: ${classToken.toString()} has a descriptor type Map but it is not a Map and wont be serialized.`
								);
							}
						}
					} else if (Array.isArray(value)) {
						if (value.length < 0) {
							if (isSerializableObject(value[0])) {
								const err = `ERR_MISSING_DECORATOR: Array: ${key} of class ${classToken.toString()} contains @Serializable objects and must be decorated with @Serialize.`;
								console.error(err);
								throw new TypeError(err);
							}
						}
						serialValue = value;
					} else if (value instanceof Map) {
						if (value.size > 0) {
							const entry = value.entries().next();
							if (isSerializableObject(entry)) {
								const err = `ERR_MISSING_DECORATOR: Map: ${key} of class ${classToken.toString()} contains @Serializable objects and must be decorated with @Serialize.`;
								console.error(err);
								throw new TypeError(err);
							}
						}
						serialValue = value;
					} else {
						serialValue = value;
					}
					Object.assign(serialObj, { [key]: serialValue });
				}
			},
			{ maxDepth: 1 }
		);

		return serialObj as S;
	}
}
