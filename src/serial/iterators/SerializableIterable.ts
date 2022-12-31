import { Serializable } from '../decorators';
import { Serialized } from '../types';

export default class SerializableIterable<S extends Serialized = Serialized> implements AsyncIterableIterator<S> {
	private done: boolean;
	private iterator: Iterator<any, any>;

	constructor(iterable: Iterable<Serializable> | AsyncIterable<Serializable>) {
		if (Symbol.iterator in iterable) {
			this.iterator = (iterable as any)[Symbol.iterator]();
		} else if (Symbol.asyncIterator in iterable) {
			this.iterator = (iterable as any)[Symbol.asyncIterator]();
		} else {
			throw TypeError('Iterable or AsyncIterable object does not have an iterator.');
		}
		this.done = false;
	}

	[Symbol.asyncIterator](): AsyncIterableIterator<S> {
		return this;
	}

	public async next(...args: [] | [undefined]): Promise<IteratorResult<S, S | undefined>> {
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

		const value = next.value;
		const serialObj = value.serialize();
		return {
			done: false,
			value: serialObj,
		};
	}

	public async return(value?: any): Promise<IteratorResult<S, S | undefined>> {
		this.done = true;
		return {
			done: this.done,
			value: value ? value.serialize() : undefined,
		};
	}
}
