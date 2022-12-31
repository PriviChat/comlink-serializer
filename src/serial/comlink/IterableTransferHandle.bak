/* import * as Comlink from 'comlink';
import { IterableObject } from '../../serialobjs';
import Deserializer from '../Deserializer';
import { IteratorMessageType, DeserializableIterator } from '../iterators';
import SerialSymbol from '../SerialSymbol';

export default class IterableTransferHandler {
	constructor(readonly deserializer: Deserializer) {}

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
				return (value && value[SerialSymbol.iterable]) ?? false;
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
				const iterator = new DeserializableIterator(port, this.deserializer);
				const proxy = new Proxy(remote, {
					get: (target, prop, receiver) => {
						if (prop === Symbol.asyncIterator) {
							return () => iterator;
						} else {
							const refProp = Reflect.get(target, prop, receiver);
							return refProp;
						}
					},
				});
				return proxy;
			},
		};
		return comlink;
	}
} */
