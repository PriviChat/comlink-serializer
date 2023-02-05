import * as Comlink from 'comlink';
import { v4 as uuid } from 'uuid';
import { Revivable, SerializableObject, SerializeDescriptorProperty } from './decorators';
import Serializable from './decorators/serializable';
import { Dictionary, ParentRef, SerializeCtx, SerializedProxy } from '.';
import { isSerializableObject } from './decorators/utils';
import SerialSymbol from './serial-symbol';
import { toSerialIterator } from './iterable/utils';
import { hashCd, toSerial, toSerialProxy } from './utils';

@Serializable(SerialSymbol.serialProxy)
class SerialProxy<T extends Serializable> implements Serializable<SerializedProxy>, Revivable<SerializedProxy> {
	private _id = uuid();
	private _port1?: MessagePort;
	private _port2: MessagePort;
	private _proxyClass: string;
	private _proxyDescr: Dictionary<SerializeDescriptorProperty>;
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
		const { port1, port2 } = new MessageChannel();
		this._port1 = port1;
		this._port2 = port2;
		this._obj = obj;
		this._proxyClass = obj[SerialSymbol.classToken].toString();
		this._proxyDescr = obj[SerialSymbol.serializeDescriptor]();
		this._proxyProp = parentRef?.prop;
		this._refClass = parentRef?.classToken.toString();
	}

	[SerialSymbol.serializeDescriptor](): Dictionary<SerializeDescriptorProperty> {
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

	public get revived() {
		return this._port1 === undefined;
	}

	private getCacheValue(lookupObj: Object, prop: string | symbol) {
		const propVals = this.objValueCache.get(lookupObj);
		if (!propVals) return undefined;
		propVals.get(prop);
	}

	private setCacheValue(lookupObj: Object, prop: string | symbol, val: any) {
		if (!this.objValueCache.has(lookupObj)) {
			this.objValueCache.set(lookupObj, new Map());
		}
		this.objValueCache.get(lookupObj)?.set(prop, val);
		return val;
	}

	public toProxy(): Comlink.Remote<SerializableObject<T>> {
		if (this._proxy) return this._proxy;
		if (!this._port2) {
			throw new TypeError('ERR_NO_PORT: Port2 is undefined in call to toProxy()');
		}
		const proxy = Comlink.wrap<SerializableObject<T>>(this._port2);
		this._proxy = this.wrap(proxy);
		return this._proxy;
	}

	public serialize(): SerializedProxy {
		const serialObj: SerializedProxy = {
			id: this._id,
			port: this._port2,
			proxyClass: this.proxyClass,
			proxyProp: this._proxyProp,
			refClass: this._refClass,
		};
		return serialObj;
	}

	public afterSerialize(ctx: SerializeCtx, serialObj: SerializedProxy): SerializedProxy {
		// expose and set port as transferable
		if (!this._port1) {
			throw new TypeError('ERR_NO_PORT: Port1 is undefined in call to expose()');
		}
		ctx.addTransferable(this.expose(this._port1));
		return serialObj;
	}

	public revive(sp: SerializedProxy) {
		this._id = sp.id;
		this._port1 = undefined;
		this._port2 = sp.port;
		this._proxyClass = sp.proxyClass;
		this._proxyProp = sp.proxyProp;
		this._refClass = sp.refClass;
	}

	private expose(port1: MessagePort) {
		const getCacheValue = this.getCacheValue;
		const setCacheValue = this.setCacheValue;
		const sp = this;
		const createProxy = (obj: SerializableObject<T>) => {
			return new Proxy(obj, {
				getPrototypeOf(_target) {
					return _target;
				},
				get(_target, prop, receiver): any {
					const descr = _target[SerialSymbol.serializeDescriptor]();
					const classToken = _target[SerialSymbol.classToken];
					const config = descr[prop.toString()];

					if (config) {
						let so;
						//TODO - add better type checking because of reflection
						if (config.type === 'Serializable') {
							if (config.proxy) {
								so = toSerialProxy(Reflect.get(_target, prop, receiver));
							} else {
								so = Reflect.get(_target, prop, receiver);
							}
						} else if (config.type === 'Array' || config.type === 'Map') {
							if (config.proxy) {
								so = toSerialIterator(Reflect.get(_target, prop, receiver));
							} else {
								so = toSerial(Reflect.get(_target, prop, receiver));
							}
						} else {
							//TODO update error messsage
							throw Error('FIX THIS ERROR');
						}
						return so;
					} else {
						return Reflect.get(_target, prop, receiver);
					}
				},
				has(_target, prop) {
					return Reflect.has(_target, prop);
				},
			});
		};
		Comlink.expose(createProxy(this._obj), port1);
		return this._port2;
	}

	private wrap(proxy: Comlink.Remote<SerializableObject<T>>) {
		//let transfered: SerializableObject<T>;
		const sp = this;
		const createProxy = (target: Comlink.Remote<SerializableObject<T>> | Function) => {
			return new Proxy(target, {
				getPrototypeOf(_target) {
					return _target;
				},
				get(_target, prop, _receiver): any {
					if (typeof prop === 'symbol') {
						if (prop === Comlink.proxyMarker) {
							return true;
						} else if (prop === Symbol.iterator) {
							return Reflect.get(_target, prop);
						} else if (prop === Symbol.asyncIterator) {
							return Reflect.get(_target, prop);
						} else {
							return Reflect.get(_target, prop);
						}
					} else if (typeof prop === 'string') {
						if (prop === 'then' || prop === 'call') {
							return Reflect.get(_target, prop);
						} else {
							return createProxy(Reflect.get(_target, prop));
						}
					} else {
						return Reflect.get(_target, prop);
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
		return createProxy(proxy) as Comlink.Remote<SerializableObject<T>>;
	}

	public hashCode(): number {
		return hashCd(this._id);
	}

	public equals(other: unknown) {
		return other instanceof SerialProxy && other._id === this._id;
	}
}

export default SerialProxy;
