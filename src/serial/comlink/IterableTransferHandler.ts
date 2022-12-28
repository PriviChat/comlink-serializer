import * as Comlink from 'comlink';
import { IterableObject } from '../../serialobjs';
import Deserializer from '../Deserializer';
import { IteratorMessageType } from '../iterators';
import DeserializeIterator from '../iterators/DeserializeIterator';
import SerialSymbol from '../SerialSymbol';

export default class IterableTransferHandler {
	constructor() {}

	private expose = async (iterator: Iterator<any>, port: MessagePort) => {
		port.onmessage = async ({ data: { type, value } }) => {
			switch (type) {
				case IteratorMessageType.Next:
					port.postMessage(await iterator.next(value));
					break;
				case IteratorMessageType.Return:
					port.postMessage(await iterator.return(value));
					break;
				case IteratorMessageType.Throw:
					port.postMessage(await iterator.throw(value));
					break;
				default:
					return;
			}
		};
	};

	public get handler() {
		const comlink: Comlink.TransferHandler<Comlink.Remote<IterableObject> | IterableObject, Transferable> = {
			canHandle: function (value: any): value is IterableObject {
				return value[SerialSymbol.iterable];
			},
			serialize: (obj: IterableObject) => {
				const { port1, port2 } = new MessageChannel();
				// mark and expose the object on the port
				Comlink.expose(Comlink.proxy(obj), port1);
				const iterator = obj[SerialSymbol.iterator]();
				this.expose(iterator, port1);
				return [port2, [port2]];
			},
			deserialize: (port: MessagePort) => {
				port.start();
				const remote = Comlink.wrap<IterableObject>(port);
				const iterator = new DeserializeIterator(port, new Deserializer());
				const proxy = new Proxy(remote, {
					get: (target, prop, receiver) => {
						if (prop === Symbol.asyncIterator) {
							return () => iterator;
						} else {
							return Reflect.get(target, prop, receiver);
						}
					},
				});
				return proxy;
			},
		};
		return comlink;
	}
}
