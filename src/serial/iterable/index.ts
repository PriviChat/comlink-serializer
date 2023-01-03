import { Serializable } from '../decorators';
import { AnySerialIterable, AsyncSerialIterable, SerialIterable } from './types';

export { default as SerialIterable } from './SerialIterable';
export { default as ReviverIterable } from './ReviverIterable';
export * from './types';

export function isAnySerialIterable(obj: any): obj is AnySerialIterable {
	if (typeof (obj as any)[Symbol.iterator] === 'function' || typeof (obj as any)[Symbol.asyncIterator] === 'function')
		return true;
	return false;
}

export function isSerialIterable<T extends Serializable>(obj: any): obj is SerialIterable<T> {
	if (typeof (obj as any)[Symbol.iterator] === 'function') return true;
	return false;
}

export function isAsyncSerialIterable<T extends Serializable>(obj: any): obj is AsyncSerialIterable<T> {
	if (typeof (obj as any)[Symbol.asyncIterator] === 'function') return true;
	return false;
}
