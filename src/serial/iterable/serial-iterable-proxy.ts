import * as Comlink from 'comlink';
import { v4 as uuid } from 'uuid';
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
	 * > called by comlink when the proxy is released
	 * > good place to do some cleanup if needed
	 * @returns Nothing.
	 */
	private proxyReleased = () => {
		return;
	};

	/**
	 * `toProxy()` returns a proxy to the iterator on the other side of the channel
	 * @returns A proxy to the iterator.
	 */
	public toProxy(): Comlink.Remote<AsyncIterableIterator<I>> {
		if (!this._proxy) throw new TypeError('ERR_NO_PROXY: Proxy is undefined in call to toProxy');
		return this._proxy;
	}

	/**
	 * It returns an object with the id and port of the IterableProxy
	 * @returns The serialized object.
	 */
	public serialize(): SerializedIterableProxy {
		const serialObj: SerializedIterableProxy = {
			id: this._id,
		};
		return serialObj;
	}

	/**
	 * `afterSerialize()` is called after the object is serialized, and it returns an array of transferable
	 * objects
	 * @returns The port2 is being returned.
	 */
	public afterSerialize(): Transferable[] {
		const port2 = this.expose(this);
		return [port2];
	}

	/**
	 * It takes a serialized proxy and sets the `_id` properties to the values in the
	 * serialized proxy
	 * @param {SerializedIterableProxy} sp - SerializedIterableProxy
	 */
	public revive(sp: SerializedIterableProxy) {
		this._id = sp.id;
	}

	/**
	 * `afterRevive` is called after the object is revived and it's used to set the `_proxy` property to
	 * the `MessagePort` object that was passed to the `transfer` function
	 * @param {Transferable[] | undefined} transferables - An array of Transferable objects that are to be
	 * transferred to the worker.
	 */
	public afterRevive(transferables: Transferable[] | undefined): void {
		if (!transferables || !transferables[0])
			throw new TypeError('ERR_NO_PORT: The trasferables array is undefined or empty in afterRevive');

		// wrap and set the proxy
		this._proxy = this.wrap(transferables[0] as MessagePort);
	}

	/**
	 * It wraps the `MessagePort` in a `Proxy` that intercepts the `Symbol.asyncIterator` property and
	 * returns the wrapped `MessagePort` as an `AsyncIterableIterator`
	 * @param {MessagePort} port2 - MessagePort - The port that will be used to communicate with the
	 * worker.
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
	private expose = (sip: SerialIterableProxy<I>) => {
		// create a new message channel
		const { port1, port2 } = new MessageChannel();
		const proxyReleased = this.proxyReleased;
		const createProxy = (target: SerialIterableProxy<I> | Function) => {
			return new Proxy(target, {
				getPrototypeOf(_target) {
					return _target;
				},
				get(_target, prop, receiver): any {
					if (prop === Comlink.finalizer) {
						// called by comlink when the proxy is released
						// TODO this does not seem to get called every time it could be related to jest
						proxyReleased();
						return;
					}
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
					if (prop === Comlink.finalizer) return true;
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
		return port2;
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
