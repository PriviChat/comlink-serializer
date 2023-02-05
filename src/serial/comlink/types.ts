import * as Comlink from 'comlink';
import { Serializable, SerializableObject } from '../decorators';
import { AnyConstructor, SerialPrimitive, ToSerialProxy } from '../types';

export interface TransferHandlerRegistration {
	transferClasses: AnyConstructor<Serializable>[];
}

export enum SerialTransferHandlerEnum {
	SerializableTransferHandler = 'ComlinkSerializer.SerializableTransferHandler',
}

export type TransferableSerializable<T extends Serializable = Serializable> =
	| T
	| T[]
	| Map<SerialPrimitive, T>
	| Comlink.Remote<SerializableObject<T>>
	| IteratorResult<T | [SerialPrimitive, T]>;

export type TransferableSerialProxy = ToSerialProxy;
