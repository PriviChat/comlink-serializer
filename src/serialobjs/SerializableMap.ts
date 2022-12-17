import { Serializable, Deserializable } from '../serial/decorators';
import { Deserializer } from '../serial';
import { SerializedMap } from './types';

function serializableMapFactory<
	K extends boolean | number | bigint | string,
	V extends Serializable
>(): SerializableMap<K, V> {
	return new SerializableMap<K, V>();
}
@Serializable
export default class SerializableMap<
		K extends boolean | number | bigint | string,
		V extends Serializable = Serializable
	>
	extends Map<K, V>
	implements Serializable<SerializedMap>, Deserializable<SerializedMap, SerializableMap<K, V>>
{
	static from<K extends boolean | number | bigint | string, V extends Serializable>(
		map: Map<K, V>
	): SerializableMap<K, V> {
		const sm = serializableMapFactory<K, V>();
		map.forEach((obj, key) => {
			sm.set(key, obj);
		});
		return sm;
	}

	// built-in methods will use this as the constructor
	static get [Symbol.species](): MapConstructor {
		return Map;
	}

	public serialize(): SerializedMap {
		const map = new Map();
		this.forEach((obj, key) => {
			map.set(key, obj.serialize());
		});
		const obj = {
			_map: map,
		};
		return obj;
	}

	public deserialize(obj: SerializedMap, deserializer: Deserializer): SerializableMap<K, V> {
		const sm = new Map();
		obj._map.forEach((value, key) => {
			sm.set(key, deserializer.deserialize(value));
		});
		return SerializableMap.from(sm);
	}
}
