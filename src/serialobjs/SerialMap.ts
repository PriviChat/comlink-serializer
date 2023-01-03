import { Serializable } from '../serial/decorators';
import { Reviver, Serialized, SerialPrimitive } from '../serial';
import { SerializedMap } from './types';
import { hash } from '@comlink-serializer';

function serialMapFactory<K extends SerialPrimitive, V extends Serializable>(...args: any[]): SerialMap<K, V> {
	return new SerialMap<K, V>(...args);
}
@Serializable({ class: 'SerialMap' })
export default class SerialMap<K extends SerialPrimitive, V extends Serializable = Serializable>
	extends Map<K, V>
	implements Serializable<SerializedMap>
{
	static from<K extends SerialPrimitive, V extends Serializable>(map: Map<K, V>): SerialMap<K, V> {
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
		const serialObj: SerializedMap = { $map: {} };
		this.forEach((obj, key) => {
			serialObj.$map[key as K] = obj.serialize();
		});
		return serialObj;
	}

	public revive?(serialObj: SerializedMap, reviver: Reviver) {
		for (const key in serialObj.$map) {
			const value = reviver.revive(serialObj.$map[key]);
			this.set(key as K, value as V);
		}
	}

	public equals(other: unknown): boolean {
		//TODO update to figure out how to check for array equality
		return other instanceof SerialMap;
	}

	public hashCode(): number {
		//TODO update to figure out how to hash equality. It probably needs to be recalculated as items are added.
		return hash('ABCDEFT');
	}
}
