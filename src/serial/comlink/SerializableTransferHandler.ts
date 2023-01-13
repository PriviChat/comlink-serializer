import * as Comlink from 'comlink';
import { Reviver, Serializer } from '..';
import { Serializable, SerializableObject } from '../decorators';
import { Serialized } from '../types';
import SerialSymbol from '../SerialSymbol';

export default class SerializableTransferHandler {
	constructor() {}

	public get handler() {
		const comlink: Comlink.TransferHandler<Serializable, Serialized> = {
			canHandle: function (value: any): value is SerializableObject {
				return (value && !value[SerialSymbol.serializableLazy] && value[SerialSymbol.serializable]) ?? false;
			},
			serialize: (object: SerializableObject) => {
				const serializer = new Serializer();
				const serialized = object.serialize(serializer);
				return [serialized, serializer.transfers];
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
