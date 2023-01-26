import { isSerializable } from '../decorators/utils';
import Serializer from '../serializer';
import { supportedMapKeys } from '../types';
import { isSerialPrimitive } from '../utils';
import MessageChannelIterable from './message-channel-iterable';
import { AsyncSerialIterator, ReviveIterType, SerialIterType } from './types';
import { isAsyncSerialIterator } from './utils';

export default class SerialIterable<RI extends ReviveIterType>
	extends MessageChannelIterable<AsyncSerialIterator>
	implements AsyncIterableIterator<RI>
{
	private done: boolean;

	constructor(iterator: AsyncIterableIterator<SerialIterType>, private serializer: Serializer = new Serializer()) {
		if (!isAsyncSerialIterator(iterator))
			throw TypeError(
				'ERR_INVALID_ITERATOR: The iterator passed to SerialIterable must be of type AsyncSerialIterator.'
			);
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
			const val = value[1];

			const sVal = this.serializer.serialize(val);
			return {
				done: false,
				value: [key, sVal] as RI,
			};
		} else {
			const sVal = this.serializer.serialize(value);
			return {
				done: false,
				value: sVal as RI,
			};
		}
	}

	public async return(val?: SerialIterType): Promise<IteratorResult<RI>> {
		this.done = true;

		if (this.iterator.return) {
			const next = await this.iterator.return(val);
			const value = this.isValidOrThrow(next.value);
			if (Array.isArray(value)) {
				const key = value[0];
				const val = value[1];

				const sVal = this.serializer.serialize(val);
				return {
					done: false,
					value: [key, sVal] as RI,
				};
			} else {
				const sVal = this.serializer.serialize(value);
				return {
					done: false,
					value: sVal as RI,
				};
			}
		} else {
			return {
				done: this.done,
				value: undefined,
			};
		}
	}

	private isValidOrThrow(value: SerialIterType) {
		if (Array.isArray(value)) {
			const key = value[0];
			const val = value[1];
			if (!isSerialPrimitive(key)) {
				const err = `ERR_UNSUPPORTED_TYPE: Map iteraotr contains an unsupported key: ${key} of type: ${typeof key} with entry: ${JSON.stringify(
					val
				)}. Supported key types: ${supportedMapKeys}.`;
				console.error(err);
				throw new TypeError(err);
			}
			if (!isSerializable(val)) {
				const err = `ERR_NOT_SERIALIZABLE: Map iterator found a key: ${key} with a value: ${JSON.stringify(
					val
				)} that is not Serializable.`;
				console.error(err);
				throw TypeError(err);
			}
			return value;
		} else {
			if (!isSerializable(value)) {
				const err = `ERR_NOT_SERIALIZABLE: Iterator found a value that was not Serializable. Value: ${JSON.stringify(
					value
				)}`;
				console.error(err);
				throw TypeError(err);
			}
			return value;
		}
	}
}
