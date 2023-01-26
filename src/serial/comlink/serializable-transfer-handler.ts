import * as Comlink from 'comlink';
import { Reviver, Serializer } from '..';
import { Serialized } from '../types';
import { Serializable } from '../decorators';
import { isToSerial, isToSerialProxy } from '../utils';
import { isSerializable } from '../decorators/utils';
import { TransferableSerializable } from './types';

export default class SerializableTransferHandler {
	constructor() {}

	public get handler() {
		const handler: Comlink.TransferHandler<TransferableSerializable, Serialized> = {
			canHandle: function (val: any): val is TransferableSerializable {
				if (!val) return false;
				if (isToSerialProxy(val)) return true;
				if (isToSerial(val)) return true;
				if (isSerializable(val)) return true;
				return false;
			},
			serialize: (obj: TransferableSerializable) => {
				let serial: Serializable;
				if (isToSerial(obj)) {
					serial = obj.makeSerial();
				} else if (isToSerialProxy(obj)) {
					serial = obj.makeSerialProxy();
				} else {
					serial = obj as Serializable;
				}
				const serializer = new Serializer();
				const serialized = serializer.serialize(serial);
				return [serialized, serializer.transferable];
			},
			deserialize: (object: Serialized) => {
				const reviver = new Reviver();
				const revived = reviver.revive(object);
				return revived;
			},
		};
		return handler;
	}
}
