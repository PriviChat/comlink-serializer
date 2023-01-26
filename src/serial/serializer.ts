import objHash from 'object-hash';
import { traverse, TraversalCallbackContext } from 'object-traversal';
import { ParentRef, SerialArray, SerializeCtx, SerialMap, SerialProxy } from '../serial';
import { Serializable, SerializedObjKey } from './decorators';
import { isSerializableObject } from './decorators/utils';
import SerialSymbol from './serial-symbol';
import { Serialized } from './types';
import { serializedObjHash, serializedObjKey } from './utils';

export default class Serializer {
	private serialObjCache = new WeakMap<Serializable, Serialized>();
	private serialObjKeys = new Set<SerializedObjKey>();

	private transfers = new Array<Transferable>();
	constructor() {}

	get transferable(): Array<Transferable> {
		return this.transfers;
	}

	private addTransferable = (transfer: Transferable): void => {
		this.transfers.push(transfer);
	};

	private checkSerialObjCache = <S extends Serialized>(obj: Serializable): S | undefined => {
		return this.serialObjCache.get(obj) as S | undefined;
	};

	public serialize = <S extends Serialized>(obj: Serializable, parentRef?: ParentRef): S => {
		if (!isSerializableObject(obj)) {
			let err;
			if (parentRef) {
				err = `ERR_NOT_SERIALIZABLE: Property: ${
					parentRef.prop
				} of class: ${parentRef.classToken.toString()} has decorator @Serialize but is not a @Serializable object.`;
			} else {
				err = `ERR_NOT_SERIALIZABLE: Object: ${JSON.stringify(
					obj
				)} is not serializable. All serializable objects must be decoratorated with @Serializable.`;
			}
			console.error(err);
			throw new TypeError(err);
		}

		// if object has already been serialized, return.
		const fromSerialCache = this.checkSerialObjCache<S>(obj);
		if (fromSerialCache) return fromSerialCache;

		const classToken = obj[SerialSymbol.classToken]();
		const serialDescr = obj[SerialSymbol.serializeDescriptor]();
		const serializeCtx: SerializeCtx = { serialize: this.serialize, addTransferable: this.addTransferable, parentRef };

		// initialize to empty object
		let serialObj = {} as S;

		// hook before serialize
		if (obj.beforeSerialize) {
			obj.beforeSerialize();
		}

		if (obj.serialize) {
			// hook to override default serializer
			serialObj = obj.serialize(serializeCtx) as S;
		} else {
			traverse(
				obj,
				({ parent, key, value }: TraversalCallbackContext) => {
					if (parent && key) {
						let sv;

						// hook before property serialize
						if (obj.beforePropertySerialize) {
							value = obj.beforePropertySerialize(key);
						}

						const sdp = serialDescr ? serialDescr[key] : undefined;
						// if object has a serial descriptor
						if (sdp) {
							let so: Serializable | undefined;
							if (sdp.type === 'Serializable') so = value;
							else if (sdp.type === 'Array') {
								if (Array.isArray(value)) {
									so = SerialArray.from(value);
								} else {
									const err = `ERR_INVALID_TYPE: Property: ${key} of class: ${classToken.toString()} has a type Array, but it is not an Array.`;
									console.error(err);
									throw new TypeError(err);
								}
							} else if (sdp.type === 'Map') {
								if (value instanceof Map) {
									so = SerialMap.from(value);
								} else {
									const err = `ERR_INVALID_TYPE: Property: ${key} of class: ${classToken.toString()} has a type Map, but it is not a Map and wont be serialized.`;
									console.error(err);
									throw new TypeError(err);
								}
							}
							if (sdp.proxy && so) {
								const sp = new SerialProxy(so, { parent: obj, classToken, prop: key });
								so = sp;
							}
							if (so) {
								sv = this.serialize(so, { parent: obj, classToken, prop: key });
							} else {
								const err = `ERR_INVALID_TYPE: Property: ${key} of class: ${classToken.toString()} has decorator @Serialize but the property is not a valid type. Valid types are @Serializable, Array, and Map.`;
								console.error(err);
								throw new TypeError(err);
							}
						} else if (Array.isArray(value)) {
							if (value.length < 0) {
								if (isSerializableObject(value[0])) {
									const err = `ERR_MISSING_DECORATOR: Array: ${key} of class ${classToken.toString()} contains @Serializable objects and must be decorated with @Serialize.`;
									console.error(err);
									throw new TypeError(err);
								}
							}
							sv = value;
						} else if (value instanceof Map) {
							if (value.size > 0) {
								const entry = value.entries().next();
								if (isSerializableObject(entry)) {
									const err = `ERR_MISSING_DECORATOR: Map: ${key} of class ${classToken.toString()} contains @Serializable objects and must be decorated with @Serialize.`;
									console.error(err);
									throw new TypeError(err);
								}
							}
							sv = value;
						} else {
							sv = value;
						}
						Object.assign(serialObj, { [key]: sv });
					}
				},
				{ maxDepth: 1 }
			);
		}

		// hook after serialize
		if (obj.afterSerialize) {
			serialObj = obj.afterSerialize(serializeCtx, serialObj) as S;
		}

		// generate serial meta object
		let serialMeta = {
			classToken: classToken.toString(),
			hash: serializedObjHash(obj.hashCode(), classToken),
		};

		// check for the very slim chance of collisions
		// it is very likely if someone does not implement
		// hashCode properly.
		while (this.serialObjKeys.has(serializedObjKey(serialMeta))) {
			serialMeta = {
				classToken: classToken.toString(),
				hash: serializedObjHash(-1, classToken),
			};
		}

		// add the serial meta to the serialized object
		serialObj[SerialSymbol.serialized] = serialMeta;

		// add the objet key to the set
		this.serialObjKeys.add(serializedObjKey(serialMeta));

		// cache the serialized obj
		this.serialObjCache.set(obj, serialObj);

		// return
		return serialObj;
	};
}
