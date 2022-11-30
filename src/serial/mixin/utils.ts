import { Serialized } from '../types';
import { Serializable } from './Serializable';
import { AnyConstructor } from './types';
import { v5 as uuidv5 } from 'uuid';

export const applyMixins = (derivedCtor: any, constructors: any[]) => {
	constructors.forEach((baseCtor) => {
		Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
			Object.defineProperty(
				derivedCtor.prototype,
				name,
				Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || Object.create(null)
			);
		});
	});
};

export function generateSCLASS<S extends Serialized>(constructor: AnyConstructor<Serializable<S>>) {
	const namespace = '22547e41-5fab-482d-9524-19d9d3872596';
	return uuidv5(constructor.name, namespace);
}
