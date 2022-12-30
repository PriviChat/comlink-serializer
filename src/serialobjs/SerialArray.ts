import { Deserializer } from '../serial';
import { Serializable } from '../serial/decorators';
import { SerializedArray } from './types';

function serialArrayFactory<T extends Serializable>(): SerialArray<T> {
	return new SerialArray<T>();
}
@Serializable({ class: 'SerialArray' })
export default class SerialArray<T extends Serializable = Serializable> extends Array<T> implements Iterable<T> {
	public isEmpty(): boolean {
		return this.length === 0;
	}

	public serialize(): SerializedArray {
		const obj = {
			_array: this.map((object) => object.serialize()),
		};
		return obj;
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
