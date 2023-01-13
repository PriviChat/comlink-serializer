import * as Comlink from 'comlink';
import { traverse, TraversalCallbackContext } from 'object-traversal';
import Serializable, { SerializableObject } from './decorators/Serializable';
import { Serialized } from './types';
import objectRegistry from '../registry';
import SerialSymbol from './SerialSymbol';
import { SerialMeta } from './decorators';
import { isSerializableObject, isSerializedObject, isSerialProxy, toSerializableObject } from './decorators/utils';
import { ObjectRegistryEntry } from '../registry';
import { SerialArray, SerialMap, SerialProxy } from '../serialobjs';

export default class Reviver {
	private revivedCache = new Map<string, Serializable>();
	private static noTraversal = new Set<string>([
		SerialArray.classToken.toString(),
		SerialMap.classToken.toString(),
		SerialProxy.classToken.toString(),
	]);

	/**
	 * If the entry is a SerialArray or SerialMap, create a new instance of that class. Otherwise, create
	 * a new instance of the entry's constructor
	 * @param {ObjectRegistryEntry} entry - ObjectRegistryEntry
	 * @returns An object that is an instance of the constructor function.
	 */
	private create<T extends Serializable>(entry: ObjectRegistryEntry) {
		let rtnObj: SerializableObject<T>;
		if (entry.classToken === SerialArray.classToken) {
			rtnObj = toSerializableObject(new SerialArray());
		} else if (entry.classToken === SerialMap.classToken) {
			rtnObj = toSerializableObject(new SerialMap());
		} else {
			rtnObj = toSerializableObject(Object.create(entry.constructor.prototype));
		}
		return rtnObj;
	}

	/**
	 * It takes a serialized object and converts the symbol property
	 * back to a symbol
	 * @param {any} obj - any - The object to have the symbol revived.
	 * @returns The object that was passed in.
	 */
	private reviveSymbols(obj: any) {
		if (isSerializedObject(obj)) return obj;
		const serSymStr = "'" + SerialSymbol.serialized.toString() + "'";
		const meta = obj[serSymStr] as SerialMeta;
		if (meta) {
			Object.assign(obj, { [SerialSymbol.serialized]: meta });
			delete obj[serSymStr];
		}
		return obj;
	}

	public revive<T extends Serializable>(serialObj: Serialized): T {
		// make sure we are dealing with a valid object
		// TODO investigate why putting an object through comlink and then back causes the instanceof check to fail
		if (!(serialObj instanceof Object)) {
			const warn = `WRN_INVALID_OBJECT: Serialized object is not 'instanceof Object'. Object: ${JSON.stringify(
				serialObj
			)} - Attempting to fix....`;
			console.warn(warn);
			try {
				serialObj = JSON.parse(JSON.stringify(serialObj));
			} catch (err) {
				const error = `ERR_INVALID_OBJECT: Serialized object cannot be fixed. Object: ${JSON.stringify(serialObj)}`;
				throw TypeError(error);
			}
			if (!(serialObj instanceof Object)) {
				const error = `ERR_INVALID_OBJECT: Serialized object cannot be fixed. Object: ${JSON.stringify(serialObj)}`;
				throw TypeError(error);
			} else {
				console.log('Successfully repaired invalid object');
			}
		}

		// convert the symbol property back to a symbol
		serialObj = this.reviveSymbols(serialObj);

		if (isSerializedObject(serialObj)) {
			const { classToken, hash } = serialObj[SerialSymbol.serialized];

			if (!hash) {
				const err = `ERR_MISSING_HASH: Object not deserializable, missing meta property: hash. Object: ${JSON.stringify(
					serialObj
				)} - Make sure you have properly decorated your class with @Serializable.`;
				console.error(err);
				throw TypeError(err);
			}
			if (!classToken) {
				const err = `ERR_MISSING_CLASS Object missing meta property: classToken. Object: ${JSON.stringify(serialObj)}`;
				console.error(err);
				throw TypeError(err);
			}

			const entry = objectRegistry.getEntry(classToken);
			if (!entry) {
				const err = `ERR_MISSING_REG: Object with classToken: ${classToken} not found in registry.
					 Make sure you are property configuring the transfer handler. Remember the object must be registered on each thread.`;
				console.error(err);
				throw new Error(err);
			}

			// check revived cache for object
			let revived = this.revivedCache.get(hash);
			if (revived) {
				if (isSerialProxy(revived)) {
					return revived.getProxy() as T;
				}
				return revived as T;
			} else {
				revived = this.create(entry);
			}

			// add revived item to map for traverser
			this.revivedCache.set(hash, revived);

			if (revived.revive) {
				revived.revive(serialObj, this);
			} else {
				traverse(serialObj, this.traverser);
			}

			// return revived object or comlink proxy
			return isSerialProxy(revived) ? (revived.getProxy() as T) : (revived as T);
		} else {
			const err = `ERR_MISSING_SYMBOL: Object not deserializable. Missing Symbol: [${SerialSymbol.serializable.toString()}] or undefined object returned. Object: ${JSON.stringify(
				serialObj
			)} - Make sure you have properly decorated your class with @Serializable.`;
			console.error(err);
			throw TypeError(err);
		}
	}

	private traverser = ({ parent, key, value }: TraversalCallbackContext) => {
		// null when called from root
		if (parent && key) {
			if (isSerializedObject(parent)) {
				const serialMeta = parent[SerialSymbol.serialized];

				// do not traverse
				if (Reviver.noTraversal.has(serialMeta.classToken)) {
					return;
				}

				// get and validate object hash
				const hash = serialMeta.hash;
				if (!hash) {
					const err = `ERR_MISSING_HASH: Parent Object: ${JSON.stringify(
						parent
					)} not deserializable, missing meta property: hash.`;
					throw TypeError(err);
				}

				// get and validate parent
				const revParent = this.revivedCache.get(hash) as SerializableObject;
				if (!revParent) {
					const err = `ERR_NOT_FOUND: Parent Object: ${JSON.stringify(
						parent
					)} - not found in cache using key: ${hash} while processing Child Object: ${JSON.stringify(value)}`;
					throw TypeError(err);
				}

				let revVal;
				// if value is object
				if (typeof value === 'object') {
					value = this.reviveSymbols(value);
					if (isSerializedObject(value)) {
						// value need to be revived
						revVal = this.revive(value);
					} else {
						revVal = value;
					}
				} else {
					revVal = value;
				}
				// assign revived value to parent
				revParent.assign(key, revVal);
			}
		}
	};
}
