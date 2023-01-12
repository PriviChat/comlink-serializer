import hash from 'object-hash';
import stringHash from 'string-hash';
import { SerialSymbol } from '../serial';
import { Serialized } from './types';
import objectRegistry from '../registry';
import { SerialArray, SerializedArray } from '../serialobjs';
import { Serializable, SerialMeta } from './decorators';

export function toSerializedArray<S extends Serialized>(array: S[]): SerializedArray<S> {
	const serializedArray: SerializedArray<S> = {
		$array: array,
	};
	return applySymArray(serializedArray);
}

function applySymArray<S extends Serialized>(serialObj: SerializedArray<S>): SerializedArray<S> {
	const entry = objectRegistry.getEntry(SerialArray.classToken);
	if (!entry) {
		const err = 'ERR_NO_REG_ENTRY: No registry entry found for SerialArray.';
		throw new Error(err);
	}
	const meta: SerialMeta = {
		classToken: SerialArray.classToken.toString(),
		hash: hash(serialObj),
	};
	serialObj = Object.assign(serialObj, { ["'" + SerialSymbol.serialized.toString() + "'"]: meta });
	return Object.assign(serialObj, { [SerialSymbol.serialized]: meta });
}

export function hashCd(str: string): number {
	return stringHash(str);
}

export function lazy<T extends Serializable>(target: T) {
	return new Proxy(target, {
		get(target, prop, receiver) {
			if (typeof prop === 'symbol' && prop === SerialSymbol.serializableLazy) return true;
			else return Reflect.get(target, prop, receiver);
		},
		getPrototypeOf(target) {
			return target;
		},
	});
}
