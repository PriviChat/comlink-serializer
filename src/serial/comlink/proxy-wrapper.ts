import * as Comlink from 'comlink';
import { SerialProxy } from '../../serial';
import { Serializable, SerializableObject } from '../decorators';
import { isSerializableObject } from '../decorators/utils';
import SerialSymbol from '../serial-symbol';
import { isSerialProxy } from '../utils';

export default class ProxyWrapper {
	private objValueCache = new WeakMap<object, Map<string | symbol, any>>();

	private constructor() {}

	static wrap<T extends Serializable>(revived: SerialProxy<T>) {
		const wrapper = new ProxyWrapper();
		return wrapper.wrap<T>(revived);
	}

	static expose<T extends Serializable>(obj: T, port1: MessagePort) {
		const wrapper = new ProxyWrapper();
		Comlink.expose(wrapper.expose<T>(obj), port1);
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

	private expose<T extends Serializable>(orgObj: T) {
		const getCacheValue = this.getCacheValue;
		const setCacheValue = this.setCacheValue;
		return new Proxy(orgObj, {
			getPrototypeOf(_target) {
				return _target;
			},
			get(_target, prop, receiver): any {
				if (prop && typeof prop === 'string') {
					const cv = getCacheValue(_target, prop);
					if (cv) return cv;

					if (isSerializableObject(_target)) {
						const desc = _target[SerialSymbol.serializeDescriptor]();
						const classToken = _target[SerialSymbol.classToken];
						const config = desc[prop];
						if (config) {
							if (config.type === 'Serializable') {
								const obj = Reflect.get(_target, prop);
								setCacheValue(_target, prop, obj);
								if (isSerializableObject(obj)) {
									return obj;
								} else {
									const err = `ERR_NOT_SERIALIZABLE: The prop: ${prop} on class: ${classToken.toString()} cannot be decorated with @Serialize. You may only decorate Serializable, Array or Map with @Serialize.`;
									console.error(err);
									throw new TypeError(err);
								}
							} else if (config.type === 'Array') {
								const arr = Reflect.get(orgObj, prop);
								return setCacheValue(_target, prop, arr);
							}
						}
					}
				}
				if (_target !== receiver) {
					return Reflect.get(receiver, prop);
				} else {
					const v = Reflect.get(_target, prop, receiver);
					return setCacheValue(_target, prop, v);
				}
			},
			apply(_target, thisArg, argArray) {
				const orgObj = Object.getPrototypeOf(_target);
				return Reflect.apply(orgObj, thisArg, argArray);
			},
			has(_target, p) {
				return p in _target;
			},
		});
	}

	private wrap<T extends Serializable>(sp: SerialProxy<T>) {
		let transfered: SerializableObject<T>;
		const createProxy = (target: SerialProxy<T> | Comlink.Remote<SerializableObject<T>> | Function) => {
			return new Proxy(target, {
				getPrototypeOf(_target) {
					return _target;
				},
				get(_target, prop, _receiver): any {
					if (typeof prop === 'string') {
						if (typeof _target === 'function') {
							if (prop === 'then') {
								return Reflect.get(_target, prop);
							}
						} else if (isSerialProxy(_target)) {
							if (prop === 'transfer') {
								if (transfered) return () => transfered;
								else {
									const transfer = async () => {
										transfered = await _target.transfer();
										return transfered;
									};
									return transfer;
								}
							} else {
								return createProxy(Reflect.get(_target.getProxy(), prop));
							}
						} else {
							return createProxy(Reflect.get(_target, prop));
						}
					}
				},
				set(_target, prop, val, receiver) {
					if (typeof _target === 'function') return false;
					else if (isSerialProxy(_target)) return Reflect.set(_target.getProxy(), prop, val, receiver);
					else return Reflect.set(_target, prop, val, receiver);
				},
				apply(_target, thisArg, argArray) {
					if (typeof _target === 'function') return Reflect.apply(_target, thisArg, argArray);
				},
				has(_target, prop) {
					if (typeof _target === 'function') return false;
					else if (isSerialProxy(_target)) return prop in sp.getProxy();
					else return prop in _target;
				},
			});
		};
		return createProxy(sp);
	}
}
