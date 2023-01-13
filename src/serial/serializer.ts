import { traverse, TraversalCallbackContext } from 'object-traversal';
import { SerialArray, SerialMap, SerialProxy } from '../serialobjs';
import { SerialClassToken, Serializable, SerializableObject, SerializeDescriptorProperty } from './decorators';
import { isSerializableObject, toSerializableObject } from './decorators/utils';
import { Dictionary, SerializeCtx, Serialized } from './types';

export default class Serializer implements SerializeCtx {
	readonly transfers = new Array<Transferable>();
	constructor() {}

	addTransferable(transfer: Transferable): void {
		this.transfers.push(transfer);
	}

	public serialize<S extends Serialized>(
		obj: Serializable,
		classToken: SerialClassToken,
		descr?: Dictionary<SerializeDescriptorProperty>
	): S {
		const serialObj = {} as S;

		traverse(
			obj,
			({ parent, key, value }: TraversalCallbackContext) => {
				if (parent && key) {
					let serialValue;
					const sdp = descr ? descr[key] : undefined;
					if (sdp) {
						let so: SerializableObject | undefined;
						if (sdp.type === 'Serializable')
							if (isSerializableObject(value)) {
								so = value;
							} else {
								const err = `ERR_NOT_SERIALIZABLE: Property: ${key} of class: ${classToken.toString()} has decorator @Serialize but is not a @Serializable object.`;
								console.error(err);
								throw new TypeError(err);
							}
						else if (sdp.type === 'Array') {
							if (Array.isArray(value)) {
								so = toSerializableObject(SerialArray.from(value));
							} else {
								const err = `ERR_INVALID_TYPE: Property: ${key} of class: ${classToken.toString()} has a type Array, but it is not an Array.`;
								console.error(err);
								throw new TypeError(err);
							}
						} else if (sdp.type === 'Map') {
							if (value instanceof Map) {
								so = toSerializableObject(SerialMap.from(value));
							} else {
								const err = `ERR_INVALID_TYPE: Property: ${key} of class: ${classToken.toString()} has a type Map, but it is not a Map and wont be serialized.`;
								console.error(err);
								throw new TypeError(err);
							}
						}
						if (sdp.lazy && so) {
							const sp = new SerialProxy(so, key, classToken);
							this.addTransferable(sp.port);
							so = toSerializableObject(sp);
						}
						if (so) {
							serialValue = so.serialize(this);
						} else {
							const err = `ERR_INVALID_TYPE: Property: ${key} of class: ${classToken.toString()} has decorator @Serialize but the property is not a valid type. Valid types are @Serializable, Array, and Map.`;
							console.error(err);
							throw new TypeError(err);
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

		return serialObj;
	}
}
