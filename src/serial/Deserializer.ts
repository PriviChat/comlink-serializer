import Serializable, { SerializableObject } from './decorators/Serializable';
import { Serialized } from './types';
import objectRegistry from '../registry';
export default class Deserializer {
	public deserialize(serializedObj: Serialized): Serializable {
		if (!serializedObj.$SCLASS)
			throw TypeError(
				`Object not deserializable, missing internal $SCLASS property: ${JSON.stringify(
					serializedObj
				)}. Make sure you have properly decorated your class with @Serializable`
			);
		try {
			const regEntry = objectRegistry.getEntry(serializedObj.$SCLASS);
			const instance = Object.create(regEntry.constructor.prototype) as SerializableObject;
			const deserObject = instance.doDeserialize(serializedObj, this);
			if (!(deserObject as any).isSerializable) throw new TypeError('The deserialized object is not Serializable!');
			return deserObject;
		} catch (err) {
			console.error(err);
			throw err;
		}
	}
}
