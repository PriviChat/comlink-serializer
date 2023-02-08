import { traverse, TraversalCallbackContext } from 'object-traversal';
import { ParentRef, SerialArray, SerializeCtx, SerializedCacheEntry, SerialMap, SerialProxy } from '../serial';
import { Serializable, SerializableObject, SerializedHash } from './decorators';
import { isSerializableObject, serializedHash } from './decorators/utils';
import SerialSymbol from './serial-symbol';
import { Serialized } from './types';
import { isProxy } from './utils';

export default class Serializer {
	/*
	 * A cache of Serialized objects based on instance equality.
	 */
	private serialInstanceCache = new WeakMap<Serializable, Serialized>();
	/*
	 * A cache of serializable / Serialized objects based on a uuid.
	 */
	private serialCache = new Map<SerializedHash, SerializedCacheEntry>();

	private transfers = new Array<Transferable>();
	constructor() {}

	get transferable(): Array<Transferable> {
		return this.transfers;
	}

	private addTransferable = (transfer: Transferable | Array<Transferable>): void => {
		if (Array.isArray(transfer)) this.transfers = this.transfers.concat(transfer);
		else this.transfers.push(transfer);
	};

	/* Checking the cache for a serialized object. */
	private checkSerialCache = <S extends Serialized>(obj: SerializableObject & Serializable): S | undefined => {
		// first check for an instance hit
		const hit = this.serialInstanceCache.get(obj);
		if (hit) return hit as S;

		// get user defined hashCode for obj
		const hashCode = obj.hashCode();
		// if hash is -1
		// hash was not generated
		if (hashCode < 0) return undefined;

		const classToken = obj[SerialSymbol.classToken]();
		// build serialized hash
		const hash = serializedHash(hashCode, classToken);
		// check for cache hit
		const entryHit = this.serialCache.get(hash);
		// if cache miss
		if (!entryHit) return undefined;
		// if chache hit, still check for equality
		// due to possible hash collisions
		if (!obj.equals(entryHit.obj)) return undefined;
		// finally return cached value
		return entryHit.serialObj as S;
	};

	/* A method that is used to cache serialized objects. */
	private updateSerialCache = <S extends Serialized>(
		obj: SerializableObject & Serializable,
		serialObj: S
	): SerializedHash => {
		let hash: string | undefined;

		//check for obj in instance cache
		const hit = this.serialInstanceCache.get(obj);
		if (hit) {
			const meta = hit[SerialSymbol.serialized];
			// grab hash if it's already been set
			if (meta) hash = meta.hash;
		} else {
			// set in instance cache
			this.serialInstanceCache.set(obj, serialObj);
		}

		if (!hash) {
			// get user defined hashCode for obj
			const hashCode = obj.hashCode();
			const classToken = obj[SerialSymbol.classToken]();

			// generate hash
			if (hashCode < 0) {
				// if hashCode is less than zero no valid hashCode
				// could be created, pass -1
				hash = serializedHash(-1, classToken);
			} else {
				hash = serializedHash(hashCode, classToken);
			}
			//check if hash exists
			let hit = this.serialCache.get(hash);
			if (hit) {
				// must check equals due to collision
				// if objs are equal it has already been cached
				// so return the valid hash
				if (obj.equals(hit.obj)) return hash;
				else {
					// if hashCode > -1 user might actually care about the cache collision
					if (hashCode > -1)
						console.warn(
							`WRN_CACHE_COLLISION: classToken: ${classToken.toString()} hashCode: ${hashCode} obj: ${JSON.stringify(
								obj
							)} had a collision. Generating new cache key.`
						);
					while (hit) {
						// generate random hash
						hash = serializedHash(-1, classToken);
						// test for hit
						hit = this.serialCache.get(hash);
					}
				}
			}
		}
		// at this point hash and must be unique
		// we are caching valid hash with random hash
		this.serialCache.set(hash, { obj, serialObj });
		// return
		return hash;
	};

	/* Serializing an object. */
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

		// check if an already serialized object exists in the cache
		const hit = this.checkSerialCache<S>(obj);
		if (hit) return hit;

		// initialize to empty object
		let serialObj = {} as S;

		// access class symbols
		const classToken = obj[SerialSymbol.classToken]();
		const serialDescr = obj[SerialSymbol.serializeDescriptor]();

		// create serialize context
		const serializeCtx: SerializeCtx = { serialize: this.serialize, addTransferable: this.addTransferable, parentRef };

		// update cache with new serialObj.
		const hash = this.updateSerialCache(obj, serialObj);

		// add the serialized meta to the serialized object
		serialObj[SerialSymbol.serialized] = {
			classToken: classToken.toString(),
			hash,
		};

		// hook before serialize
		if (obj.beforeSerialize) {
			obj.beforeSerialize();
		}

		if (obj.serialize) {
			// hook to override default serializer and merge objs
			serialObj = { ...obj.serialize(serializeCtx), ...serialObj };
		} else {
			traverse(
				obj,
				({ parent, key, value }: TraversalCallbackContext) => {
					if (parent && key) {
						let sv;

						if (isProxy(value)) {
							// this would happen if someone tried to pass an object containing a proxy back through comlink.
							const wrn = `WRN_INVALID_TYPE: Property: ${key} of class: ${classToken.toString()} is a proxy and cannot be re-serialized.`;
							console.error(wrn);
							return;
						}

						// hook before property serialize
						if (obj.beforePropertySerialize) {
							value = obj.beforePropertySerialize(key);
						}

						const sdp = serialDescr ? serialDescr[key] : undefined;
						// if object has a serial descriptor
						if (sdp) {
							let so: Serializable | undefined;
							if (sdp.type === 'Serializable') {
								so = value;
							} else if (sdp.type === 'Array') {
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
						// add property to serialObj
						Object.assign(serialObj, { [key]: sv });
					}
				},
				{ maxDepth: 1, cycleHandling: false }
			);
		}

		// hook after serialize
		if (obj.afterSerialize) {
			const transf = obj.afterSerialize();
			if (transf) this.addTransferable(transf);
		}

		// return
		return serialObj;
	};
}
