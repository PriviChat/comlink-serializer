import { Serialized } from '../types';
import { Serializable } from './Serializable';
import { AnyConstructor } from './types';
import { v5 as uuidv5 } from 'uuid';

export function applyMixins(derivedCtor: any, constructors: any[]) {
	if (!derivedCtor.prototype['original_serialize']) {
		derivedCtor.prototype['original_serialize'] = derivedCtor.prototype['serialize'];
	}
	constructors.forEach((baseCtor) => {
		// if (!derivedCtor['original_serialize']) {
		// Object.defineProperty(derivedCtor.prototype, 'original_serialize', Object.getOwnPropertyDescriptor(baseCtor.prototype, 'serialize') || Object.create(null));
		// }
		// Object.defineProperty(derivedCtor.prototype, 'original_serialize', Object.getOwnPropertyDescriptor(baseCtor.prototype, 'serialize') || Object.create(null));
		Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
			Object.defineProperty(
				derivedCtor.prototype,
				name,
				Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || Object.create(null)
			);
		});
		derivedCtor.constructor = baseCtor.constructor;
	});
}

export function generateSCLASS<S extends Serialized>(constructor: AnyConstructor<Serializable<S>>) {
	const namespace = '22547e41-5fab-482d-9524-19d9d3872596';
	return uuidv5(constructor.name, namespace);
}
