import stringHash from 'string-hash';
import { ReviverCtx, SerializeCtx, SerializedArray } from './types';
import Serializable from './decorators/serializable';
import SerialSymbol from './serial-symbol';

function serialArrayFactory<T extends Serializable>(arr?: T[]): SerialArray<T> {
	return new SerialArray<T>(arr);
}

@Serializable(SerialArray.classToken)
export default class SerialArray<T extends Serializable> implements Serializable<SerializedArray> {
	static readonly classToken: unique symbol = Symbol('ComSer.serialArray');
	private arr: Array<T>;

	constructor(arr?: T[]) {
		this.arr = arr ? arr : new Array<T>();
	}

	public serialize?(ctx: SerializeCtx): SerializedArray {
		const serialObj: SerializedArray = {
			$array: this.arr ? this.arr.map((item) => ctx.serialize(item, ctx.parentRef)) : [],
		};
		return serialObj;
	}

	static from<T extends Serializable>(arr: Array<T>): SerialArray<T> {
		return serialArrayFactory<T>(arr);
	}

	static toArray<T extends Serializable>(sa: SerialArray<T>) {
		return sa.arr;
	}

	public revive?(obj: SerializedArray, ctx: ReviverCtx) {
		for (const item of obj.$array) {
			const revived = ctx.revive<T>(item);
			this.arr.push(revived as T);
		}
	}

	public equals(other: unknown): boolean {
		//TODO update to figure out how to check for array equality
		return other instanceof SerialArray;
	}

	public hashCode(): number {
		//TODO update to figure out how to hash equality. It probably needs to be recalculated as items are added.
		return stringHash('ABCDEFT');
	}
}
