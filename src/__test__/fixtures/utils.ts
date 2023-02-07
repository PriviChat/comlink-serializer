import { Serializable, Serialized } from '@comlink-serializer';
import { SerialClassToken, SerializedMeta } from '../../serial/decorators';
import { isSerialized } from '../../serial/decorators/utils';
import SerialSymbol from '../../serial/serial-symbol';

export function getSerializable(obj: Serializable): boolean {
	return (obj as any)[SerialSymbol.serializable]();
}

export function getRevived(obj: Serializable): boolean {
	return (obj as any)[SerialSymbol.revived]();
}

export function getClassToken(obj: Serializable) {
	const classToken = (obj as any)[SerialSymbol.classToken]() as SerialClassToken;
	return classToken;
}

export function getSerialized(obj: Serialized): SerializedMeta {
	if (!isSerialized(obj)) return { classToken: '', hash: '' };
	return obj[SerialSymbol.serialized];
}
