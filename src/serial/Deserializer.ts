import Serializable, { SerializableObject } from './decorators/Serializable';
import { Serialized } from './types';
import objectRegistry from '../registry';
import SerialSymbol from './SerialSymbol';
export default class Deserializer {
	public deserialize(serialObj: Serialized): Serializable {
		const regIdKey = SerialSymbol.registryId.description as keyof Serialized;
		const classKey = SerialSymbol.class.description as keyof Serialized;
		const serializableKey = SerialSymbol.serializable as keyof SerializableObject;
		let regId;
		let className;
		if (regIdKey in serialObj) {
			regId = serialObj[regIdKey];
			className = serialObj[classKey];
			if (!regId) {
				throw TypeError(
					`Object not deserializable, missing value for property: ${regIdKey.toString()}. 
					 Object: ${JSON.stringify(serialObj)}. 
					 Make sure you have properly decorated your class with @Serializable.`
				);
			}
			if (!className) {
				console.warn(
					`Object with ${regIdKey.toString()}: ${regId} is missing ${classKey.toString()}. 
					 Object: ${JSON.stringify(serialObj)}`
				);
			}
		} else {
			throw TypeError(
				`Object not deserializable, missing internal property ${regIdKey.toString()}. 
				 Object: ${JSON.stringify(serialObj)}. 
				 Make sure you have properly decorated your class with @Serializable`
			);
		}

		try {
			const regEntry = objectRegistry.getEntry(regId);
			if (!regEntry) {
				throw Error(
					`Object with ${regIdKey.toString()}: ${regId} and ${classKey.toString()}: ${className} not found in registry.
					 Make sure you are property configuring the transfer handler.`
				);
			}
			const instance = Object.create(regEntry.constructor.prototype) as SerializableObject;
			const obj = instance.deserialize(serialObj, this);
			if (instance[serializableKey] !== true)
				throw new TypeError(
					`The deserialized object is not Serializable [${className}]
					}]. There is a known issue with babel and using legacy decorators. See README for a workaround.`
				);
			return obj;
		} catch (err) {
			console.error(err);
			throw err;
		}
	}
}
