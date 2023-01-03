import { SerialArray, SerialMap } from '../../serialobjs';
import SerialSymbol from '../SerialSymbol';
import { Serialized } from '../types';
import Serializable, { SerializableObject } from './Serializable';
import { SerializableCollection } from './types';

export function isSerializableObject<T extends Serializable>(obj: any): obj is SerializableObject<Serialized, T> {
	return obj && typeof obj[SerialSymbol.serializable] === 'function';
}

export function isSerializedObject(obj: any): obj is Required<Serialized> {
	return SerialSymbol.serialized in obj;
}

export function isSerializableCollection(obj: any): obj is SerializableCollection {
	return (obj && obj instanceof SerialArray) || obj instanceof SerialMap;
}

export function applyMixins(derivedCtor: any, constructors: any[]) {
	constructors.forEach((baseCtor) => {
		Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
			Object.defineProperty(
				derivedCtor.prototype,
				name,
				Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || Object.create(null)
			);
		});
	});
}
