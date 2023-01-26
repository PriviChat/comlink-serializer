import SerialProxy from '../serial-proxy';
import SerialSymbol from '../serial-symbol';
import { Serialized, SerializedProxy } from '../types';
import Serializable, { SerializableObject } from './serializable';

export function isSerializableObject<T extends Serializable>(obj: any): obj is SerializableObject<T> {
	return obj && typeof obj[SerialSymbol.serializable] === 'function';
}

export function isSerializable<T extends Serializable = Serializable>(obj: any): obj is T {
	return obj && typeof obj[SerialSymbol.serializable] === 'function';
}

export function isSerialized(obj: any): obj is Required<Serialized> {
	return SerialSymbol.serialized in obj;
}
