import Serializable, { Serialized } from './mixin';
import { ObjectRegistry } from '../registry';

export class Deserializer {
	public static deserialize(obj: Serialized): Serializable {
		if (!obj.$SCLASS)
			throw TypeError(
				`Object not deserializable, missing internal $SCLASS property: ${obj}. Make sure you have properly decorated your class with @Serializable`
			);
		try {
			const entry = ObjectRegistry.get().getEntry(obj.$SCLASS);
			return entry.deserialize(obj);
		} catch (err) {
			console.error(err);
			throw err;
		}
	}
}
