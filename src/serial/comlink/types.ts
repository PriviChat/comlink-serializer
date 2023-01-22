import { Serializable } from '../decorators';
import { ReviverIterable, SerialIterable, SerialIterableWrap } from '../iterable';
import { AnyConstructor, Serialized } from '../types';

export interface TransferHandlerRegistration {
	transferClasses: AnyConstructor<Serializable>[];
}

export enum SerialTransferHandlerEnum {
	SerializableTransferHandler = 'ComlinkSerializer.SerializableTransferHandler',
	IterableTransferHandler = 'ComlinkSerializer.IterableTransferHandler',
	LazyTransferHandler = 'ComlinkSerializer.LazyTransferHandler',
}

export type TransferableIterable<S extends Serialized = Serialized, T extends Serializable<S> = Serializable<S>> =
	| ReviverIterable<S, T>
	| SerialIterableWrap<S, T>;
