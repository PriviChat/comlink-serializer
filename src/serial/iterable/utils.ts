import { AnySerialIterator, SerialIterType } from '.';
import { Serialized, SerialPrimitive } from '..';
import { Serializable } from '../decorators';
import SerialIterableProxy from './serial-iterable-proxy';
import SerialIteratorResult from './serial-iterator-result';

/**
 * If the object is a SerialIterableProxy, return true, otherwise return false.
 * @param {any} obj - any - The object to check.
 * @returns A function that returns a boolean.
 */
export function isSerialIterableProxy(obj: any): obj is SerialIterableProxy {
	if (!obj) return false;
	return obj instanceof SerialIterableProxy;
}

/**
 * If the object is an instance of the SerialIteratorResult class, then return true, otherwise return
 * false.
 * @param {any} obj - any - The object to check.
 * @returns A function that takes an object and returns true if the object is an instance of the
 * function.
 */
export function isSerialIteratorResult(obj: any): obj is SerialIteratorResult {
	if (!obj) return false;
	return obj instanceof isSerialIteratorResult;
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
	if (obj instanceof Array) return new SerialIterableProxy(obj.values());
	else if (obj instanceof Map) return new SerialIterableProxy(obj.entries());
	return new SerialIterableProxy(obj);
}
