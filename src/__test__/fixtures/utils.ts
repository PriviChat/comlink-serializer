import hash from 'object-hash';
import { Serializable, Serialized } from '@comlink-serializer';

import { SerialSymbol } from '../../serial';
import { SerialMeta } from '../../serial/decorators';
import { SymClassMap, SymRegIdMap } from './SymMap';
import { SerializedOrder, SerializedProduct, SerializedUser } from './types';

export function getSerializableSymbol(obj: Serializable): SerialMeta | undefined {
	return (obj as any)[SerialSymbol.serializable]();
}

export function applySymUser(serialObj: SerializedUser) {
	const meta = {
		rid: SymRegIdMap.User,
		cln: SymClassMap.User,
		hsh: hash(serialObj),
	};
	return Object.assign(serialObj, { ["'" + SerialSymbol.serializable.toString() + "'"]: meta });
}

export function applySymProduct(serialObj: SerializedProduct) {
	const meta = {
		rid: SymRegIdMap.Product,
		cln: SymClassMap.Product,
		hsh: hash(serialObj),
	};

	return Object.assign(serialObj, { ["'" + SerialSymbol.serializable.toString() + "'"]: meta });
}

export function applySymOrder(serialObj: SerializedOrder) {
	const meta = {
		rid: SymRegIdMap.Order,
		cln: SymClassMap.Order,
		hsh: hash(serialObj),
	};
	return Object.assign(serialObj, { ["'" + SerialSymbol.serializable.toString() + "'"]: meta });
}

export function applySymMap<S extends Serialized>(serialObj: Map<any, S>) {
	const meta = {
		rid: SymRegIdMap.SerialMap,
		cln: SymClassMap.SerialMap,
		hsh: hash(serialObj),
	};

	return Object.assign(serialObj, { ["'" + SerialSymbol.serializable.toString() + "'"]: meta });
}

/* export function toSerializedMap<V extends Serialized>(map: Map<SerialPrimitive, V>): SerializedMap<V> {
    const serial
	const serializedArray: SerializedMap<V> = {
		$map: map,
	};
	return applySymArray(serializedArray);
}
 */
