import { Serializable } from './mixin';
import { ObjectRegistry } from '../registry';
import { Serialized } from '.';

export class Deserializer {
	public static deserialize(obj: Serialized): Serializable {
		if (!obj.$SCLASS)
			throw TypeError(
				`Object not deserializable, missing internal _SCLASS property: ${obj}. Make sure you have properly decorated your object with @Serializable`
			);
		const entry = ObjectRegistry.get().getEntry(obj.$SCLASS);
		return entry.deserialize(obj);
	}
}
