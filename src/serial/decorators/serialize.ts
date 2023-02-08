import 'reflect-metadata';
import { Dictionary } from '..';
import SerialSymbol from '../serial-symbol';
import objectRegistry from '../../registry';
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
		// allow for delayed loading to make sure all
		// serializable classes are registered first
		const resolver =
			(_target: any, _prop: string | symbol, _classToken: SerialClassToken | undefined, _proxy: boolean) => () => {
				// class that contains the property decorator
				const className: string | undefined = _target?.constructor ? _target.constructor.name : undefined;

				if (!className) {
					const err = `ERR_UNKNOWN_CLASSNAME: target - [${JSON.stringify(
						_target
					)}] is an invalid type. Unable to determain the class name from the constructor. Perhaps you are using @Serialize to decorate something other then a class property?`;
					console.error(err);
					throw new TypeError(err);
				}

				// fetch registry entry by class
				const classEntry = objectRegistry.getEntryByClass(className);

				// check if the target class is registered Serializable
				if (!classEntry) {
					const err = `ERR_NOT_SERIALIZABLE: Class: [${className}] Property: [${_prop.toString()}] - The class is not registered as Serializable. You can only use @Serialize inside a @Serializable class.`;
					console.error(err);
					throw new TypeError(err);
				}

				const meta = Reflect.getMetadata('design:type', _target, _prop);
				if (!meta) {
					const err = `ERR_MISSING_REFLECT_META: Class: [${classEntry.class}
						
					}] classToken: [${classEntry.classToken.toString()}] Property: [${_prop.toString()}] - Unable to access class metadata, make sure you set 'emitDecoratorMetadata: true' in your tsconfig file. `;
					console.error(err);
					throw new TypeError(err);
				}

				let type = meta.name;
				if (type === 'Serializable') {
					const metaClassToken = meta.prototype[SerialSymbol.classToken]() as SerialClassToken;
					if (_classToken && _classToken !== metaClassToken) {
						const err = `ERR_INCORRECT_CLASS_TOKEN: Class: [${className}] classToken: [${classEntry.classToken.toString()}] Property: [${
							_prop.toString
						}] - the classToken: [${_classToken.toString()}] passed to @Serialize does not matched the expected classToken: [${metaClassToken.toString()}] for the property.`;
						console.error(err);
						throw new TypeError(err);
					}
					_classToken = metaClassToken;
				} else if (type === 'Array' || type === 'Map') {
					if (!_classToken) {
						const err = `ERR_MISSING_CLASS_TOKEN: Class: [${className}] classToken: [${classEntry.classToken.toString()}] Property: [${_prop.toString()}] - You must pass the classToken parameter when decorating an Array or Map with @Serialize. Also, the class contained within Array or Map must be decorated with @Serializable. `;
						console.error(err);
						throw new TypeError(err);
					}
				} else {
					// this can happen when a decorator is self reference
					const propEntry = objectRegistry.getEntryByClass(meta.name);
					if (!propEntry) {
						const err = `ERR_NOT_SERIALIZABLE: Class: [${className}] Property: [${_prop.toString()}] - The property is not registered as Serializable. You can only use @Serialize on an Array, Map or Serializable object.`;
						console.error(err);
						throw new TypeError(err);
					}
					_classToken = propEntry.classToken;
					type = 'Serializable';
				}

				const propConfig: SerializePropertyDescriptor = {
					prop: _prop.toString(),
					type,
					classToken: _classToken,
					proxy: _proxy,
				};
				return propConfig;
			};

		const descrFns: Dictionary<Function> = Reflect.getOwnMetadata(SerialPropertyMetadataKey, target) || {};

		// set the function for the property
		descrFns[prop.toString()] = resolver(target, prop, classToken, proxy);

		// write descriptor function to class metadata
		Reflect.defineMetadata(SerialPropertyMetadataKey, descrFns, target);
	};
}
