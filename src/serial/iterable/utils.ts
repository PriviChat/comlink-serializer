import { AnySerialIterator, ReviveIterType, SerialIterable, SerialIterableWrap, SerialIterType } from '.';
import { Serialized, SerialPrimitive } from '..';
import { Serializable } from '../decorators';
import SerialSymbol from '../serial-symbol';

export function isSerialIterableWrap(obj: any): obj is SerialIterableWrap {
	if (obj && obj[SerialSymbol.serialIterableWrap]() === true) return true;
	return false;
}

export function serializeIterator<S extends Serialized, T extends Serializable<S>>(
	arr: Array<T>
): AsyncIterableIterator<T>;
export function serializeIterator<S extends Serialized, T extends Serializable<S>, K extends SerialPrimitive>(
	map: Map<K, T>
): AsyncIterableIterator<[K, T]>;
export function serializeIterator<S extends Serialized, T extends Serializable<S>>(
	iterator: AnySerialIterator<T>
): AsyncIterableIterator<AnySerialIterator<T>>;
export function serializeIterator<S extends Serialized, T extends Serializable<S>, K extends SerialPrimitive>(
	obj: Array<T> | Map<K, T> | AnySerialIterator<T>
) {
	if (obj instanceof Array) return wrapSerialIterable(obj.values());
	else if (obj instanceof Map) return wrapSerialIterable(obj.entries());
	return wrapSerialIterable(obj);
}

function wrapSerialIterable<S extends Serialized, T extends Serializable<S>, RI extends ReviveIterType<S>>(
	iterator: AnySerialIterator<T>
): SerialIterableWrap<S, T> {
	const wrapIter: SerialIterableWrap<S, T> = {
		[SerialSymbol.serialIterableWrap]: () => true,
		[Symbol.asyncIterator]: function () {
			return this;
		},
		next: async function (...args: [] | [undefined]): Promise<IteratorResult<SerialIterType<T>, any>> {
			return await iterator.next(...args);
		},
		serialIterable: new SerialIterable<S, T, RI>(iterator),
		[SerialSymbol.serialIterableWrap]: () => true,
	};
	return wrapIter;
}
