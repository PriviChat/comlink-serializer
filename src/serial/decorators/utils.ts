import SerialProxy from '../serial-proxy';
import SerialSymbol from '../serial-symbol';
import { Dictionary, Serialized, SerializedProxy } from '../types';
import Serializable, { SerializableObject } from './serializable';
import {
	SerialClassToken,
	SerializeDescriptorProperty,
	SerializeSettings,
	SerialMeta,
	SerialPropertyMetadataKey,
} from './types';

export function isSerializableObject<T extends Serializable>(obj: any): obj is SerializableObject<T> {
	return obj && typeof obj[SerialSymbol.serializable] === 'function';
}

export function isSerializable(obj: any): obj is Serializable {
	return obj && typeof obj[SerialSymbol.serializable] === 'function';
}

export function isSerializedObject(obj: any): obj is Required<Serialized> {
	return SerialSymbol.serialized in obj;
}

export function isSerialProxy<T extends Serializable>(obj: any): obj is SerialProxy<T> {
	return obj instanceof SerialProxy;
}

export function isSerializedProxy(obj: any): obj is SerializedProxy {
	return obj && obj[SerialSymbol.serializedProxy] === true;
}

export function defineSerializePropertyMetadata({ classToken, lazy }: SerializeSettings) {
	return function (target: Object, prop: string | symbol) {
		const meta = Reflect.getMetadata('design:type', target, prop);
		const type = meta.name;
		let token: SerialClassToken;
		if (type === 'Serializable') {
			const serialMeta = meta.prototype[SerialSymbol.serializable]() as SerialMeta;
			token = serialMeta.classToken;
			if (classToken && classToken.toString() !== token) {
				const err = `ERR_INCORRECT_SERIAL_CLASS: The classToken: ${classToken.toString()} passed to @Serialize or @SerializeLazy does not matched the expected classToken: ${token}. Class: ${
					target.constructor.name
				} Property: ${prop.toString}`;
				console.error(err);
				throw new TypeError(err);
			}
		} else if (type === 'Array' || type === 'Map') {
			if (!classToken) {
				const err = `ERR_MISSING_SERIAL_CLASS: You must pass the classToken parameter when decorating an Array or Map with @Serialize or @SerializeLazy. The class contained within Array and Map must be decorated with @Serializable. Class: ${target.constructor.name} Property: ${prop.toString}`;
				console.error(err);
				throw new TypeError(err);
			}
			token = classToken;
		} else {
			const err = `ERR_NOT_SERIALIZABLE: You may only decorate Serializable objects, Array, and Map with @Serialize or @SerializeLazy. The class contained within Array and Map must be decorated with @Serializable. Class: ${target.constructor.name} Property: ${prop.toString}`;
			console.error(err);
			throw new TypeError(err);
		}

		const propConfig: SerializeDescriptorProperty = {
			prop: prop.toString(),
			type,
			token,
			lazy,
		};
		const descriptors: Dictionary<SerializeDescriptorProperty> =
			Reflect.getOwnMetadata(SerialPropertyMetadataKey, target) || {};
		descriptors[prop.toString()] = propConfig;
		Reflect.defineMetadata(SerialPropertyMetadataKey, descriptors, target);
	};
}
