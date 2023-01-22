import { releaseProxy } from 'comlink';
import { ParentRef, SerialProxy } from '../../serial';
import { Serializable, SerializableObject } from '../decorators';
import { isSerializableObject } from '../decorators/utils';

export default class ProxyWrapper {
	private objValueCache = new WeakMap<object, Map<string | symbol, any>>();

	private constructor(private obj: Serializable) {}

	static wrap<T extends Serializable>(revived: SerialProxy<T>, parentRef?: ParentRef) {
		if (!isSerializableObject(revived)) return revived;
		const wrapper = new ProxyWrapper(revived);
		return wrapper.wrap<T>(revived, parentRef);
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

	private wrap<T extends Serializable>(target: SerialProxy<T>, parentRef?: ParentRef) {
		let resolved: SerializableObject<T>;
		return new Proxy(target, {
			getPrototypeOf(_target) {
				return _target;
			},
			async get(_target, prop, receiver): Promise<any> {
				if (!resolved) {
					const proxy = _target.getProxy();
					if (parentRef) {
						resolved = await proxy.self;
						proxy[releaseProxy];
						Object.assign(parentRef.parent, { [parentRef.prop]: resolved });
					}
				}
				const val = Reflect.get(resolved, prop);
				return val;
			},
		});
	}
}
