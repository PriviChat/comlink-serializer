/* import * as Comlink from 'comlink';
import { isToSerialProxy } from '../utils';
import { TransferableSerialProxy } from './types';
import { ToSerialProxy } from '..';
import { Serializable } from '../decorators';

export default class ProxyTransferHandler {
	constructor() {}
	public get handler() {
		const handler: Comlink.TransferHandler<TransferableSerialProxy | Comlink.Remote<Serializable>, Transferable> = {
			canHandle: function (val: any): val is ToSerialProxy {
				if (!val) return false;
				if (isToSerialProxy(val)) return true;
				return false;
			},
			serialize: (obj: ToSerialProxy) => {
				const proxy = obj.makeSerialProxy();
				const port2 = proxy.return[(port2, [port2])];
			},
			deserialize: (port2: MessagePort) => {
				port2.start();
				const proxy = Comlink.wrap<Serializable>(port2);
				return proxy;
			},
		};
		return handler;
	}
} */
