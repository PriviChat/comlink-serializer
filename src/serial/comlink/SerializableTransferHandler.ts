import * as Comlink from 'comlink';
import { Deserializer } from '..';
import { Serializable, SerializableObject } from '../decorators';
import { Serialized } from '../types';
import SerialSymbol from '../SerialSymbol';

export default class SerializableTransferHandler {
	constructor(readonly deserializer: Deserializer) {}
	public get handler() {
		const comlink: Comlink.TransferHandler<Serializable, Serialized> = {
			canHandle: function (value: any): value is SerializableObject<Serialized, Serializable> {
				return (value && value[SerialSymbol.serializable]) ?? false;
			},
			serialize: (object: SerializableObject<Serialized, Serializable>) => {
				const serialized = object.serialize();
				return [serialized, []];
			},
			deserialize: (object: Serialized) => {
				const deserialized = this.deserializer.deserialize(object);
				return deserialized;
			},
		};
		return comlink;
	}
}
