import { Serializable } from '../decorators';
import { Serialized, SerialPrimitive } from '../types';

export type SerialIterType<T extends Serializable = Serializable> = T | [SerialPrimitive, T];
export type ReviveIterType<S extends Serialized = Serialized> = S | [SerialPrimitive, S];
export type AnySerialIterator<SI extends SerialIterType = SerialIterType> = AsyncIterator<SI> | Iterator<SI>;

export interface SerializedIterableProxy extends Serialized {
	id: string;
	port: MessagePort;
}

export interface SerializedIteratorResult<S extends Serialized = Serialized> extends Serialized {
	id: string;
	result: S | [SerialPrimitive, S] | undefined;
	done: boolean;
}
