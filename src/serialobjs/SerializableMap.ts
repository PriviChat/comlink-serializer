import { Serializable } from '../serial';
import { ObjectRegistry } from '../registry';
import { SerializedMap } from './types';

export class SerializableMap<K extends Serializable = Serializable, V extends Serializable = Serializable> extends Map<
	K,
	V
> {
	serialize(): SerializedMap {
		const map = new Map();
		this.forEach((obj, key) => {
			map.set(key.serialize(), obj.serialize());
		});
		const obj = {
			_map: map,
		};
		return obj;
	}

	static from<K extends Serializable, V extends Serializable>(map: Map<K, V>): SerializableMap<K, V> {
		const sm = new SerializableMap<K, V>();
		map.forEach((obj, key) => {
			sm.set(key, obj);
		});
		return sm;
	}

	// built-in methods will use this as the constructor
	static get [Symbol.species](): MapConstructor {
		return Map;
	}

	static deserialize(obj: SerializedMap): SerializableMap<Serializable> {
		const sm = new SerializableMap();
		obj._map.forEach((value, key) => {
			const keyEntry = ObjectRegistry.get().getEntry(key.$SCLASS!);
			const objEntry = ObjectRegistry.get().getEntry(value.$SCLASS!);
			sm.set(keyEntry.deserialize(key), objEntry.deserialize(value));
		});
		return sm;
	}
}
