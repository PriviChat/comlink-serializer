import { randomUUID as v4 } from 'crypto';
import {
	SerialPrimitive,
	SerializedMap,
	serialPrimitives,
	SerializeCtx,
	SerializedKeyType,
	ReviverCtx,
	supportedMapKeys,
} from './types';
import Serializable from './decorators/serializable';
import { hashCd, isSerialPrimitive } from './utils';
import { isSerializable } from './decorators/utils';
import SerialSymbol from './serial-symbol';

function serialMapFactory<K extends SerialPrimitive, V extends Serializable>(map: Map<K, V>): SerialMap<K, V> {
	return new SerialMap<K, V>(map);
}

@Serializable(SerialSymbol.serialMap)
export default class SerialMap<K extends SerialPrimitive, V extends Serializable = Serializable>
	implements Serializable<SerializedMap>
{
	private id = v4();
	private map: Map<K, V>;

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
		let keyType: SerializedKeyType | undefined;
		const size = this.map.size;
		if (size) {
			const key = this.map.keys().next().value;
			const entry = this.map.entries().next().value;
			if (!isSerialPrimitive(key)) {
				const err = `ERR_UNSUPPORTED_TYPE: Map contains an unsupported key: ${key} of type: ${typeof key} with entry: ${JSON.stringify(
					entry
				)}. Supported key types: ${supportedMapKeys}.`;
				console.error(err);
				throw new TypeError(err);
			}
			keyType = (typeof key).valueOf() as SerializedKeyType;
		}

		const serialObj: SerializedMap = {
			id: this.id,
			['ComSer.size']: size,
			['ComSer.keyType']: keyType,
			['ComSer.map']: [],
		};
		this.map.forEach((entry, key) => {
			if (typeof key.valueOf() !== keyType) {
				const supported = Array.from(serialPrimitives).join(', ');
				const err = `ERR_UNSUPPORTED_TYPE: Map contains a key: ${key} of type: ${typeof key} but expected type: ${keyType}. Key is mapped to entry: ${JSON.stringify(
					entry
				)}. Supported key types: ${supported}. All keys must be of the same supported type ${keyType}.`;
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
			serialObj['ComSer.map'].push([key.toString(), ctx.serialize(entry, ctx.parentRef)]);
		});

		return serialObj;
	}

	public revive?(serialObj: SerializedMap, ctx: ReviverCtx) {
		this.id = serialObj.id;
		if (serialObj['ComSer.size']) {
			const keyType = serialObj['ComSer.keyType'];
			for (const [serKey, serVal] of serialObj['ComSer.map']) {
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

	public hashCode(): number {
		return hashCd(this.id);
	}

	public equals(other: unknown) {
		return other instanceof SerialMap && other.id === this.id;
	}
}
