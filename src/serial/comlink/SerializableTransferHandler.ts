import * as Comlink from 'comlink';
import { Reviver } from '..';
import { Serializable, SerializableObject } from '../decorators';
import { Serialized } from '../types';
import SerialSymbol from '../SerialSymbol';

export default class SerializableTransferHandler {
	constructor() {}
	public get handler() {
		const comlink: Comlink.TransferHandler<Serializable, Serialized> = {
			canHandle: function (value: any): value is SerializableObject<Serialized, Serializable> {
				return (value && !value[SerialSymbol.serializableLazy] && value[SerialSymbol.serializable]) ?? false;
			},
			serialize: (object: SerializableObject<Serialized, Serializable>) => {
				const serialized = object.serialize();
				return [serialized, []];
			},
			deserialize: (object: Serialized) => {
				const reviver = new Reviver();
				const revived = reviver.revive(object);
				return revived;
			},
		};
		return comlink;
	}
}
