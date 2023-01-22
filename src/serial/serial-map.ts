import stringHash from 'string-hash';
import {
	SerialPrimitive,
	SerializedMap,
	serialPrimitives,
	SerializeCtx,
	SerializedMapKeyType,
	ReviverCtx,
	supportedMapKeys,
} from './types';
import Serializable from './decorators/serializable';
import { isSerialPrimitive } from './utils';
import { isSerializable } from './decorators/utils';

function serialMapFactory<K extends SerialPrimitive, V extends Serializable>(map: Map<K, V>): SerialMap<K, V> {
	return new SerialMap<K, V>(map);
}

@Serializable(SerialMap.classToken)
export default class SerialMap<K extends SerialPrimitive, V extends Serializable = Serializable>
	implements Serializable<SerializedMap>
{
	private map: Map<K, V>;
	static readonly classToken: unique symbol = Symbol('ComSer.serialMap');

	constructor(map?: Map<K, V>) {
		this.map = map ? map : new Map<K, V>();
	}

	[Symbol.iterator]() {
		return this.map[Symbol.iterator]();
	}

	static from<K extends SerialPrimitive, V extends Serializable>(map: Map<K, V>): SerialMap<K, V> {
		return serialMapFactory(map);
	}

	static toMap<K extends SerialPrimitive, T extends Serializable>(sm: SerialMap<K, T>) {
		return sm.map;
	}

	public serialize?(ctx: SerializeCtx): SerializedMap {
		let $keyType: SerializedMapKeyType | undefined;
		let $size = this.map.size;
		if ($size) {
			const key = this.map.keys().next().value;
			const entry = this.map.entries().next().value;
			if (!isSerialPrimitive(key)) {
				const err = `ERR_UNSUPPORTED_TYPE: Map contains an unsupported key: ${key} of type: ${typeof key} with entry: ${JSON.stringify(
					entry
				)}. Supported key types: ${supportedMapKeys}.`;
				console.error(err);
				throw new TypeError(err);
			}
			$keyType = (typeof key).valueOf() as SerializedMapKeyType;
		}

		const serialObj: SerializedMap = { $size, $keyType, $map: [] };
		this.map.forEach((entry, key) => {
			if (typeof key.valueOf() !== $keyType) {
				const supported = Array.from(serialPrimitives).join(', ');
				const err = `ERR_UNSUPPORTED_TYPE: Map contains a key: ${key} of type: ${typeof key} but expected type: ${$keyType}. Key is mapped to entry: ${JSON.stringify(
					entry
				)}. Supported key types: ${supported}. All keys must be of the same supported type ${$keyType}.`;
				console.error(err);
				throw new TypeError(err);
			}
			if (!isSerializable(entry)) {
				const err = `ERR_NOT_SERIALIZABLE: Iterator found a key: ${key} with a value: ${JSON.stringify(
					entry
				)} that is not Serializable.`;
				console.error(err);
				throw TypeError(err);
			}
			serialObj.$map.push([key.toString(), ctx.serialize(entry, ctx.parentRef)]);
		});

		return serialObj;
	}

	public revive?(serialObj: SerializedMap, ctx: ReviverCtx) {
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
				const val = ctx.revive(serVal);
				this.map.set(key as K, val as V);
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
