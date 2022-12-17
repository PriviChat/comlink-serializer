import { Deserializer } from 'src/serial';
import { Deserializable, Serializable } from '../serial/decorators';
import { SerializedArray } from './types';

function serializableArrayFactory<T extends Serializable>(): SerializableArray<T> {
	return new SerializableArray<T>();
}

@Serializable
export default class SerializableArray<T extends Serializable = Serializable>
	extends Array<T>
	implements Serializable<SerializedArray>, Deserializable<SerializedArray, SerializableArray>
{
	public isEmpty(): boolean {
		return this.length === 0;
	}

	public serialize(): SerializedArray {
		const obj = {
			_array: this.map((object) => object.serialize()),
		};
		return obj;
	}

	static from<T extends Serializable>(array: Array<T>): SerializableArray<T> {
		const sa = serializableArrayFactory<T>();
		array.forEach((obj) => sa.push(obj));
		return sa;
	}

	// built-in methods will use this as the constructor
	static get [Symbol.species](): ArrayConstructor {
		return Array;
	}

	public deserialize(obj: SerializedArray, deserializer: Deserializer): SerializableArray {
		const array = obj._array.map((value) => deserializer.deserialize(value));
		return SerializableArray.from(array);
	}
}
