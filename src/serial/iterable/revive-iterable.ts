import Reviver from '../reviver';
import MessageChannelIterable from './message-channel-iterable';
import { AsyncReviveIterator, ReviveIterType, SerialIterType } from './types';

export default class ReviveIterable<SI extends SerialIterType = SerialIterType>
	extends MessageChannelIterable<AsyncReviveIterator>
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
			const val = value[1];
			const entry = this.reviver.revive(val);
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

	async return?(val?: ReviveIterType): Promise<IteratorResult<SI>> {
		this.done = true;
		if (this.iterator.return) {
			if (Array.isArray(val)) {
				const next = await this.iterator.return(val);
				const value = next.value;
				const key = value[0];
				const entry = this.reviver.revive(value[1]);
				return {
					done: false,
					value: [key, entry] as SI,
				};
			} else {
				const next = await this.iterator.return(val);
				const value = next.value;
				if (value) {
					return {
						done: this.done,
						value: this.reviver.revive(value) as SI,
					};
				}
			}
		}
		return {
			done: this.done,
			value: val,
		};
	}
}
