import Deserializer from '../Deserializer';
import { Serializable } from '../decorators';
import { Serialized } from '../types';

export default class DeserializableIterable<T extends Serialized = Serialized>
	implements AsyncIterableIterator<Serializable>
{
	private done: boolean;

	constructor(private iterator: AsyncIterator<Serialized, Serialized>, private deserializer: Deserializer) {
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
		const obj = this.deserializer.deserialize(serialObj);
		return {
			done: false,
			value: obj,
		};
	}

	async return?(serialObj?: T): Promise<IteratorResult<Serializable>> {
		this.done = true;
		if (this.iterator.return) {
			const next = await this.iterator.return(serialObj);
			return {
				done: this.done,
				value: next.value ? this.deserializer.deserialize(next.value) : undefined,
			};
		} else {
			return {
				done: this.done,
				value: undefined,
			};
		}
	}
}
