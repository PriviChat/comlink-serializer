import { traverse, TraversalCallbackContext } from 'object-traversal';
import Serializable, { SerializableObject } from './decorators/Serializable';
import { Serialized } from './types';
import objectRegistry from '../registry';
import SerialSymbol from './SerialSymbol';
import { SerialMeta } from './decorators';
import { isSerializableObject, isSerializedObject } from './decorators/utils';
import { ObjectRegistryEntry } from '../registry/types';
import { SerialArray, SerialMap } from '@comlink-serializer-internal';

export default class Reviver {
	private revivedMap = new Map<string, SerializableObject<any, any>>();

	/**
	 * If the entry is a SerialArray or SerialMap, create a new instance of that class. Otherwise, create
	 * a new instance of the entry's constructor
	 * @param {ObjectRegistryEntry} entry - ObjectRegistryEntry
	 * @returns An object that is an instance of the constructor function.
	 */
	private create(entry: ObjectRegistryEntry) {
		if (entry.name === 'SerialArray') {
			return new SerialArray();
		} else if (entry.name === 'SerialMap') {
			return new SerialMap();
		} else {
			return Object.create(entry.constructor.prototype);
		}
	}

	private reviveSerializableSymbol(serialObj: any) {
		if (isSerializedObject(serialObj)) return serialObj;

		const serSymStr = "'" + SerialSymbol.serializable.toString() + "'";
		if (serSymStr in serialObj) {
			const meta = serialObj[serSymStr] as SerialMeta;
			if (meta) {
				Object.assign(serialObj, {
					[SerialSymbol.serializable]: () => {
						return {
							...meta,
						};
					},
				});
				delete (serialObj as any)[serSymStr];
			}
		}
		return serialObj;
	}
	public revive<T extends Serializable>(serialObj: Serialized, rootObj = false): T {
		// make sure obj is parse-able
		// TODO investigae why if SerialArray is put back through the transfer handler it's items are not valid Object even though it has the prototype Object.
		if (rootObj) {
			try {
				serialObj = JSON.parse(JSON.stringify(serialObj));
			} catch {
				const err = `ERR_INVALID_OBJECT: Serialized object does not contain valid json. Object: ${JSON.stringify(
					serialObj
				)}`;
				throw TypeError(err);
			}
		}
		serialObj = this.reviveSerializableSymbol(serialObj);

		if (isSerializedObject(serialObj) && serialObj[SerialSymbol.serializable]()) {
			const { rid, cln, hsh } = serialObj[SerialSymbol.serializable]();
			if (!rid) {
				const err = `ERR_MISSING_RID: Object not deserializable. Missing meta property: rid. Object: ${JSON.stringify(
					serialObj
				)} - Make sure you have properly decorated your class with @Serializable.`;
				console.error(err);
				throw TypeError(err);
			}

			if (!hsh) {
				const err = `ERR_MISSING_HSH: Object not deserializable, missing meta property: hsh. Object: ${JSON.stringify(
					serialObj
				)} - Make sure you have properly decorated your class with @Serializable.`;
				console.error(err);
				throw TypeError(err);
			}
			if (!cln) {
				const wrn = `WRN_MISSING_CLN: Object with rid: ${rid} is missing meta property: cln. Object: ${JSON.stringify(
					serialObj
				)}`;
				console.warn(wrn);
			}

			const entry = objectRegistry.getEntry(rid);
			if (!entry) {
				const err = `ERR_MISSING_REG: Object with rid: ${rid} and cln: ${cln} not found in registry.
					 Make sure you are property configuring the transfer handler. Remember the object must be registered on each thread.`;
				console.error(err);
				throw new Error(err);
			}

			const revived = this.create(entry);
			if (!isSerializableObject<T>(revived)) {
				const err = `ERR_DESERIAL_FAIL: The deserialized object with rid: ${rid} and cln: ${cln} is missing Symbol: [${SerialSymbol.serializable.toString()}]. There is a known issue with babel and using legacy decorators. See README for a workaround.`;
				console.error(err);
				throw new TypeError(err);
			}

			if (!this.revivedMap.has(hsh)) this.revivedMap.set(hsh, revived);
			if (revived.revive) {
				revived.revive(serialObj, this);
			} else {
				traverse(serialObj, this.traverser);
			}
			return revived;
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
				const serialMeta = parent[SerialSymbol.serializable]();
				const hash = serialMeta.hsh;
				if (!hash) {
					const err = `ERR_MISSING_HSH: Parent Object: ${JSON.stringify(
						parent
					)} not deserializable, missing meta property: hsh.`;
					throw TypeError(err);
				}
				const parentRev = this.revivedMap.get(hash);
				if (!parentRev) {
					const err = `ERR_MISSING_REVIVED: Parent Object: ${JSON.stringify(
						parent
					)} - not found in revivedMap using key: ${hash} while processing Child Object: ${JSON.stringify(value)}`;
					throw TypeError(err);
				}
				if (typeof value === 'object') {
					value = this.reviveSerializableSymbol(value);
					if (isSerializedObject(value)) {
						const childRev = this.revive(value);
						parentRev.assign(key, childRev);
					} else {
						parentRev.assign(key, value);
					}
				} else {
					parentRev.assign(key, value);
				}
			}
		}
	};
}
