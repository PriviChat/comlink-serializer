import Reviver from '../Reviver';
import { Serializable } from '../decorators';
import { Serialized } from '../types';
import MessageChannelIterable from './message-channel-iterable';

export default class ReviverIterable<S extends Serialized = Serialized>
	extends MessageChannelIterable<S>
	implements AsyncIterableIterator<Serializable>
{
	private done: boolean;
	private iterator?: AsyncIterator<S>;

	constructor(port: MessagePort, private reviver: Reviver) {
		super(port, 'wrap');
		this.done = false;
	}

	[Symbol.asyncIterator](): AsyncIterableIterator<Serializable> {
		return this;
	}

	protected settIterator(iterator: AsyncIterableIterator<S>) {
		this.iterator = iterator;
	}

	async next(...args: [] | [undefined]): Promise<IteratorResult<Serializable>> {
		if (!this.iterator) throw new TypeError('Reviver iterator has not been set.');

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
		if (!this.iterator) throw new TypeError('Reviver iterator has not been set.');

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
