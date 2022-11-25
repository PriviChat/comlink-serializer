import { Serializable } from '../serial';
import { ObjectRegistry } from '../registry';
import { SerializedMap } from './types';

@Serializable<SerializedMap, SerializableMap>()
export class SerializableMap<K extends Serializable = Serializable, V extends Serializable = Serializable> extends Map<
	K,
	V
> {
	static readonly _SCLASS = '8ee63271-ed37-40ac-8f34-aca039c8ab9e';

	serialize(): SerializedMap {
		const map = new Map();
		this.forEach((obj, key) => {
			map.set(key.serialize(), obj.serialize());
		});
		const obj = {
			_SCLASS: SerializableMap._SCLASS,
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
			const keyEntry = ObjectRegistry.get().getEntry(key._SCLASS);
			const objEntry = ObjectRegistry.get().getEntry(value._SCLASS);
			sm.set(keyEntry.constructor.deserialize(key), objEntry.constructor.deserialize(value));
		});
		return sm;
	}
}
