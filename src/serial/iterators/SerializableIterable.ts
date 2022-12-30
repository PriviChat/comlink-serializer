import { Serializable } from '../decorators';
import SerialSymbol from '../SerialSymbol';

export default class SerializableIterable<T extends Serializable = Serializable> implements AsyncIterableIterator<any> {
	private done: boolean;
	private iterator: Iterator<T, T>;

	constructor(iterable: Iterable<T> | AsyncIterable<T>) {
		if (Symbol.iterator in iterable) {
			this.iterator = (iterable as any)[Symbol.iterator]();
		} else if (Symbol.asyncIterator in iterable) {
			this.iterator = (iterable as any)[Symbol.asyncIterator]();
		} else {
			throw TypeError('Iterable or AsyncIterable object does not have an iterator.');
		}
		this.done = false;
	}

	[Symbol.asyncIterator](): AsyncIterableIterator<any> {
		return this;
	}

	public async next(...args: [] | [undefined]): Promise<IteratorResult<any>> {
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

	public async return(value?: T): Promise<IteratorResult<any>> {
		this.done = true;
		return {
			done: this.done,
			value: value ? value.serialize() : undefined,
		};
	}
}
