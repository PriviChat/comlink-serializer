import * as Comlink from 'comlink';
import Deserializer from '../Deserializer';
import { AsyncSerialIterable, DeserializableIterable, IteratorMessageType, SerializableIterable } from '../iterators';
import { Serialized } from '../types';

export default class IteratorTransferHandler {
	constructor(readonly deserializer: Deserializer) {}

	private exposeIterator = async (iterable: SerializableIterable, port: MessagePort) => {
		port.onmessage = async ({ data: { type, value } }) => {
			switch (type) {
				case IteratorMessageType.Next:
					port.postMessage(await iterable.next(value));
					break;
				case IteratorMessageType.Return:
					port.postMessage(await iterable.return(value));
					break;
				case IteratorMessageType.Throw:
					//port.postMessage(await iterator.throw(value));
					break;
				default:
					return;
			}
		};
	};

	private wrapIterator = (port: MessagePort) => {
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
		return iterator;
	};

	public get handler() {
		const comlink: Comlink.TransferHandler<SerializableIterable | DeserializableIterable, Transferable> = {
			canHandle: function (value: any): value is SerializableIterable {
				return value instanceof SerializableIterable ?? false;
			},
			serialize: (iterable: SerializableIterable) => {
				const { port1, port2 } = new MessageChannel();
				this.exposeIterator(iterable, port1);
				return [port2, [port2]];
			},
			deserialize: (port: MessagePort) => {
				port.start();
				const wrapped = this.wrapIterator(port);
				const iterator = new DeserializableIterable(wrapped, this.deserializer);
				return iterator;
			},
		};
		return comlink;
	}
}
