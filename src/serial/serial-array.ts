import stringHash from 'string-hash';
import { ReviverCtx, SerializeCtx, SerializedArray } from './types';
import Serializable from './decorators/serializable';

function serialArrayFactory<T extends Serializable>(array?: T[]): SerialArray<T> {
	return new SerialArray<T>(array);
}

@Serializable(SerialArray.classToken)
export default class SerialArray<T extends Serializable> implements Serializable<SerializedArray> {
	static readonly classToken: unique symbol = Symbol('ComSer.serialArray');
	private array: Array<T>;

	constructor(array?: T[]) {
		this.array = array ? array : new Array<T>();
	}

	public serialize?(ctx: SerializeCtx): SerializedArray {
		const serialObj: SerializedArray = {
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
		for (const item of obj['ComSer.array']) {
			const revived = ctx.revive<T>(item);
			this.array.push(revived as T);
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
