import * as Comlink from 'comlink';
import crypto from 'crypto';
import { Revivable, SerializableObject, SerializePropertyDescriptor } from './decorators';
import Serializable from './decorators/serializable';
import { Dictionary, ParentRef, SerializedProxy } from '.';
import { isSerializable, isSerializableObject } from './decorators/utils';
import SerialSymbol from './serial-symbol';
import { toSerialIterator } from './iterable/utils';
import { hashCd, toSerial, toSerialProxy } from './utils';

@Serializable(SerialSymbol.serialProxy)
export default class SerialProxy<T extends Serializable>
	implements Serializable<SerializedProxy>, Revivable<SerializedProxy>
{
	private _id = crypto.randomUUID();
	private _proxyClass: string;
	private _proxyDescr: Dictionary<SerializePropertyDescriptor>;
	private _proxyProp?: string;
	private _refClass?: string;
	private _obj: SerializableObject<T>;
	private _proxy?: Comlink.Remote<SerializableObject<T>>;
	private objValueCache = new WeakMap<object, Map<string | symbol, any>>();

	constructor(obj: T, parentRef?: ParentRef) {
		if (!isSerializableObject(obj)) {
			let err;
			if (parentRef) {
				err = `ERR_NOT_SERIALIZABLE: Cannot create proxy for prop: ${
					parentRef.prop
				} on class: ${parentRef.classToken.toString()}. Prehaps you decorated: ${
					parentRef.prop
				} with @Serialize but it's value is not @Serializable. Object: ${JSON.stringify(obj)}`;
			} else {
				err = `ERR_NOT_SERIALIZABLE: Cannot create proxy for object: ${JSON.stringify(
					obj
				)}. A proxy can only be created for a @Serializable object.`;
			}
			console.error(err);
			throw new TypeError(err);
		}

		this._obj = obj;
		this._proxyClass = obj[SerialSymbol.classToken]().toString();
		this._proxyDescr = obj[SerialSymbol.serializeDescriptor]();
		this._proxyProp = parentRef?.prop;
		this._refClass = parentRef?.classToken.toString();
	}

	[SerialSymbol.serializeDescriptor](): Dictionary<SerializePropertyDescriptor> {
		return this._proxyDescr;
	}

	public get id() {
		return this._id;
	}

	public get proxyClass() {
		return this._proxyClass;
	}

	public get proxyProp() {
		return this._proxyProp;
	}

	public get proxyDescr() {
		return this._proxyDescr;
	}

	private getCacheValue = (lookupObj: Object, prop: string | symbol) => {
		const propVals = this.objValueCache.get(lookupObj);
		if (!propVals) return undefined;
		return propVals.get(prop);
	};

	private setCacheValue = (lookupObj: Object, prop: string | symbol, val: any) => {
		if (!this.objValueCache.has(lookupObj)) {
			this.objValueCache.set(lookupObj, new Map());
		}
		this.objValueCache.get(lookupObj)?.set(prop, val);
		return val;
	};

	/**
	 * > called by comlink when the proxy is released
	 * > good place to do some cleanup if needed
	 * @returns Nothing.
	 */
	private proxyReleased = () => {
		return;
		//console.info(`THE PROXY FOR CLASS: ${this._proxyClass} HAS BEEN RELEASED`);
	};

	/**
	 * "If the proxy is undefined, throw an error, otherwise return the proxy."
	 *
	 * The `if` statement is a conditional statement. It's a way to check if something is true or false. If
	 * it's true, the code inside the `if` block will run. If it's false, the code inside the `if` block
	 * will not run
	 * @returns A proxy to the object.
	 */
	public toProxy(): Comlink.Remote<SerializableObject<T>> {
		if (!this._proxy) throw new TypeError('ERR_NO_PROXY: Proxy is undefined in call to toProxy');
		return this._proxy;
	}

	/**
	 * Creates a SerializedProxy
	 * Converts classTokens to strings for serialization
	 * @returns A serialized proxy object.
	 */
	public serialize(): SerializedProxy {
		const serialObj: SerializedProxy = {
			id: this._id,
			proxyClass: this.proxyClass,
			proxyProp: this._proxyProp,
			proxyDescr: {},
			refClass: this._refClass,
		};

		for (const [key, val] of Object.entries(this._proxyDescr)) {
			// class tokens must be converted to string for serialization
			serialObj.proxyDescr[key] = { ...val, classToken: val.classToken.toString() };
		}
		return serialObj;
	}

	/**
	 * `afterSerialize()` is called after the object is serialized, and it returns an array of transferable
	 * objects
	 * @returns The port2 is being returned.
	 */
	public afterSerialize(): Transferable[] {
		const port2 = this.expose(this._obj);
		return [port2];
	}

	/**
	 * > The `revive` function is called by the `ProxyManager` when it is time to revive a proxy
	 * @param {SerializedProxy} sp - SerializedProxy - this is the object that was serialized and is now
	 * being revived.
	 */
	public revive(sp: SerializedProxy) {
		this._id = sp.id;
		this._proxyClass = sp.proxyClass;
		this._proxyProp = sp.proxyProp;
		this._proxyDescr = sp.proxyDescr;
		this._refClass = sp.refClass;
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
		this._proxy = this.wrap(transferables[0] as MessagePort, this._proxyDescr);
	}

	/**
	 * We create a new message channel, and then we create a proxy that will be exposed on the first port
	 * of the message channel.
	 *
	 * The proxy will be created using the `createProxy` function.
	 *
	 * The `createProxy` function will create a proxy that will intercept all get operations on the
	 * object.
	 *
	 * If the property is a serializable object, then we will create a new proxy for that object.
	 *
	 * If the property is an array or a map, then we will create a new serial iterator for that object.
	 *
	 * If the property is neither of the above, then we will return the property.
	 *
	 * The proxy will also intercept the `has` operation.
	 *
	 * The `has` operation will simply return the result of the `Reflect.has` operation.
	 *
	 * The `createProxy` function will also create a cache for the object.
	 *
	 * The cache will be used to store
	 * @param obj - The object to be exposed.
	 * @returns A proxy object that is being exposed to the other side of the message channel.
	 */
	private expose(obj: SerializableObject<T>) {
		// create a new message channel
		const { port1, port2 } = new MessageChannel();

		const getCacheValue = this.getCacheValue;
		const setCacheValue = this.setCacheValue;
		const proxyReleased = this.proxyReleased;

		const createProxy = (target: SerializableObject<T>) => {
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

					const hit = getCacheValue(_target, prop);
					if (hit) return hit;

					const descr = _target[SerialSymbol.serializeDescriptor]();
					const classToken = _target[SerialSymbol.classToken]();
					const config = descr[prop.toString()];

					if (config) {
						let so;
						const obj = Reflect.get(_target, prop, receiver);
						switch (config.type) {
							case 'Serializable': {
								if (!isSerializable(obj)) {
									throw TypeError(
										`ERR_NOT_SERIALIZABLE: Class: ${classToken.toString()} Property: ${prop.toString()} is decorated with @Serialize but it is not Serializable`
									);
								} else {
									if (config.proxy) {
										so = createProxy(toSerialProxy(obj as any));
									} else {
										so = obj;
									}
								}
								break;
							}
							case 'Array': {
								let arr: Array<any>;
								if (!Array.isArray(obj)) {
									if (obj instanceof Object && 'length' in obj) {
										arr = Array.from(obj);
									} else {
										throw TypeError(
											`ERR_INVALID_TYPE: Class: ${classToken.toString()} Property: ${prop.toString()} is not a valid ${
												config.type
											} Object: ${JSON.stringify(obj)}`
										);
									}
								} else {
									arr = obj;
								}

								if (config.proxy) {
									so = toSerialIterator(arr);
								} else {
									so = toSerial(arr);
								}
								break;
							}
							case 'Set': {
								if (!(obj instanceof Set)) {
									throw TypeError(
										`ERR_INVALID_TYPE: Class: ${classToken.toString()} Property: ${prop.toString()} is not a valid ${
											config.type
										} Object: ${JSON.stringify(obj)}`
									);
								} else {
									if (config.proxy) {
										so = toSerialIterator(obj as any);
									} else {
										so = toSerial(obj);
									}
								}
								break;
							}
							case 'Map': {
								if (!(obj instanceof Map)) {
									throw TypeError(
										`ERR_INVALID_TYPE: Class: ${classToken.toString()} Property: ${prop.toString()} is not a valid ${
											config.type
										} Object: ${JSON.stringify(obj)}`
									);
								} else {
									if (config.proxy) {
										so = toSerialIterator(obj as any);
									} else {
										so = toSerial(obj);
									}
								}
								break;
							}
							default: {
								throw TypeError(
									`ERR_INVALID_DESCRIPTOR_TYPE: Class: ${classToken.toString()} Property: ${prop.toString()} contains an invalid descriptor Type: ${
										config.type
									}`
								);
							}
						}

						// set value in cache because
						// comlink will call this a second time.
						setCacheValue(_target, prop, so);
						return so;
					} else {
						return Reflect.get(_target, prop, receiver);
					}
				},
				has(_target, prop) {
					if (prop === Comlink.finalizer) return true;
					return Reflect.has(_target, prop);
				},
			});
		};
		Comlink.expose(createProxy(obj), port1);
		return port2;
	}

	/**
	 * It creates a proxy that wraps the remote object and returns it
	 * @param {MessagePort} port2 - MessagePort - The port that the proxy will use to communicate with the
	 * worker.
	 * @param proxyDescr - Dictionary<SerializePropertyDescriptor>
	 * @returns A proxy object that is a wrapper around the object that was passed in.
	 */
	private wrap(port2: MessagePort, proxyDescr: Dictionary<SerializePropertyDescriptor>) {
		const createProxy = (
			target: Comlink.Remote<SerializableObject<T>> | Function,
			descr: Dictionary<SerializePropertyDescriptor> = {}
		) => {
			return new Proxy(target, {
				getPrototypeOf(_target) {
					return _target;
				},
				get(_target, prop, _receiver): any {
					if (typeof prop === 'symbol') {
						if (prop === Comlink.proxyMarker) {
							return true;
						} else if (prop === Symbol.iterator) {
							return () => Reflect.get(_target, prop);
						} else if (prop === Symbol.asyncIterator) {
							return () => Reflect.get(_target, prop);
						} else {
							return Reflect.get(_target, prop);
						}
					} else {
						const config = descr[prop];
						if (config) {
							if (config.type === 'Serializable') {
								if (config.proxy) {
									return Reflect.get(_target, prop);
								} else {
									return Reflect.get(_target, prop);
								}
							} else if (config.type === 'Array' || config.type === 'Set' || config.type === 'Map') {
								if (config.proxy) {
									return Reflect.get(_target, prop);
								} else {
									return Reflect.get(_target, prop);
								}
							}
						}
						return createProxy(Reflect.get(_target, prop));
					}
				},
				set(_target, prop, val, receiver) {
					return Reflect.set(_target, prop, val, receiver);
				},
				apply(_target, thisArg, argArray) {
					if (typeof _target === 'function') return Reflect.apply(_target, thisArg, argArray);
				},
				has(_target, prop) {
					return Reflect.has(_target, prop);
				},
			});
		};
		const proxy = Comlink.wrap<SerializableObject<T>>(port2);
		return createProxy(proxy, proxyDescr) as Comlink.Remote<SerializableObject<T>>;
	}

	public hashCode(): number {
		return hashCd(this._id);
	}

	public equals(other: unknown) {
		return other instanceof SerialProxy && other._id === this._id;
	}
}
