import hash from 'object-hash';
import { Serializable } from '@comlink-serializer';

import SerialSymbol from '../../serial/serial-symbol';
import { SerialMeta } from '../../serial/decorators';
import { OrderClass, ProductClass, SerializedOrder, SerializedProduct, SerializedUser, UserClass } from './types';

export function getSerializableSymbol(obj: Serializable): SerialMeta | undefined {
	return (obj as any)[SerialSymbol.serializable]();
}

export function applySymUser(serialObj: SerializedUser) {
	const meta = {
		cln: UserClass,
		hsh: hash(serialObj),
	};
	return Object.assign(serialObj, { ["'" + SerialSymbol.serializable.toString() + "'"]: meta });
}

export function applySymProduct(serialObj: SerializedProduct) {
	const meta = {
		cln: ProductClass,
		hsh: hash(serialObj),
	};

	return Object.assign(serialObj, { ["'" + SerialSymbol.serializable.toString() + "'"]: meta });
}

export function applySymOrder(serialObj: SerializedOrder) {
	const meta = {
		cln: OrderClass,
		hsh: hash(serialObj),
	};
	return Object.assign(serialObj, { ["'" + SerialSymbol.serializable.toString() + "'"]: meta });
}
