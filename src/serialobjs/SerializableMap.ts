import { Deserializer } from 'src/serial';
import { Serializable } from '../serial/decorators';
import { SerializedMap } from './types';

@Serializable
export default class SerializableMap<
	K extends boolean | number | bigint | string,
	V extends Serializable = Serializable
> extends Map<K, V> {
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

	public deserialize(
		obj: SerializedMap,
		deserializer: Deserializer
	): SerializableMap<boolean | number | bigint | string> {
		const sm = new Map();
		obj._map.forEach((value, key) => {
			sm.set(key, deserializer.deserialize(value));
		});
		return SerializableMap.from(sm);
	}
}
