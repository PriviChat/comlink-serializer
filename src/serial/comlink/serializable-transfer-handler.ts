import * as Comlink from 'comlink';
import { ReviveType, Reviver, Serializer } from '..';
import { Serialized } from '../types';
import SerialSymbol from '../serial-symbol';
import { toSerializable } from '../utils';
import { Serializable } from '../decorators';

export default class SerializableTransferHandler {
	constructor() {}

	public get handler() {
		const comlink: Comlink.TransferHandler<ReviveType, Serialized> = {
			canHandle: function (value: any): value is Serializable {
				if (!value) return false;
				if (value[SerialSymbol.serialLazy]) return false;
				if (value[SerialSymbol.serializable]) return true;
				if (value[SerialSymbol.serial]) return true;
				return false;
			},
			serialize: (object: any) => {
				const serializer = new Serializer();
				const converted = toSerializable(object);
				const serialized = serializer.serialize(converted);
				return [serialized, serializer.transferable];
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
