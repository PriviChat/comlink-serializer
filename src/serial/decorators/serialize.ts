import 'reflect-metadata';
import SerialSymbol from '../SerialSymbol';
import { Dictionary } from '../types';
import { SerialClassToken, SerializeDescriptorProperty, SerialMeta, SerialPropertyMetadataKey } from './types';

export default function Serialize(classToken?: SerialClassToken, lazy = false) {
	return defineSerializePropertyMetadata(classToken, lazy);
}

function defineSerializePropertyMetadata(classToken?: SerialClassToken, lazy = false) {
	return function (target: any, prop: string | symbol) {
		const meta = Reflect.getMetadata('design:type', target, prop);
		const type = meta.name;
		let token: SerialClassToken;
		if (type === 'Serializable') {
			const serialMeta = meta.prototype[SerialSymbol.serializable]() as SerialMeta;
			token = serialMeta.classToken;
		} else if (type === 'Array' || type === 'Map') {
			if (!classToken) {
				const err = `ERR_MISSING_SERIAL_CLASS: You must pass in the classType when decorating an Array or Map with @Serialize. The object within those classes must be @Serializable.`;
				console.error(err);
				throw new TypeError(err);
			}
			token = classToken;
		} else {
			const err = `ERR_NOT_SERIALIZABLE: You may only decorate Serializable, Array or Map with @Serialize. The object within Array and Map must be @Serializable.`;
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
