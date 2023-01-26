import * as Comlink from 'comlink';
import { ReviverIterable, AsyncSerialIterator, SerialIterable } from '../iterable';
import { TransferableIterable } from './types';
import Reviver from '../reviver';
import { isAsyncSerialIterator } from '../iterable/utils';
import Serializer from '../serializer';

export default class IteratorTransferHandler {
	constructor() {}

	public get handler() {
		const comlink: Comlink.TransferHandler<TransferableIterable, Transferable> = {
			canHandle: function (value: any): value is AsyncSerialIterator {
				return isAsyncSerialIterator(value);
			},
			serialize: (asi: AsyncSerialIterator) => {
				const iterable = new SerialIterable(asi, new Serializer());
				const port2 = iterable.port;
				return [port2, [port2]];
			},
			deserialize: (port2: MessagePort) => {
				const iterable = new ReviverIterable(port2, new Reviver());
				port2.start();
				return iterable;
			},
		};
		return comlink;
	}
}
