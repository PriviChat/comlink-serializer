import stringHash from 'string-hash';
import { Reviver } from '../serial';
import { Serializable } from '../serial/decorators';
import { Serialized } from '../serial';
import { SerializedArray } from './types';
import { isSerializableObject } from '../serial/decorators/utils';

function serialArrayFactory<T extends Serializable>(...args: any[]): SerialArray<T> {
	return new SerialArray<T>(...args);
}

@Serializable(SerialArray.classToken)
export default class SerialArray<T extends Serializable> extends Array<T> implements Serializable<SerializedArray> {
	static readonly classToken: unique symbol = Symbol('ComSer.serialArray');

	// built-in methods will use this as the constructor
	static get [Symbol.species](): ArrayConstructor {
		return Array;
	}

	public isEmpty(): boolean {
		return this.length === 0;
	}

	public serialize(): SerializedArray {
		const arr = new Array<Serialized>();
		for (const item of this) {
			if (isSerializableObject(item)) arr.push(item.serialize());
		}
		const serialObj: SerializedArray = {
			$array: arr,
		};
		return serialObj;
	}

	static from<T extends Serializable>(arr: Array<T>): SerialArray<T> {
		const sa = serialArrayFactory<T>();
		for (const value of arr) {
			if (!isSerializableObject(value)) {
				const err = `ERR_UNSUPPORTED_TYPE: Array contains an unsupported value: ${JSON.stringify(
					value
				)}. Only values decorated with @Serializable are supported`;
				console.error(err);
				throw new TypeError(err);
			}
			sa.push(value);
		}
		return sa;
	}

	public revive?(obj: SerializedArray, reviver: Reviver) {
		for (const item of obj.$array) {
			const revived = reviver.revive(item) as T;
			this.push(revived);
		}
	}

	public equals(other: unknown): boolean {
		//TODO update to figure out how to check for array equality
		return other instanceof SerialArray;
	}

	public hashCode(): number {
		//TODO update to figure out how to hash equality. It probably needs to be recalculated as items are added.
		return stringHash('ABCDEFT');
	}
}
