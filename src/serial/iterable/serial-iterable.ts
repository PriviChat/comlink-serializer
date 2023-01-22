import { Serializable } from '../decorators';
import { isSerializable } from '../decorators/utils';
import Serializer from '../serializer';
import { Serialized, SerialPrimitive, supportedMapKeys } from '../types';
import { isSerialPrimitive } from '../utils';
import MessageChannelIterable from './message-channel-iterable';
import { AnySerialIterator, ReviveIterType, SerialIterType } from './types';

export default class SerialIterable<
		S extends Serialized = Serialized,
		T extends Serializable<S> = Serializable<S>,
		RI extends ReviveIterType<S> = any
	>
	extends MessageChannelIterable<AnySerialIterator<T>>
	implements AsyncIterableIterator<RI>
{
	private done: boolean;

	constructor(iterator: AnySerialIterator<T>, private serializer: Serializer = new Serializer()) {
		super(iterator);
		this.done = false;
	}

	[Symbol.asyncIterator](): AsyncIterableIterator<RI> {
		return this;
	}

	public async next(...args: []): Promise<IteratorResult<RI>> {
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

		const value = this.isValidOrThrow(next.value);

		if (Array.isArray(value)) {
			const key = value[0];
			const entry = value[1] as T;

			const serialEntry = this.serializer.serialize(entry);
			return {
				done: false,
				value: [key, serialEntry] as RI,
			};
		} else {
			const serialObj = this.serializer.serialize(value);
			return {
				done: false,
				value: serialObj as RI,
			};
		}
	}

	public async return(val?: SerialIterType<T>): Promise<IteratorResult<RI>> {
		this.done = true;

		if (this.iterator.return) {
			const next = await this.iterator.return(val);
			const value = this.isValidOrThrow(next.value);
			if (Array.isArray(value)) {
				const key = value[0];
				const entry = value[1];

				const serialEntry = this.serializer.serialize(entry);
				return {
					done: false,
					value: [key, serialEntry] as RI,
				};
			} else {
				const serialObj = this.serializer.serialize(value);
				return {
					done: false,
					value: serialObj as RI,
				};
			}
		} else {
			return {
				done: this.done,
				value: undefined,
			};
		}
	}

	private isValidOrThrow(value: any) {
		if (Array.isArray(value)) {
			const key = value[0];
			const entry = value[1];
			if (!isSerialPrimitive(key)) {
				const err = `ERR_UNSUPPORTED_TYPE: Map iteraotr contains an unsupported key: ${key} of type: ${typeof key} with entry: ${JSON.stringify(
					entry
				)}. Supported key types: ${supportedMapKeys}.`;
				console.error(err);
				throw new TypeError(err);
			}
			if (!isSerializable(entry)) {
				const err = `ERR_NOT_SERIALIZABLE: Map iterator found a key: ${key} with a value: ${JSON.stringify(
					entry
				)} that is not Serializable.`;
				console.error(err);
				throw TypeError(err);
			}
			return value as [SerialPrimitive, T];
		} else {
			if (!isSerializable(value)) {
				const err = `ERR_NOT_SERIALIZABLE: Iterator found a value that was not Serializable. Value: ${JSON.stringify(
					value
				)}`;
				console.error(err);
				throw TypeError(err);
			}
			return value as T;
		}
	}
}
