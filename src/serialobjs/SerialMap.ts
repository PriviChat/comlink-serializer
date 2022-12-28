import { Serializable, Deserializable } from '../serial/decorators';
import { Deserializer } from '../serial';
import { SerializedMap } from './types';

function serialMapFactory<K extends boolean | number | bigint | string, V extends Serializable>(): SerialMap<K, V> {
	return new SerialMap<K, V>();
}
@Serializable({ name: 'SerialMap' })
export default class SerialMap<K extends boolean | number | bigint | string, V extends Serializable = Serializable>
	extends Map<K, V>
	implements Serializable<SerializedMap>, Deserializable<SerializedMap, SerialMap<K, V>>
{
	static from<K extends boolean | number | bigint | string, V extends Serializable>(map: Map<K, V>): SerialMap<K, V> {
		const sm = serialMapFactory<K, V>();
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

	public deserialize(obj: SerializedMap, deserializer: Deserializer): SerialMap<K, V> {
		const sm = new Map();
		obj._map.forEach((value, key) => {
			sm.set(key, deserializer.deserialize(value));
		});
		return SerialMap.from(sm);
	}
}
