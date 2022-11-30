import { Serializable } from '../serial';
import { ObjectRegistry } from '../registry';
import { SerializedMap } from './types';

@Serializable
export class SerializableMap<
	K extends Serializable | number | string = Serializable,
	V extends Serializable = Serializable
> extends Map<K, V> {
	serialize(): SerializedMap {
		const map = new Map();
		this.forEach((obj, key) => {
			let serializedKey;
			if (typeof key === 'number' || typeof key === 'string') {
				serializedKey = key;
			} else {
				serializedKey = key.serialize();
			}
			map.set(serializedKey, obj.serialize());
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
			let deserializedKey;
			if (typeof key === 'number' || typeof key === 'string') {
				deserializedKey = key;
			} else {
				const keyEntry = ObjectRegistry.get().getEntry(key.$SCLASS!);
				deserializedKey = keyEntry.deserialize(key);
			}
			const objEntry = ObjectRegistry.get().getEntry(value.$SCLASS!);
			sm.set(deserializedKey, objEntry.deserialize(value));
		});
		return sm;
	}
}
