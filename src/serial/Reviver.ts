import { traverse, TraversalCallbackContext } from 'object-traversal';
import { Revivable, Serializable, SerialMeta } from './decorators';
import { ParentRef, ReviveType, Serialized, SerialPrimitive } from './types';
import objectRegistry from '../registry';
import { isSerializedObject } from './decorators/utils';
import { ObjectRegistryEntry } from '../registry';
import SerialSymbol from './serial-symbol';
import SerialArray from './serial-array';
import SerialMap from './serial-map';
import SerialProxy from './serial-proxy';
import { ProxyWrapper } from './comlink';

export default class Reviver {
	private revivedCache = new Map<string, Revivable>();
	private noTraversal = new Set<string>([
		SerialArray.classToken.toString(),
		SerialMap.classToken.toString(),
		SerialProxy.classToken.toString(),
	]);

	/**
	 * It creates an instance of the class that is registered with the given token
	 * @param {ObjectRegistryEntry} entry - ObjectRegistryEntry - This is the entry that was found in the
	 * registry.
	 * @returns An instance of the class that was registered.
	 */
	private create<T extends Serializable>(entry: ObjectRegistryEntry): Revivable {
		if (entry.classToken === SerialArray.classToken) {
			return new SerialArray<T>();
		} else if (entry.classToken === SerialMap.classToken) {
			return new SerialMap<SerialPrimitive, T>();
		} else {
			return Object.create(entry.constructor.prototype);
		}
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

	public revive<R extends ReviveType>(serialObj: Serialized, parentRef?: ParentRef): R {
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

			let inCache = this.revivedCache.has(hash);
			const revived = inCache ? this.revivedCache.get(hash)! : this.create(entry);

			if (!inCache) {
				// add revived item to map for traverser
				this.revivedCache.set(hash, revived);

				if (revived.revive) {
					// hook to override the default reviver
					revived.revive(serialObj, { revive: this.revive, parentRef });
				} else {
					traverse(serialObj, this.traverser);
				}
			}

			// return proxy
			if (revived instanceof SerialProxy) {
				return ProxyWrapper.wrap(revived, parentRef) as R;
			}

			if (revived.afterRevived) {
				// hook after the object has been revived
				revived.afterRevived();
			}

			if (revived instanceof SerialArray) {
				return SerialArray.toArray(revived) as R;
			} else if (revived instanceof SerialMap) {
				return SerialMap.toMap(revived) as R;
			} else {
				return revived as R;
			}
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
				if (this.noTraversal.has(serialMeta.classToken)) {
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
				const revParent = this.revivedCache.get(hash);
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
						revVal = this.revive(value, {
							parent: revParent as Serializable,
							classToken: serialMeta.classToken,
							prop: key,
						});
					} else {
						revVal = value;
					}
				} else {
					revVal = value;
				}

				// SerialProxy cannot be modified
				if (revParent.afterPropertyRevived && !(value instanceof SerialProxy)) {
					// hook to allow upadates to revived objects before assigning
					value = revParent.afterPropertyRevived(key, value);
				}

				// assign revived value to parent
				Object.assign(revParent, { [key]: value });
			}
		}
	};
}
