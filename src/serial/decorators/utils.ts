import { v5 as uuidv5 } from 'uuid';
import SerialSymbol from '../SerialSymbol';
import { Serialized } from '../types';
import Serializable, { SerializableObject } from './Serializable';
import { SerialMeta } from './types';

export function generateId(name: string) {
	const namespace = '22547e41-5fab-482d-9524-19d9d3872596';
	return uuidv5(name, namespace);
}

export function isSerializableObject<T extends Serializable = Serializable>(
	obj: any
): obj is SerializableObject<any, T> & T {
	return typeof obj[SerialSymbol.serializable] === 'function';
}

export function isSerializedObject(obj: any): obj is Required<Serialized> {
	return typeof obj[SerialSymbol.serializable] === 'function';
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
