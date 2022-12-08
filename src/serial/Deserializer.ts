import Serializable, { Serialized } from './mixin';
import { ObjectRegistry } from '../registry';

export class Deserializer {
	public static deserialize(serialObj: Serialized): Serializable {
		if (!serialObj.$SCLASS)
			throw TypeError(
				`Object not deserializable, missing internal $SCLASS property: ${JSON.stringify(
					serialObj
				)}. Make sure you have properly decorated your class with @Serializable`
			);
		try {
			const entry = ObjectRegistry.get().getEntry(serialObj.$SCLASS);
			const obj = entry.deserialize(serialObj);
			if (!(obj as any).isSerializable) throw new TypeError('The deserialized object is not Serializable!');
			return obj;
		} catch (err) {
			console.error(err);
			throw err;
		}
	}
}
