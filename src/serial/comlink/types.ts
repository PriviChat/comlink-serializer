import { Serializable } from '../decorators';
import { ReviverIterable, SerialIterable, AsyncSerialIterator } from '../iterable';
import { AnyConstructor, Serialized, SerialPrimitive, ToSerialProxy } from '../types';

export interface TransferHandlerRegistration {
	transferClasses: AnyConstructor<Serializable>[];
}

export enum SerialTransferHandlerEnum {
	SerializableTransferHandler = 'ComlinkSerializer.SerializableTransferHandler',
	IterableTransferHandler = 'ComlinkSerializer.IterableTransferHandler',
	LazyTransferHandler = 'ComlinkSerializer.LazyTransferHandler',
}

export type TransferableIterable = ReviverIterable | AsyncSerialIterator;

export type TransferableSerializable<T extends Serializable = Serializable> = T | T[] | Map<SerialPrimitive, T>;

export type TransferableSerialProxy = ToSerialProxy;
