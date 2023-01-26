import { traverse, TraversalCallbackContext } from 'object-traversal';
import { Revivable, Serializable, SerializedObjKey } from './decorators';
import { ExtractRevive, ParentRef, ReviveType, Serialized, SerialPrimitive } from './types';
import objectRegistry from '../registry';
import { isSerialized } from './decorators/utils';
import { ObjectRegistryEntry } from '../registry';
import SerialSymbol from './serial-symbol';
import SerialArray from './serial-array';
import SerialMap from './serial-map';
import SerialProxy from './serial-proxy';
import { ProxyWrapper } from './comlink';
import { serializedObjKey } from './utils';

export default class Reviver {
	private revivedCache = new Map<SerializedObjKey, Revivable>();
	private static NoTraversal = new Set<string>([
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
			const obj = Object.create(entry.constructor.prototype);
			obj.constructor.prototype[SerialSymbol.revived] = () => {
				return true;
			};
			return obj as Revivable;
		}
	}

	public revive = <R extends ReviveType, T extends ExtractRevive<R> = ExtractRevive<R>>(
		serialObj: Serialized,
		parentRef?: ParentRef
	): R => {
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

		if (isSerialized(serialObj)) {
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
				const err = `ERR_MISSING_REG: Object with classToken: ${classToken.toString()} not found in registry.
					 Make sure you are property configuring the transfer handler. Remember the object must be registered on each thread.`;
				console.error(err);
				throw new Error(err);
			}

			let inCache = this.revivedCache.has(serializedObjKey({ classToken, hash }));
			const revived = inCache ? this.revivedCache.get(hash)! : this.create(entry);

			if (!inCache) {
				// add revived item to map for traverser
				this.revivedCache.set(serializedObjKey({ classToken, hash }), revived);

				if (revived.revive) {
					// hook to override the default reviver
					revived.revive(serialObj, { revive: this.revive, parentRef });
				} else {
					traverse(serialObj, this.traverser);
				}
			}

			if (revived.afterRevive) {
				// hook after the object has been revived
				revived.afterRevive();
			}

			if (revived instanceof SerialProxy) {
				return ProxyWrapper.wrap(revived) as R;
			} else if (revived instanceof SerialArray) {
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
	};

	private traverser = ({ parent, key, value }: TraversalCallbackContext) => {
		// null when called from root
		if (parent && key && !key.startsWith('ComSer.')) {
			if (isSerialized(parent)) {
				const serialMeta = parent[SerialSymbol.serialized];

				// do not traverse
				if (Reviver.NoTraversal.has(serialMeta.classToken.toString())) {
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
				const revParent = this.revivedCache.get(serializedObjKey(serialMeta));
				if (!revParent) {
					const err = `ERR_NOT_FOUND: Parent Object: ${JSON.stringify(
						parent
					)} - not found in cache using key: ${hash} while processing Child Object: ${JSON.stringify(value)}`;
					throw TypeError(err);
				}

				let revived;
				// if value is object
				if (typeof value === 'object') {
					if (isSerialized(value)) {
						// value need to be revived
						revived = this.revive(value, {
							parent: revParent as Serializable,
							classToken: serialMeta.classToken,
							prop: key,
						});
					} else {
						revived = value;
					}
				} else {
					revived = value;
				}

				// SerialProxy cannot be modified
				if (revParent.afterPropertyRevive && !(revived instanceof SerialProxy)) {
					// hook to allow upadates to revived objects before assigning
					revived = revParent.afterPropertyRevive(key, revived);
				}

				// assign revived value to parent
				Object.assign(revParent, { [key]: revived });
			}
		}
	};
}
