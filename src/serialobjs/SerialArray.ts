import { hash } from '@comlink-serializer';
import { Reviver } from '../serial';
import { Serializable } from '../serial/decorators';
import { Serialized } from '../serial';
import { SerializedArray } from './types';

function serialArrayFactory<T extends Serializable>(...args: any[]): SerialArray<T> {
	return new SerialArray<T>(...args);
}
@Serializable({ class: 'SerialArray' })
export default class SerialArray<T extends Serializable = Serializable>
	extends Array<T>
	implements Serializable<SerializedArray>
{
	public isEmpty(): boolean {
		return this.length === 0;
	}

	public serialize(): SerializedArray {
		const arr = new Array<Serialized>();
		for (const item of this) {
			arr.push(item.serialize());
		}
		const serialObj: SerializedArray = {
			$array: arr,
		};
		return serialObj;
	}

	static from<T extends Serializable>(arr: Array<T>): SerialArray<T> {
		return serialArrayFactory<T>(arr);
	}

	// built-in methods will use this as the constructor
	static get [Symbol.species](): ArrayConstructor {
		return Array;
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
		return hash('ABCDEFT');
	}
}
