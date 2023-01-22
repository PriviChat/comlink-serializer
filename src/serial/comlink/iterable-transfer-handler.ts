import * as Comlink from 'comlink';
import { ReviverIterable, SerialIterableWrap } from '../iterable';
import { TransferableIterable } from './types';
import Reviver from '../reviver';
import { isSerialIterableWrap } from '../iterable/utils';

export default class IteratorTransferHandler {
	constructor() {}

	public get handler() {
		const comlink: Comlink.TransferHandler<TransferableIterable, Transferable> = {
			canHandle: function (value: any): value is SerialIterableWrap {
				if (!value) return false;
				if (isSerialIterableWrap(value)) return true;
				return false;
			},
			serialize: (wrap: SerialIterableWrap) => {
				const iterable = wrap.serialIterable;
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
