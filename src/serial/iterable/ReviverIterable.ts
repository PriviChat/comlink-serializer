import Reviver from '../Reviver';
import { Serializable } from '../decorators';
import { Serialized } from '../types';
import { AsyncReviverIterable } from './types';

export default class ReviverIterable<S extends Serialized = Serialized> implements AsyncIterableIterator<Serializable> {
	private done: boolean;
	private iterator: AsyncIterator<S>;

	constructor(iterable: AsyncReviverIterable<S>, private reviver: Reviver) {
		this.iterator = iterable[Symbol.asyncIterator]();
		this.done = false;
	}

	[Symbol.asyncIterator](): AsyncIterableIterator<Serializable> {
		return this;
	}

	async next(...args: [] | [undefined]): Promise<IteratorResult<Serializable>> {
		if (this.done) {
			return {
				done: this.done,
				value: undefined,
			};
		}

		const next = await this.iterator.next(...args);

		if (next.done) {
			this.done = true;
			return {
				done: this.done,
				value: undefined,
			};
		}

		const serialObj = next.value;
		const obj = this.reviver.revive(serialObj);
		return {
			done: false,
			value: obj,
		};
	}

	async return?(serialObj?: S): Promise<IteratorResult<Serializable>> {
		this.done = true;
		if (this.iterator.return) {
			const next = await this.iterator.return(serialObj);
			return {
				done: this.done,
				value: next.value ? this.reviver.revive(next.value) : undefined,
			};
		} else {
			return {
				done: this.done,
				value: undefined,
			};
		}
	}
}
