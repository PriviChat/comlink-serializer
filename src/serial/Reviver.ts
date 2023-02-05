import { traverse, TraversalCallbackContext } from 'object-traversal';
import { Revivable, SerialClassToken, Serializable, SerializedHash } from './decorators';
import { ExtractRevive, ParentRef, ReviveType, Serialized, SerialPrimitive } from './types';
import objectRegistry from '../registry';
import { isSerialized } from './decorators/utils';
import { ObjectRegistryEntry } from '../registry';
import SerialSymbol from './serial-symbol';
import SerialArray from './serial-array';
import SerialMap from './serial-map';
import SerialProxy from './serial-proxy';
import { markObjRevived } from './utils';
import { SerialIterableProxy } from './iterable';
import SerialIteratorResult from './iterable/serial-iterator-result';

export default class Reviver {
	private revivedCache = new Map<SerializedHash, Revivable>();
	private static NoTraversal = new Set<SerialClassToken>([
		SerialSymbol.serialArray.toString(),
		SerialSymbol.serialMap.toString(),
		SerialSymbol.serialProxy.toString(),
	]);

	/**
	 * It creates an instance of the class that is registered with the given token.
	 *
	 * @param {ObjectRegistryEntry} entry - ObjectRegistryEntry - This is the entry that was found in the
	 * registry.
	 * @returns An instance of the class that was registered.
	 */
	private create<T extends Serializable>(entry: ObjectRegistryEntry): Revivable {
		if (entry.classToken === SerialSymbol.serialArray) {
			return new SerialArray<T>();
		} else if (entry.classToken === SerialSymbol.serialMap) {
			return new SerialMap<SerialPrimitive, T>();
		} else {
			const obj = Object.create(entry.constructor.prototype);
			return obj;
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

			let inCache = hash ? this.revivedCache.has(hash) : false;
			const revived = inCache && hash ? this.revivedCache.get(hash)! : this.create(entry);

			if (!inCache) {
				if (revived.revive) {
					// hook to override the default reviver
					revived.revive(serialObj, { revive: this.revive, parentRef });
				} else {
					//const parent = parentRef?.parent as Revivable;
					traverse(serialObj, this.traverser(revived), { maxDepth: 1 });
				}

				// update revived property on revivable object
				markObjRevived(revived);

				// add revived item to the cache
				if (hash) {
					this.revivedCache.set(hash, revived);
				}

				if (revived.afterRevive) {
					// hook after the object has been revived
					revived.afterRevive();
				}
			}

			if (revived instanceof SerialProxy) {
				return revived.toProxy() as R;
			} else if (revived instanceof SerialIterableProxy) {
				return revived.toProxy() as R;
			} else if (revived instanceof SerialIteratorResult) {
				return SerialIteratorResult.toIteratorResult(revived) as R;
			} else if (revived instanceof SerialArray) {
				return SerialArray.toArray(revived) as R;
			} else if (revived instanceof SerialMap) {
				return SerialMap.toMap(revived) as R;
			} else {
				return revived as R;
			}
		} else {
			const err = `ERR_MISSING_SYMBOL: Object not revivable. Missing Symbol: [${SerialSymbol.serializable.toString()}] or undefined object returned. Object: ${JSON.stringify(
				serialObj
			)} - Make sure you have properly decorated your class with @Serializable.`;
			console.error(err);
			throw TypeError(err);
		}
	};

	private traverser =
		(revivable: Revivable) =>
		({ parent, key, value }: TraversalCallbackContext) => {
			// null when called from root object
			// ignore any keys that start with 'ComSer.'
			if (parent && key && !key.startsWith('ComSer.')) {
				if (isSerialized(parent)) {
					const serialMeta = parent[SerialSymbol.serialized];

					// do not traverse
					if (Reviver.NoTraversal.has(serialMeta.classToken.toString())) {
						return;
					}

					let revived;
					// if value is object
					if (typeof value === 'object') {
						if (isSerialized(value)) {
							// value need to be revived
							revived = this.revive(value, {
								parent: revivable as Serializable,
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
					if (revivable.afterPropertyRevive && !(revived instanceof SerialProxy)) {
						// hook to allow upadates to revived objects before assigning
						revived = revivable.afterPropertyRevive(key, revived);
					}

					// assign revived value to revivable
					Object.assign(revivable, { [key]: revived });
				}
			}
		};
}
