import { Serializable } from '@comlink-serializer';
import { SerialMeta, SerialSymbol } from '@comlink-serializer-internal';

export function getSerializableSymbol(obj: Serializable): SerialMeta | undefined {
	return (obj as any)[SerialSymbol.serializable]();
}
