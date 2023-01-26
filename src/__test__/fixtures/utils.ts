import { Serializable } from '@comlink-serializer';
import { SerialClassToken } from 'src/serial/decorators';
import SerialSymbol from '../../serial/serial-symbol';

export function getSerializable(obj: Serializable): boolean {
	return (obj as any)[SerialSymbol.serializable]();
}

export function getRevived(obj: Serializable): boolean {
	return (obj as any)[SerialSymbol.revived]();
}

export function getClassToken(obj: Serializable): string {
	const classToken = (obj as any)[SerialSymbol.classToken]() as SerialClassToken;
	return classToken.toString();
}
