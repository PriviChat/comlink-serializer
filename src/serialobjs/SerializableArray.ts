import { Deserializer } from 'src/serial';
import { Serializable } from '../serial/decorators';
import { SerializedArray } from './types';

@Serializable
export default class SerializableArray<S extends Serializable = Serializable>
	extends Array<S>
	implements Serializable<SerializedArray>
{
	isEmpty(): boolean {
		return this.length === 0;
	}

	serialize(): SerializedArray {
		const obj = {
			_array: this.map((object) => object.serialize()),
		};
		return obj;
	}

	static from<S extends Serializable>(array: Array<S>): SerializableArray<S> {
		const sa = new SerializableArray<S>();
		array.forEach((obj) => sa.push(obj));
		return sa;
	}

	// built-in methods will use this as the constructor
	static get [Symbol.species](): ArrayConstructor {
		return Array;
	}

	public deserialize(obj: SerializedArray, deserializer: Deserializer): SerializableArray<Serializable> {
		const array = obj._array.map((value) => deserializer.deserialize(value));
		return SerializableArray.from<Serializable>(array);
	}
}
