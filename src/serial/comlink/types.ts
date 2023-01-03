import Serializable from '../decorators/Serializable';
import { AnySerialIterable, AsyncReviverIterable } from '../iterable';
import { AnyConstructor, Serialized } from '../types';

export interface TransferHandlerRegistration {
	transferClasses: AnyConstructor<Serializable>[];
}

export enum SerialTransferHandlers {
	SerializableTransferHandler = 'ComlinkSerializer.SerializableTransferHandler',
	IterableTransferHandler = 'ComlinkSerializer.IterableTransferHandler',
}

export type TransferableIterable<S extends Serialized = Serialized, T extends Serializable<S> = Serializable<S>> =
	| AnySerialIterable<T>
	| AsyncReviverIterable<S>;
