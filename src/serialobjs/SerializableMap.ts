import { ObjectRegistry } from '../registry';
import Serializable from '../serial/mixin';
import { SerializedMap } from './types';

@Serializable
class SerializableMap<K extends boolean | number | bigint | string, V extends Serializable = Serializable> extends Map<
	K,
	V
> {
	serialize(): SerializedMap {
		const map = new Map();
		this.forEach((obj, key) => {
			map.set(key, obj.serialize());
		});
		const obj = {
			_map: map,
		};
		return obj;
	}

	static from<K extends boolean | number | bigint | string, V extends Serializable>(
		map: Map<K, V>
	): SerializableMap<K, V> {
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

	static deserialize(obj: SerializedMap): SerializableMap<boolean | number | bigint | string> {
		const sm = new Map();
		obj._map.forEach((value, key) => {
			const objEntry = ObjectRegistry.get().getEntry(value.$SCLASS!);
			sm.set(key, objEntry.deserialize(value));
		});
		return SerializableMap.from(sm);
	}
}

export { SerializableMap };
