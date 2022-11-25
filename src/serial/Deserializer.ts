import { Serializable } from './mixin';
import { ObjectRegistry } from '../registry';
import { Serialized } from '.';

export class Deserializer {
	public static deserialize(obj: Serialized): Serializable {
		const entry = ObjectRegistry.get().getEntry(obj._SCLASS);
		return entry.constructor.deserialize(obj);
	}
}
