import { Serialized } from '../types';
import { IteratorMessageType } from './types';

export default abstract class MessageChannelIterable<T> {
	constructor(port: MessagePort, type: 'wrap' | 'expose') {
		if (type === 'expose') {
			this.expose(port);
		} else {
			this.wrap(port);
		}
	}

	protected getIterator?(): AsyncIterableIterator<T>;
	protected setIterator?(itr: AsyncIterableIterator<Serialized>): void;

	private wrap = (port: MessagePort) => {
		const iterator: AsyncIterableIterator<Serialized> = {
			[Symbol.asyncIterator](): AsyncIterableIterator<Serialized> {
				return this;
			},

			next: function (...args: [] | [undefined]): Promise<IteratorResult<Serialized, Serialized>> {
				port.postMessage({ type: IteratorMessageType.Next, ...args });
				return new Promise<IteratorResult<Serialized, Serialized>>((resolve) => {
					port.onmessage = ({ data }) => {
						resolve(data);
					};
				});
			},

			return: function (serialObj?: Serialized): Promise<IteratorResult<Serialized, Serialized>> {
				port.postMessage({ type: IteratorMessageType.Return, serialObj });
				return new Promise<IteratorResult<Serialized, Serialized>>((resolve) => {
					port.onmessage = ({ data }) => {
						resolve(data);
					};
				});
			},
		};
		if (this.setIterator) this.setIterator(iterator);
	};

	private expose = (port: MessagePort) => {
		port.onmessage = async ({ data: { type, value } }) => {
			if (this.getIterator) {
				const itr = this.getIterator();
				switch (type) {
					case IteratorMessageType.Next:
						port.postMessage(await itr.next(value));
						break;
					case IteratorMessageType.Return:
						if (itr.return) {
							port.postMessage(await itr.return(value));
						}
						break;
					case IteratorMessageType.Throw:
						//port.postMessage(await iterator.throw(value));
						break;
					default:
						return;
				}
			}
		};
	};
}
