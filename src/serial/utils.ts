import hash from 'object-hash';
import stringHash from 'string-hash';
import { SerialSymbol } from '../serial';
import { Serialized } from './types';
import objectRegistry from '../registry';
import { SerializedArray } from '../serialobjs';

export function toSerializedArray<S extends Serialized>(array: S[]): SerializedArray<S> {
	const serializedArray: SerializedArray<S> = {
		$array: array,
	};
	return applySymArray(serializedArray);
}

function applySymArray<S extends Serialized>(serialObj: SerializedArray<S>): SerializedArray<S> {
	const entry = objectRegistry.getEntryByClass('SerialArray');
	if (!entry) {
		const err = 'ERR_NO_REG_ENTRY: No registry entry found for SerialArray.';
		throw new Error(err);
	}
	const meta = {
		rid: entry.id,
		cln: 'SerialArray',
		hsh: hash(serialObj),
	};
	serialObj = Object.assign(serialObj, { ["'" + SerialSymbol.serialized.toString() + "'"]: meta });
	return Object.assign(serialObj, { [SerialSymbol.serialized]: meta });
}

export function hashCd(str: string): number {
	return stringHash(str);
}
