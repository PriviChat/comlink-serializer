import * as Comlink from 'comlink';
import { Deserializer } from '..';
import { Serializable, SerializableObject } from '../decorators';
import { Serialized } from '../types';

export default class SerializableTransferHandler {
	constructor(readonly deserializer: Deserializer) {}
	public get handler() {
		const comlink: Comlink.TransferHandler<Serializable, Serialized> = {
			canHandle: function (value: any): value is SerializableObject {
				return value?.isSerializable ?? false;
			},
			serialize: (object: SerializableObject) => {
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
