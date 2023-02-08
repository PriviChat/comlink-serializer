import { v4 as uuid } from 'uuid';
import { hashCd } from '../utils';
import { ReviverCtx, SerializeCtx, SerialPrimitive } from '..';
import { Revivable, Serializable } from '../decorators';
import SerialSymbol from '../serial-symbol';
import { SerializedIteratorResult } from './types';

@Serializable(SerialSymbol.serialIteratorResult)
export default class SerialIteratorResult<T extends Serializable = Serializable>
	implements Serializable<SerializedIteratorResult>, Revivable<SerializedIteratorResult>
{
	private id = uuid();
	private result?: T | [SerialPrimitive, T];
	private done: boolean;

	constructor(result: T | [SerialPrimitive, T], done: boolean) {
		this.result = result;
		this.done = done;
	}

	static toIteratorResult<T extends Serializable>(
		sir: SerialIteratorResult<T>
	): IteratorResult<T | [SerialPrimitive, T] | undefined> {
		return {
			value: sir.result,
			done: sir.done,
		};
	}

	serialize?(ctx: SerializeCtx): SerializedIteratorResult {
		if (!this.result) {
			return {
				id: this.id,
				result: undefined,
				done: this.done,
			};
		} else if (Array.isArray(this.result)) {
			return {
				id: this.id,
				result: [this.result[0], ctx.serialize(this.result[1], ctx.parentRef)],
				done: this.done,
			};
		} else {
			return {
				id: this.id,
				result: ctx.serialize(this.result, ctx.parentRef),
				done: this.done,
			};
		}
	}

	/**
	 * If the result is an array, then the first element is the key and the second element is the value
	 * @param {SerializedIteratorResult} serialObj - The serialized object that was sent from the other
	 * side.
	 * @param {ReviverCtx} ctx - ReviverCtx - This is the context object that is passed to the reviver
	 * function.
	 */
	public revive?(serialObj: SerializedIteratorResult, ctx: ReviverCtx) {
		this.id = serialObj.id;
		const result = serialObj.result;
		if (!result) {
			this.result = undefined;
			this.done = serialObj.done;
		} else if (Array.isArray(result)) {
			const key = result[0];
			const val = ctx.revive(result[1]) as T;
			this.result = [key, val];
			this.done = serialObj.done;
		} else {
			this.result = ctx.revive(result) as T;
			this.done = serialObj.done;
		}
	}

	equals(other: unknown): boolean {
		return other instanceof SerialIteratorResult && other.id === this.id;
	}

	hashCode(): number {
		return hashCd(this.id);
	}
}
