import { Serializable, Serialized } from '@comlink-serializer';
import hash from 'object-hash';
import { SerializedArray, SerialMeta, SerialSymbol } from '@comlink-serializer-internal';
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

export function applySymArray<S extends Serialized>(serialObj: SerializedArray<S>): SerializedArray<S> {
	const meta = {
		rid: SymRegIdMap.Array,
		cln: SymClassMap.Array,
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
