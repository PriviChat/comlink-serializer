import { isAsyncSerialIterable, isSerialIterable } from '.';
import { Serializable } from '../decorators';
import { isSerializableObject } from '../decorators/utils';
import SerialSymbol from '../SerialSymbol';
import { Serialized } from '../types';
import MessageChannelIterable from './message-channel-iterable';
import { AnySerialIterable } from './types';

export default class SerialIterable<S extends Serialized = Serialized, T extends Serializable<S> = Serializable<S>>
	extends MessageChannelIterable<T>
	implements AsyncIterableIterator<S>
{
	private done: boolean;
	private iterator: Iterator<T> | AsyncIterator<T>;

	constructor(iterable: AnySerialIterable<T>, readonly channel: MessageChannel = new MessageChannel()) {
		super(channel.port1, 'expose');

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

	protected getIterator(): AsyncIterableIterator<any> {
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
		if (!isSerializableObject(value)) {
			const err = `ERR_NOT_SERIALIZABLE: SerialIterator found an value that was not @Serializable. Value: ${JSON.stringify(
				value
			)}`;
			console.error(err);
			throw TypeError(err);
		}
		const serialObj = value.serialize();
		return {
			done: false,
			value: serialObj as S,
		};
	}

	public async return(value?: T): Promise<IteratorResult<S, S | undefined>> {
		this.done = true;
		if (value && !isSerializableObject(value)) {
			const err = `ERR_NOT_SERIALIZABLE: SerialIterator found an value that was not @Serializable. Value: ${JSON.stringify(
				value
			)}`;
			console.error(err);
			throw TypeError(err);
		}
		return {
			done: this.done,
			value: value ? (value.serialize() as S) : undefined,
		};
	}
}
