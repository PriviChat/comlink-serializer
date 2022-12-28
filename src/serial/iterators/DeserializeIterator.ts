import Deserializer from '../Deserializer';
import SerialSymbol from '../SerialSymbol';
import { Serializable } from '../decorators';
import { Serialized } from '../types';
import { IteratorMessageType } from './types';

export default class DeserializeIterator<T extends Serialized = Serialized>
	implements AsyncIterableIterator<Serializable>
{
	[SerialSymbol.iterator] = true;
	private done: boolean;

	constructor(private port: MessagePort, private deserializer: Deserializer) {
		this.done = false;
	}

	[Symbol.asyncIterator](): AsyncIterableIterator<Serializable> {
		return this;
	}

	private awaitNext = async () => {
		return new Promise<IteratorResult<Serialized, Serialized>>((resolve) => {
			this.port.onmessage = ({ data }) => {
				resolve(data);
			};
		});
	};

	async next(...args: [] | [undefined]): Promise<IteratorResult<Serializable>> {
		if (this.done) {
			return {
				done: this.done,
				value: undefined,
			};
		}

		this.port.postMessage({ type: IteratorMessageType.Next, ...args });
		const next = await this.awaitNext();

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
		this.port.postMessage({ type: IteratorMessageType.Return, serialObj });
		const next = await this.awaitNext();
		this.done = true;
		return {
			done: this.done,
			value: next.value ? this.deserializer.deserialize(next.value) : undefined,
		};
	}
}
