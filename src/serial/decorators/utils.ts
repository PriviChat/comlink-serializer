import { SerialArray, SerializedProxy, SerialMap, SerialProxy } from '../../serialobjs';
import SerialSymbol from '../SerialSymbol';
import { Serialized } from '../types';
import Serializable, { SerializableObject } from './Serializable';
import { SerializableCollection } from './types';

export function isSerializableObject<T extends Serializable>(obj: any): obj is SerializableObject<T> {
	return obj && typeof obj[SerialSymbol.serializable] === 'function';
}

export function toSerializableObject<T extends Serializable>(obj: T): SerializableObject<T> {
	if (!isSerializableObject(obj)) {
		const err = `ERR_NOT_SERIALIZABLE: Object not Serializable. Missing Symbol: [${SerialSymbol.serializable.toString()}]. Object: ${JSON.stringify(
			obj
		)} - Make sure you have properly decorated your class with @Serializable.`;
		console.error(err);
		throw TypeError(err);
	}
	return obj;
}

export function isSerializedObject(obj: any): obj is Required<Serialized> {
	return SerialSymbol.serialized in obj;
}

export function isSerializableCollection(obj: any): obj is SerializableCollection {
	return (obj && obj instanceof SerialArray) || obj instanceof SerialMap;
}

export function isSerialProxy<T extends Serializable>(obj: any): obj is SerialProxy<T> {
	return obj instanceof SerialProxy;
}

export function isSerializedProxy(obj: any): obj is SerializedProxy {
	return obj && obj[SerialSymbol.serializedProxy] === true;
}
