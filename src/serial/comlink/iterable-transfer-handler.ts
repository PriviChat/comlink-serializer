/* import * as Comlink from 'comlink';
import SerialIterableProxy from '../iterable/serial-iterable-proxy';
import Reviver from '../reviver';
import Serializer from '../serializer';

export default class IteratorTransferHandler {
	constructor() {}

	public get handler() {
		const handler: Comlink.TransferHandler<SerialIterableProxy, Transferable> = {
			canHandle: function (value: any): value is SerialIterableProxy {
				return value instanceof SerialIterableProxy;
			},
			serialize: (proxy: SerialIterableProxy) => {
				const { port1, port2 } = new MessageChannel();
				proxy.expose(port1, new Serializer());
				return [port2, [port2]];
			},
			deserialize: (port2: MessagePort) => {
				const proxy = SerialIterableProxy.wrap(port2, new Reviver());
				port2.start();
				return proxy;
			},
		};
		return handler;
	}
} */
