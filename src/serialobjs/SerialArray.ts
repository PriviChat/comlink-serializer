import { Deserializer, SerialSymbol } from '../serial';
import { Serializable } from '../serial/decorators';
import { IterableObject, SerializedArray } from './types';
import { generateId } from '../serial/decorators/utils';
import { SerializeIterator } from '../serial/iterators';

function serialArrayFactory<T extends Serializable>(): SerialArray<T> {
	return new SerialArray<T>();
}

export default class SerialArray<T extends Serializable = Serializable> extends Array<T> implements IterableObject {
	[SerialSymbol.registryId] = '0fc6729c-e75f-521f-8ad6-657a78494fd6';
	[SerialSymbol.iterable] = true;
	[SerialSymbol.iterator]() {
		return new SerializeIterator(this);
	}

	public isEmpty(): boolean {
		return this.length === 0;
	}

	static from<T extends Serializable>(array: Array<T>): SerialArray<T> {
		const sa = serialArrayFactory<T>();
		array.forEach((obj) => sa.push(obj));
		return sa;
	}

	// built-in methods will use this as the constructor
	static get [Symbol.species](): ArrayConstructor {
		return Array;
	}

	public deserialize(obj: SerializedArray, deserializer: Deserializer): SerialArray {
		const array = obj._array.map((value) => deserializer.deserialize(value));
		return SerialArray.from(array);
	}
}
