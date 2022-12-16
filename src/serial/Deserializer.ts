import Serializable, { SerializableObject } from './decorators/Serializable';
import { Serialized } from './types';
import objectRegistry from '../registry';
export default class Deserializer {
	public deserialize(serializedObj: Serialized): Serializable {
		if (!serializedObj.__$SCLASS)
			throw TypeError(
				`Object not deserializable, missing internal __$SCLASS property: ${JSON.stringify(
					serializedObj
				)}. Make sure you have properly decorated your class with @Serializable`
			);
		try {
			const regEntry = objectRegistry.getEntry(serializedObj.__$SCLASS);
			const instance = Object.create(regEntry.constructor.prototype) as SerializableObject;
			const deserObject = instance.deserialize(serializedObj, this);
			if (!(deserObject as any).isSerializable)
				throw new TypeError(
					`The deserialized object is not Serializable [${instance.__$SNAME}]! There is a known issue with babel and using legacy decorators. See README for a workaround.`
				);
			return deserObject;
		} catch (err) {
			console.error(err);
			throw err;
		}
	}
}
