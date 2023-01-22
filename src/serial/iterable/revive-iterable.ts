import { Serializable } from '../decorators';
import Reviver from '../reviver';
import { Serialized, SerialPrimitive } from '../types';
import MessageChannelIterable from './message-channel-iterable';
import { AsyncReviveIterator, ReviveIterType, SerialIterType } from './types';

export default class ReviveIterable<
		S extends Serialized = Serialized,
		T extends Serializable<S> = Serializable<S>,
		SI extends SerialIterType<T> = any
	>
	extends MessageChannelIterable<AsyncReviveIterator<S>>
	implements AsyncIterableIterator<SI>
{
	private done: boolean;

	constructor(port: MessagePort, private reviver: Reviver) {
		super(port);
		this.done = false;
	}

	[Symbol.asyncIterator](): AsyncIterableIterator<SI> {
		return this;
	}

	async next(...args: []): Promise<IteratorResult<SI>> {
		if (!this.iterator) throw new TypeError('Reviver iterator has not been set.');

		if (this.done) {
			return {
				done: this.done,
				value: undefined,
			};
		}

		const next = await this.iterator.next(...args);

		if (next.done) {
			this.done = true;
			return {
				done: this.done,
				value: undefined,
			};
		}

		const value = next.value;
		if (Array.isArray(value)) {
			const key = value[0];
			const entry = this.reviver.revive(value[1]);
			return {
				done: false,
				value: [key, entry] as SI,
			};
		} else {
			return {
				done: false,
				value: this.reviver.revive(value) as SI,
			};
		}
	}

	async return?(val?: ReviveIterType<S>): Promise<IteratorResult<SI>> {
		this.done = true;
		if (this.iterator.return) {
			const next = await this.iterator.return(val);
			const value = next.value;
			if (Array.isArray(value)) {
				const key = value[0];
				const entry = this.reviver.revive(value[1]);
				return {
					done: false,
					value: [key, entry] as SI,
				};
			} else if (value) {
				return {
					done: this.done,
					value: this.reviver.revive(value) as SI,
				};
			}
		}
		return {
			done: this.done,
			value: val,
		};
	}
}
