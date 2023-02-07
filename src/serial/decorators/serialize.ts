import 'reflect-metadata';
import { Dictionary } from '..';
import SerialSymbol from '../serial-symbol';
import { SerialClassToken, SerializePropertyDescriptor, SerializeSettings, SerialPropertyMetadataKey } from './types';

/**
 * The @Serialize decorator tells the serializer to serialize the property.
 *
 * The property decorated must be a class that is either decorated with @Serializable or an Array or Map containing  Serializable objects.
 *
 * Map keys must be of primitive types (boolean | number | bigint | string).
 *
 * When decorating an Array or Map with @Serialize you must also specify the SerialClassToken.
 *
 * If you pass boolean (true) into @Serialize you will get a proxy to your object.
 *
 * @param {SerialClassToken | SerializeSettings | boolean} [settings] - SerialClassToken |
 * SerializeSettings | boolean
 * @returns void
 */
export default function Serialize(settings?: SerialClassToken | SerializeSettings | boolean) {
	if (!settings) {
		return defineSerializePropertyMetadata({ proxy: false });
	} else if (typeof settings === 'boolean') {
		return defineSerializePropertyMetadata({ proxy: settings });
	} else if (typeof settings === 'string' || typeof settings === 'symbol') {
		return defineSerializePropertyMetadata({ classToken: settings, proxy: false });
	} else {
		return defineSerializePropertyMetadata(settings);
	}
}

function defineSerializePropertyMetadata({ classToken, proxy }: SerializeSettings) {
	return function (target: any, prop: string | symbol) {
		const refMeta = Reflect.getMetadata('design:type', target, prop);
		const type = refMeta.name;
		if (type === 'Serializable') {
			const refClassToken: SerialClassToken = refMeta.prototype[SerialSymbol.classToken]();
			if (classToken && classToken !== refClassToken) {
				const err = `ERR_INCORRECT_CLASS_TOKEN: Class - [${target.constructor.name}] Property - [${
					prop.toString
				}] - The classToken: ${classToken.toString()} passed to @Serialize does not matched the expected classToken: ${refClassToken.toString()}.`;
				console.error(err);
				throw new TypeError(err);
			}
			classToken = refClassToken;
		} else if (type === 'Array' || type === 'Map') {
			if (!classToken) {
				const err = `ERR_MISSING_CLASS_TOKEN: Class - [${
					target.constructor.name
				}] Property - [${prop.toString()}] - You must pass the classToken parameter when decorating an Array or Map with @Serialize. Also, the class contained within Array or Map must be decorated with @Serializable. `;
				console.error(err);
				throw new TypeError(err);
			}
		} else {
			const err = `ERR_NOT_SERIALIZABLE: Class - [${
				target.constructor.name
			}] Property - [${prop.toString()}] - You may only decorate Serializable objects, Array, and Map with @Serialize. Also, the class contained within Array and Map must be decorated with @Serializable.`;
			console.error(err);
			throw new TypeError(err);
		}

		const propConfig: SerializePropertyDescriptor = {
			prop: prop.toString(),
			type,
			classToken,
			proxy,
		};
		const descriptors: Dictionary<SerializePropertyDescriptor> =
			Reflect.getOwnMetadata(SerialPropertyMetadataKey, target) || {};
		descriptors[prop.toString()] = propConfig;
		Reflect.defineMetadata(SerialPropertyMetadataKey, descriptors, target);
	};
}
