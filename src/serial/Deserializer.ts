import { Serializable } from './mixin';
import { ObjectRegistry } from '../registry';
import { Serialized } from '.';

export class Deserializer {
	public static deserialize(obj: Serialized): Serializable {
		if (!obj._SCLASS)
			throw TypeError(
				`Object not deserializable, missing internal _SCLASS property: ${obj}. Make sure you have properly decorated your object with @Serializable`
			);
		const entry = ObjectRegistry.get().getEntry(obj._SCLASS);
		return entry.deserialize(obj);
	}
}
