import * as Comlink from 'comlink';
import { Deserializer } from '..';
import { Serializable, SerializableObject } from '../decorators';
import { Serialized } from '../types';

export default class TransferHandler {
	constructor(private readonly deserializer: Deserializer) {}
	public getHandler() {
		const comlink: Comlink.TransferHandler<SerializableObject, Serialized> = {
			// We want to use this transfer handler for any objects that have the serializable mixin
			canHandle: function (value: any): value is SerializableObject {
				return value?.isSerializable ?? false;
			},
			serialize: (object: SerializableObject) => {
				const serialized = object.doSerialize();
				return [serialized, []];
			},
			deserialize: (object: Serialized) => {
				const deserialized = this.deserializer.deserialize(object) as SerializableObject;
				return deserialized;
			},
		};
		return comlink;
	}
}
