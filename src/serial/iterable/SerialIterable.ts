import { isAsyncSerialIterable, isSerialIterable } from '.';
import { Serializable } from '../decorators';
import SerialSymbol from '../SerialSymbol';
import { Serialized } from '../types';
import { AnySerialIterable } from './types';

export default class SerialIterable<S extends Serialized = Serialized, T extends Serializable<S> = Serializable<S>>
	implements AsyncIterableIterator<S>
{
	private done: boolean;
	private iterator: Iterator<T> | AsyncIterator<T>;

	constructor(iterable: AnySerialIterable<T>) {
		if (isSerialIterable<T>(iterable)) {
			this.iterator = (iterable as any)[Symbol.iterator]();
		} else if (isAsyncSerialIterable<T>(iterable)) {
			this.iterator = iterable[Symbol.asyncIterator]();
		} else {
			throw TypeError('Iterable or AsyncIterable object does not have an iterator.');
		}
		this.done = false;
	}

	[SerialSymbol.serializableIterable] = true;
	[Symbol.asyncIterator](): AsyncIterableIterator<any> {
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

	public async return(value?: T): Promise<IteratorResult<S, S | undefined>> {
		this.done = true;
		return {
			done: this.done,
			value: value ? value.serialize() : undefined,
		};
	}
}
