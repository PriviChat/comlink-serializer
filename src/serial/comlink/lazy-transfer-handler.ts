import * as Comlink from 'comlink';
import { Serializable } from '../decorators';
import SerialSymbol from '../serial-symbol';
import { isSerializableObject } from '../decorators/utils';

export default class LazyTransferHandler {
	private objValueCache = new WeakMap<object, Map<string | symbol, any>>();
	constructor() {}

	private expose = (orgObj: Serializable, channel: MessageChannel) => {
		const getCacheValue = (lookupObj: Object, prop: string) => {
			const propVals = this.objValueCache.get(lookupObj);
			if (!propVals) return undefined;
			propVals.get(prop);
		};
		const setCacheValue = (lookupObj: Object, prop: string | symbol, val: any) => {
			if (!this.objValueCache.has(lookupObj)) {
				this.objValueCache.set(lookupObj, new Map());
			}
			this.objValueCache.get(lookupObj)?.set(prop, val);
			return val;
		};
		const createProxy = (target: Serializable): any => {
			return new Proxy(target, {
				getPrototypeOf(_target) {
					return _target;
				},
				get(_target, prop, receiver): any {
					if (prop && typeof prop === 'string') {
						const cv = getCacheValue(_target, prop);
						if (cv) return cv;

						if (isSerializableObject(_target)) {
							const desc = _target[SerialSymbol.serializeDescriptor]();
							const classToken = _target[SerialSymbol.classToken]();
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

									return arr;
									/* const proxyArr = new Proxy(arr, {
											get(target, childProp, receiver) {
												if (typeof childProp === 'string') {
													const cacheValue = propValueCache.get(`${prop}.${childProp}`);
													if (cacheValue) return cacheValue;

													if (childProp === Symbol.asyncIterator.toString()) {
														const fn = () => toSerialIterable(arr[Symbol.iterator](), channel);
														propValueCache.set(`${prop}.${childProp}`, fn);
														return fn;
													}
												}
												return Reflect.get(target, childProp, receiver);
											},
											has: (target, prop) => {
												if (prop === Symbol.asyncIterator) return true;
												else return prop in target;
											},
										});
										propValueCache.set(parentProp, proxyArr);
										return proxyArr; */

									//const lazyArr = lazy(new SerialArray().append(orgArr));
									/* return new Proxy(orgArr, {
										getPrototypeOf(target) {
											return target;
										},
										get(target, prop, receiver) {
											if (prop === Symbol.asyncIterator.toString()) {
												const irr = toSerialIterable(target);
												return irr;
											}
											return Reflect.get(orgArr, prop, receiver);
										},
										has: (target, prop) => {
											if (prop === Symbol.asyncIterator) return true;
											else return prop in target;
										},
									}); */
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
		};
		Comlink.expose(createProxy(orgObj), channel.port1);
	};

	public get handler() {
		const comlink: Comlink.TransferHandler<Serializable | Comlink.Remote<Serializable>, Transferable> = {
			canHandle: function (value: any): value is Serializable {
				if (!value) return false;
				if (value[SerialSymbol.serialLazy]) return true;
				return false;
			},
			serialize: (object: Serializable) => {
				const channel = new MessageChannel();
				const origObj = Object.getPrototypeOf(object);
				this.expose(origObj, channel);
				return [channel.port2, [channel.port2]];
			},
			deserialize: (port2: MessagePort) => {
				port2.start();
				const proxy = Comlink.wrap<Serializable>(port2);
				return proxy;
			},
		};
		return comlink;
	}
}
