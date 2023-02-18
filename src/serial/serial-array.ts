import crypto from 'crypto';
import { ReviverCtx, SerializeCtx, SerializedArray } from './types';
import Serializable from './decorators/serializable';
import { hashCd } from './utils';
import SerialSymbol from './serial-symbol';

function serialArrayFactory<T extends Serializable>(array?: T[]): SerialArray<T> {
	return new SerialArray<T>(array);
}

@Serializable(SerialSymbol.serialArray)
export default class SerialArray<T extends Serializable> implements Serializable<SerializedArray> {
	private id = crypto.randomUUID();
	private array: Array<T>;

	constructor(array?: T[]) {
		this.array = array ? array : new Array<T>();
	}

	public serialize?(ctx: SerializeCtx): SerializedArray {
		const serialObj: SerializedArray = {
			id: this.id,
			['ComSer.array']: this.array ? this.array.map((item) => ctx.serialize(item, ctx.parentRef)) : [],
		};
		return serialObj;
	}

	static from<T extends Serializable>(arr: Array<T>): SerialArray<T> {
		return serialArrayFactory<T>(arr);
	}

	static toArray<T extends Serializable>(sa: SerialArray<T>) {
		return sa.array;
	}

	public revive?(obj: SerializedArray, ctx: ReviverCtx) {
		this.id = obj.id;
		for (const item of obj['ComSer.array']) {
			const revived = ctx.revive<T>(item);
			this.array.push(revived as T);
		}
	}

	public hashCode(): number {
		return hashCd(this.id);
	}

	public equals(other: unknown) {
		return other instanceof SerialArray && other.id === this.id;
	}
}
