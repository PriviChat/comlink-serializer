import { AnySerialIterator, AsyncSerialIterator, SerialIterType, ToSerialIterator } from '.';
import { Serialized, SerialPrimitive } from '..';
import { Serializable } from '../decorators';
import SerialSymbol from '../serial-symbol';

export function isAsyncSerialIterator(obj: any): obj is AsyncSerialIterator {
	if (!obj) return false;
	return isToSerialIterator(obj);
}

export function isToSerialIterator(obj: any): obj is ToSerialIterator {
	if (!obj) return false;
	return obj[SerialSymbol.toSerialIterator] ?? false;
}

/**
 *	Converts an Array<T> to an iterator that can be transferred
 *	@param arr - Array<T>
 *  @returns An AsyncIterableIterator<T>
 **/
export function toSerialIterator<S extends Serialized, T extends Serializable<S>>(
	arr: Array<T>
): AsyncIterableIterator<T>;

/**
 *	Converts a Map<K, T> to an iterator that can be transferred
 *	@param map - Map<K, T>
 *   @returns An AsyncIterableIterator<[K, T]>
 **/
export function toSerialIterator<S extends Serialized, T extends Serializable<S>, K extends SerialPrimitive>(
	map: Map<K, T>
): AsyncIterableIterator<[K, T]>;

/**
 *	Converts a AnySerialIterator<T> to an iterator that can be transferred
 *	@param iterator - AnySerialIterator<T>
 *   @returns An AsyncIterableIterator<SerialIterType<T>>
 **/
export function toSerialIterator<S extends Serialized, T extends Serializable<S>>(
	iterator: AnySerialIterator<T>
): AsyncIterableIterator<SerialIterType<T>>;
export function toSerialIterator<S extends Serialized, T extends Serializable<S>, K extends SerialPrimitive>(
	obj: Array<T> | Map<K, T> | AnySerialIterator<T>
) {
	if (obj instanceof Array) return createAsyncSerialIterator(obj.values());
	else if (obj instanceof Map) return createAsyncSerialIterator(obj.entries());
	return createAsyncSerialIterator(obj);
}

/**
 * Takes an iterator and returns an async iterator
 * @param iterator - AnySerialIterator<I>
 * @returns An AsyncSerialIterator<I>
 */
function createAsyncSerialIterator<I extends SerialIterType>(iterator: AnySerialIterator<I>): AsyncSerialIterator<I> {
	const asi: AsyncSerialIterator<I> = {
		[SerialSymbol.toSerialIterator]: true,
		[Symbol.asyncIterator]: function () {
			return this;
		},
		next: async function (...args: [] | [undefined]): Promise<IteratorResult<I, any>> {
			return await iterator.next(...args);
		},
		return: async function (value?: any): Promise<IteratorResult<I, any>> {
			if (iterator.return) return await iterator.return(value);
			else
				return {
					done: true,
					value,
				};
		},
	};
	return asi;
}
