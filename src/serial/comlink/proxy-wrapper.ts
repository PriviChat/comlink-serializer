import * as Comlink from 'comlink';
import { SerialProxy } from '../../serial';
import { Serializable, SerializableObject } from '../decorators';
import { isSerializableObject } from '../decorators/utils';
import SerialSymbol from '../serial-symbol';

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

	private wrap<T extends Serializable>(target: SerialProxy<T>) {
		let transfered: SerializableObject<T>;
		return new Proxy(target, {
			getPrototypeOf(_target) {
				return _target;
			},
			get(_target, prop, receiver): any {
				if (typeof prop === 'string' && prop === 'transfer') {
					if (transfered) return () => transfered;
					else {
						const transfer = async () => {
							transfered = await _target.transfer();
							return transfered;
						};
						return transfer;
					}
				} else {
					const proxy = _target.getProxy();
					return Reflect.get(proxy, prop, receiver);
				}
			},
			set(_target, prop, val, receiver): any {
				const proxy = _target.getProxy();
				const p = new Promise<boolean>((resolve) => {
					resolve(Reflect.set(proxy, prop, val, receiver));
				});
				return p;
			},
			apply(_target, thisArg, argArray) {
				const proxy = _target.getProxy() as any;
				const p = new Promise<boolean>((resolve) => {
					resolve(Reflect.apply(proxy, thisArg, argArray));
				});
				return p;
			},
			has(_target, p) {
				const proxy = _target.getProxy();
				return p in proxy;
			},
		});
	}
}
