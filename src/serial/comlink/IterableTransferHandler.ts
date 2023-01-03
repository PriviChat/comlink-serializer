import * as Comlink from 'comlink';
import Reviver from '../Reviver';
import { ReviverIterable, IteratorMessageType, SerialIterable, AnySerialIterable } from '../iterable';
import { Serialized } from '../types';
import { TransferableIterable } from './types';
import SerialSymbol from '../SerialSymbol';

export default class IteratorTransferHandler {
	constructor() {}

	private exposeIterable = async (iterable: SerialIterable, port: MessagePort) => {
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

	private wrapIterable = (port: MessagePort) => {
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
		const comlink: Comlink.TransferHandler<TransferableIterable, Transferable> = {
			canHandle: function (value: any): value is TransferableIterable {
				return (value && value[SerialSymbol.serializableIterable]) ?? false;
			},
			serialize: (iterable: SerialIterable) => {
				const { port1, port2 } = new MessageChannel();
				this.exposeIterable(iterable, port1);
				return [port2, [port2]];
			},
			deserialize: (port: MessagePort) => {
				port.start();
				const wrapped = this.wrapIterable(port);
				const iterator = new ReviverIterable(wrapped, new Reviver());
				return iterator;
			},
		};
		return comlink;
	}
}
