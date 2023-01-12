import stringHash from 'string-hash';
import { Serializable } from '../serial/decorators';
import { Reviver, SerialPrimitive, serialPrimitives } from '../serial';
import { SerializedMap, SerializedMapKeyType } from './types';
import { isSerializableObject } from '../serial/decorators/utils';

function serialMapFactory<K extends SerialPrimitive, V extends Serializable>(...args: any[]): SerialMap<K, V> {
	return new SerialMap<K, V>(...args);
}
@Serializable(SerialMap.classToken)
export default class SerialMap<K extends SerialPrimitive, V extends Serializable = Serializable>
	extends Map<K, V>
	implements Serializable<SerializedMap>
{
	static readonly classToken: unique symbol = Symbol('ComSer.serialMap');

	static from<K extends SerialPrimitive, V extends Serializable>(map: Map<K, V>): SerialMap<K, V> {
		const sm = serialMapFactory<K, V>();
		map.forEach((value, key) => {
			if (!serialPrimitives.has(typeof key)) {
				const supported = Array.from(serialPrimitives).join(', ');
				const err = `ERR_UNSUPPORTED_TYPE: Map contains an unsupported key: ${key} of type: ${typeof key} with value: ${JSON.stringify(
					value
				)}. Supported key types: ${supported}.`;
				console.error(err);
				throw new TypeError(err);
			}
			if (!isSerializableObject(value)) {
				const err = `ERR_UNSUPPORTED_TYPE: Map contains an unsupported value: ${JSON.stringify(
					value
				)}. Only values decorated with @Serializable are supported`;
				console.error(err);
				throw new TypeError(err);
			}
			sm.set(key, value);
		});
		return sm;
	}

	// built-in methods will use this as the constructor
	static get [Symbol.species](): MapConstructor {
		return Map;
	}

	public serialize(): SerializedMap {
		let $keyType: SerializedMapKeyType | undefined;
		let $size = this.size;
		if ($size) {
			$keyType = (typeof this.keys().next().value).valueOf() as SerializedMapKeyType;
		}

		const serialObj: SerializedMap = { $size, $keyType, $map: [] };
		this.forEach((obj, key) => {
			if (isSerializableObject(obj)) serialObj.$map.push([key.toString(), obj.serialize()]);
		});

		return serialObj;
	}

	public revive?(serialObj: SerializedMap, reviver: Reviver) {
		if (serialObj.$size) {
			const keyType = serialObj.$keyType;
			for (const [serKey, serVal] of serialObj.$map) {
				let key: SerialPrimitive;
				switch (keyType) {
					case 'boolean':
						key = serKey === 'true' ? true : false;
						break;
					case 'string':
						key = serKey;
						break;
					case 'number':
						key = Number(serKey);
						break;
					case 'bigint':
						key = BigInt(serKey);
						break;
					default:
						key = serKey;
				}
				const val = reviver.revive(serVal);
				this.set(key as K, val as V);
			}
		}
	}

	public equals(other: unknown): boolean {
		//TODO update to figure out how to check for array equality
		return other instanceof SerialMap;
	}

	public hashCode(): number {
		//TODO update to figure out how to hash equality. It probably needs to be recalculated as items are added.
		return stringHash('ABCDEFT');
	}
}
