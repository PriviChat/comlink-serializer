import { Serializable } from '../serial';
import { ObjectRegistry } from '../registry';
import { SerializedArray } from './types';

@Serializable<SerializedArray, SerializableArray>()
export class SerializableArray<S extends Serializable = Serializable> extends Array<S> {
	isEmpty(): boolean {
		return this.length === 0;
	}

	serialize() {
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

	static deserialize(obj: SerializedArray): SerializableArray<Serializable> {
		const array = obj._array.map((value) => ObjectRegistry.get().getEntry(value._SCLASS!).deserialize(value));
		return SerializableArray.from<Serializable>(array);
	}
}
