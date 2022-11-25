import { Serializable } from '../serial';
import { ObjectRegistry } from '../registry';
import { SerializedArray } from './types';

@Serializable<SerializedArray, SerializableArray>()
export class SerializableArray<T extends Serializable = Serializable> extends Array<T> {
	static readonly _SCLASS = '56be91f0-c227-43c3-801e-2f60e0b4d0f7';

	isEmpty(): boolean {
		return this.length === 0;
	}

	serialize(): SerializedArray {
		const obj = {
			_SCLASS: SerializableArray._SCLASS,
			_array: this.map((object) => object.serialize()),
		};
		return obj;
	}

	static from<T extends Serializable>(array: Array<T>): SerializableArray<T> {
		const sa = new SerializableArray<T>();
		array.forEach((obj) => sa.push(obj));
		return sa;
	}

	// built-in methods will use this as the constructor
	static get [Symbol.species](): ArrayConstructor {
		return Array;
	}

	static deserialize(obj: SerializedArray): SerializableArray<Serializable> {
		const array = obj._array.map((value) =>
			ObjectRegistry.get().getEntry(value._SCLASS).constructor.deserialize(value)
		);
		return SerializableArray.from<Serializable>(array);
	}
}
