import { Serializable } from '../decorators';
import SerialSymbol from '../SerialSymbol';
import { Serialized } from '../types';

export default class SerializeIterator<T extends Serializable = Serializable> implements Iterator<Serialized> {
	[SerialSymbol.iterator] = true;
	private index: number;
	private done: boolean;

	constructor(private values: T[]) {
		this.index = 0;
		this.done = false;
	}

	[Symbol.iterator]() {
		return this;
	}

	public next(...args: [] | [undefined]): IteratorResult<Serialized> {
		if (this.done) {
			return {
				done: this.done,
				value: undefined,
			};
		}
		if (this.index === this.values.length) {
			this.done = true;
			return {
				done: this.done,
				value: undefined, //this.index, //may want to return an index representing how many records processed
			};
		}
		const value = this.values[this.index];
		this.index += 1;
		const serialObj = value.serialize();
		return {
			done: false,
			value: serialObj,
		};
	}

	public return(value?: T): IteratorResult<Serialized> {
		this.done = true;
		return {
			done: this.done,
			value: value ? value.serialize() : undefined,
		};
	}
}
