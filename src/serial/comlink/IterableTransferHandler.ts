import * as Comlink from 'comlink';
import Reviver from '../Reviver';
import { ReviverIterable, IteratorMessageType, SerialIterable } from '../iterable';
import { Serialized } from '../types';
import { TransferableIterable } from './types';
import SerialSymbol from '../SerialSymbol';

export default class IteratorTransferHandler {
	constructor() {}

	public get handler() {
		const comlink: Comlink.TransferHandler<TransferableIterable, Transferable> = {
			canHandle: function (value: any): value is TransferableIterable {
				return (value && value[SerialSymbol.serializableIterable]) ?? false;
			},
			serialize: (iterable: SerialIterable) => {
				const { port2 } = iterable.channel;
				return [port2, [port2]];
			},
			deserialize: (port2: MessagePort) => {
				const itr = new ReviverIterable(port2, new Reviver());
				port2.start();
				return itr;
				/* return new Proxy(itr, {
					get(target, prop, receiver) {
						if(typeof prop === 'symbol' && prop === Symbol.asyncIterator) {
							return () => itr[Symbol.asyncIterator]();
						}	
					}
				}) */
			},
		};
		return comlink;
	}
}
