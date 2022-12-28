import * as Comlink from 'comlink';
import { SerialArray, IterableObject } from '../../serialobjs';
import Deserializer from '../Deserializer';
import { IteratorMessageType } from '../iterators';
import DeserializeIterator from '../iterators/DeserializeIterator';
import SerialSymbol from '../SerialSymbol';
import { Serialized } from '../types';

type SerializedIterator = (Transferable | Transferable[])[];

interface IteratorMessage extends MessageEvent {
	type: IteratorMessageType;
	value: Serialized;
}

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
			}
		};
	};

	public get handler() {
		const comlink: Comlink.TransferHandler<IterableObject, Transferable> = {
			canHandle: function (value: any): value is IterableObject {
				return value[SerialSymbol.iterable];
			},
			serialize: (obj: IterableObject) => {
				const { port1, port2 } = new MessageChannel();
				const registryId = obj[SerialSymbol.registryId];
				const iterator = obj[SerialSymbol.iterator]();
				//port1.postMessage({
				//	type: IteratorMessageType.RegistryId,
				//	value: registryId,
				//});
				this.expose(iterator, port1);
				return [port2, [port2]];
			},
			deserialize: (port: MessagePort) => {
				const array = new SerialArray();
				const iterator = new DeserializeIterator(port, new Deserializer());
				(array as any)[Symbol.asyncIterator] = () => iterator;
				/* const pxy = new Proxy(new SerialArray(), {
					get: (target, prop, receiver) => {
						if (prop === Symbol.asyncIterator) {
							return new DeserializeIterator(port, new Deserializer());
						} else return Reflect.get(target, prop, receiver);
					},
					has: (target, prop) => {
						if (prop === Symbol.asyncIterator) return true;
						else return prop in target;
					},
				});
				return pxy; */
				return array;
			},
		};
		return comlink;
	}
}
