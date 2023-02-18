import { randomUUID as v4 } from 'crypto';
import { ReviverCtx, SerializeCtx, Serialized, SerializedSet } from './types';
import Serializable from './decorators/serializable';
import { hashCd } from './utils';
import SerialSymbol from './serial-symbol';

function serialSetFactory<T extends Serializable>(set?: Set<T>): SerialSet<T> {
	return new SerialSet<T>(set);
}

@Serializable(SerialSymbol.serialSet)
export default class SerialSet<T extends Serializable> implements Serializable<SerializedSet> {
	private id = v4();
	private set: Set<T>;

	constructor(set?: Set<T>) {
		this.set = set ? set : new Set<T>();
	}

	public serialize?(ctx: SerializeCtx): SerializedSet {
		const arraySet = new Array<Serialized>();
		for (const item of this.set) {
			arraySet.push(ctx.serialize(item, ctx.parentRef));
		}

		const serialObj: SerializedSet = {
			id: this.id,
			['ComSer.set']: arraySet,
		};
		return serialObj;
	}

	static from<T extends Serializable>(set: Set<T>): SerialSet<T> {
		return serialSetFactory<T>(set);
	}

	static toSet<T extends Serializable>(sa: SerialSet<T>) {
		return sa.set;
	}

	public revive?(obj: SerializedSet, ctx: ReviverCtx) {
		this.id = obj.id;
		for (const item of obj['ComSer.set']) {
			const revived = ctx.revive<T>(item);
			this.set.add(revived as T);
		}
	}

	public hashCode(): number {
		return hashCd(this.id);
	}

	public equals(other: unknown) {
		return other instanceof SerialSet && other.id === this.id;
	}
}
