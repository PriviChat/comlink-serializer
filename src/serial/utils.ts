import hash from 'object-hash';
import { SerialSymbol } from '../serial';
import { Serialized } from './types';
import { getRegId } from '../registry';
import { SerializedArray } from '../serialobjs';

export function toSerializedArray<S extends Serialized>(array: S[]): SerializedArray<S> {
	const serializedArray: SerializedArray<S> = {
		$array: array,
	};
	return applySymArray(serializedArray);
}

function applySymArray<S extends Serialized>(serialObj: SerializedArray<S>): SerializedArray<S> {
	const meta = {
		rid: getRegId('SerialArray'),
		cln: 'SerialArray',
		hsh: hash(serialObj),
	};
	return Object.assign(serialObj, { ["'" + SerialSymbol.serialized.toString() + "'"]: meta });
}
