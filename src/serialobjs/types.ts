import { SerializeIterator } from '../serial/iterators';
import { Serialized, SerialSymbol } from '../serial';

export interface SerializedArray extends Serialized {
	_array: Serialized[];
}

export interface SerializedMap extends Serialized {
	_map: Map<boolean | number | bigint | string, Serialized>;
}

export interface IterableObject {
	[SerialSymbol.registryId]: string;
	[SerialSymbol.iterable]: boolean;
	[SerialSymbol.iterator](): SerializeIterator;
}
