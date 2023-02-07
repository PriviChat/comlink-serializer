import * as Comlink from 'comlink';
import { v4 as uuid } from 'uuid';
import { SerializeCtx } from '..';
import { Revivable, Serializable } from '../decorators';
import SerialSymbol from '../serial-symbol';
import { hashCd } from '../utils';
import { AnySerialIterator, SerialIterType, SerializedIterableProxy } from './types';
import SerialIteratorResult from './serial-iterator-result';

@Serializable(SerialSymbol.serialIterableProxy)
export default class SerialIterableProxy<I extends SerialIterType = SerialIterType>
	implements AsyncIterableIterator<I>, Serializable<SerializedIterableProxy>, Revivable<SerializedIterableProxy>
{
	private _id = uuid();
	private _port1?: MessagePort;
	private _port2: MessagePort;
	private _iterator: AnySerialIterator<I>;
	private _proxy?: Comlink.Remote<AsyncIterableIterator<I>>;
	private done = false;

	/**
	 * `constructor` creates a new `MessageChannel` and assigns the two ports to `this._port1` and
	 * `this._port2`.
	 * @param iterator - AnySerialIterator<I>
	 */
	constructor(iterator: AnySerialIterator<I>) {
		this._iterator = iterator;
		const { port1, port2 } = new MessageChannel();
		this._port1 = port1;
		this._port2 = port2;
	}

	[Symbol.asyncIterator](): AsyncIterableIterator<I> {
		return this;
	}

	// this one is for comlink
	[Symbol.asyncIterator.toString()](): AsyncIterableIterator<I> {
		return this;
	}

	/**
	 * `next` is a function that returns a promise that resolves to an iterator result
	 * @param {[] | [undefined]} args - [] | [undefined]
	 * @returns An iterator that will return the next value of the iterator passed in.
	 */
	async next(...args: [] | [undefined]): Promise<IteratorResult<I, any>> {
		if (this.done) {
			return {
				done: this.done,
				value: undefined,
			};
		}

		const next = await this._iterator.next(...args);

		if (next.done) {
			this.done = true;
			return {
				done: this.done,
				value: undefined,
			};
		}
		return next;
	}

	/**
	 * If the iterator has a return function, call it, otherwise return an iterator result with done set to
	 * true
	 * @param {any} [value] - The value to return from the iterator.
	 * @returns An iterator result.
	 */
	async return?(value?: any): Promise<IteratorResult<I, any>> {
		this.done = true;
		if (this._iterator.return) return await this._iterator.return(value);
		else
			return {
				done: true,
				value,
			};
	}

	/**
	 * `toProxy()` returns a proxy to the iterator on the other side of the channel
	 * @returns A proxy to the iterator.
	 */
	public toProxy(): Comlink.Remote<AsyncIterableIterator<I>> {
		if (this._proxy) return this._proxy;
		if (!this._port2) {
			throw new TypeError('ERR_NO_PORT: Port2 is undefined in call to toProxy()');
		}
		this._proxy = this.wrap(this._port2);
		return this._proxy;
	}

	/**
	 * It returns an object with the id and port of the IterableProxy
	 * @returns The serialized object.
	 */
	public serialize(): SerializedIterableProxy {
		const serialObj: SerializedIterableProxy = {
			id: this._id,
			port: this._port2,
		};
		return serialObj;
	}

	/**
	 * It exposes the port and adds it to the list of transferables
	 * @param {SerializeCtx} ctx - SerializeCtx
	 * @param {SerializedIterableProxy} serialObj - The object that will be serialized.
	 * @returns The serialized object.
	 */
	public afterSerialize(ctx: SerializeCtx, serialObj: SerializedIterableProxy): SerializedIterableProxy {
		// expose and set port as transferable
		if (!this._port1) {
			throw new TypeError('ERR_NO_PORT: Port1 is undefined in call to expose()');
		}
		ctx.addTransferable(this.expose(this, this._port1));
		return serialObj;
	}

	/**
	 * It takes a serialized proxy and sets the `_id` and `_port2` properties to the values in the
	 * serialized proxy
	 * @param {SerializedIterableProxy} sp - SerializedIterableProxy
	 */
	public revive(sp: SerializedIterableProxy) {
		this._id = sp.id;
		this._port1 = undefined;
		this._port2 = sp.port;
	}

	/**
	 * It wraps the `MessagePort` in a `Proxy` that intercepts the `Symbol.asyncIterator` property and
	 * returns the wrapped `MessagePort` as an `AsyncIterableIterator`
	 * @param {MessagePort} port2 - MessagePort - The port that the worker will use to communicate with the
	 * main thread.
	 * @returns A proxy object that wraps the remote object.
	 */
	private wrap(port2: MessagePort) {
		const createProxy = (target: Comlink.Remote<AsyncIterableIterator<I>> | Function) => {
			return new Proxy(target, {
				getPrototypeOf(_target) {
					return _target;
				},
				get(_target, prop, _receiver): any {
					if (typeof prop === 'symbol') {
						if (prop === Symbol.asyncIterator) {
							return () => _target;
						} else {
							return Reflect.get(_target, prop);
						}
					} else {
						return Reflect.get(_target, prop);
					}
				},
			});
		};
		const proxy = Comlink.wrap<AsyncIterableIterator<I>>(port2);
		return createProxy(proxy) as Comlink.Remote<AsyncIterableIterator<I>>;
	}

	/* Creating a proxy to the SerialIterableProxy that will be exposed to the worker thread. */
	private expose = (sip: SerialIterableProxy<I>, port1: MessagePort) => {
		const createProxy = (target: SerialIterableProxy<I> | Function) => {
			return new Proxy(target, {
				getPrototypeOf(_target) {
					return _target;
				},
				get(_target, prop, receiver): any {
					if (_target instanceof SerialIterableProxy && typeof prop === 'string') {
						if (prop === 'next') {
							return createProxy(_target.next);
						} else if (prop === 'done') {
							return _target.done;
						} else if (prop === '_iterator') {
							return _target._iterator;
						}
						return Reflect.get(_target, prop, receiver);
					}
					return Reflect.get(_target, prop, receiver);
				},
				has(_target, prop) {
					return Reflect.has(_target, prop);
				},
				async apply(_target, thisArg, argArray) {
					if (typeof _target === 'function' && _target.name === 'next') {
						const next = await (Reflect.apply(_target, thisArg, argArray) as Promise<IteratorResult<I, any>>);
						const sir = new SerialIteratorResult(next.value, next.done || false);
						return sir;
					}
				},
			});
		};
		Comlink.expose(createProxy(sip), port1);
		return this._port2;
	};

	/**
	 * It returns a hash code for a given string.
	 * @returns The hash code of the id.
	 */
	public hashCode(): number {
		return hashCd(this._id);
	}

	/**
	 * If the other object is a SerialIterableProxy with the same ID as this one, then they are equal.
	 * @param {unknown} other - unknown
	 * @returns A boolean value.
	 */
	public equals(other: unknown) {
		return other instanceof SerialIterableProxy && other._id === this._id;
	}
}
