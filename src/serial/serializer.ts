import hash from 'object-hash';
import { traverse, TraversalCallbackContext } from 'object-traversal';
import { ParentRef, SerialArray, SerialMap, SerialProxy } from '../serial';
import { Serializable, SerialMeta } from './decorators';
import { isSerializableObject } from './decorators/utils';
import SerialSymbol from './serial-symbol';
import { Serialized } from './types';

export default class Serializer {
	private transfers = new Array<Transferable>();
	constructor() {}

	get transferable(): Array<Transferable> {
		return this.transfers;
	}

	addTransferable(transfer: Transferable): void {
		this.transfers.push(transfer);
	}

	private assignSerialMeta<S extends Serialized>(serialObj: S, serialMeta: SerialMeta): S {
		// add the meta hash
		serialMeta.hash = hash(serialObj, {
			//don't hash message port
			excludeKeys: function (key) {
				if (key === 'port') {
					return true;
				}
				return false;
			},
		});

		// need for Serialized interface
		Object.assign(serialObj, { [SerialSymbol.serialized]: serialMeta });

		// add as escaped for serialization
		const escSym = "'" + SerialSymbol.serialized.toString() + "'";
		Object.assign(serialObj, { [escSym]: serialMeta });

		// return obj
		return serialObj;
	}

	public serialize<S extends Serialized>(obj: Serializable, parentRef?: ParentRef): S {
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

		const classToken = obj[SerialSymbol.classToken]();
		const serialMeta = obj[SerialSymbol.serializable]();
		const serialDescr = obj[SerialSymbol.serializeDescriptor]();
		let serialObj: S;

		if (obj.beforeSerialize) {
			obj.beforeSerialize();
		}

		if (obj.serialize) {
			serialObj = obj.serialize({ serialize: this.serialize, parentRef }) as S;
		} else {
			serialObj = {} as S;
			traverse(
				obj,
				({ parent, key, value }: TraversalCallbackContext) => {
					if (parent && key) {
						let sv;
						if (obj.beforePropertySerialize) {
							value = obj.beforePropertySerialize(key);
						}
						const sdp = serialDescr ? serialDescr[key] : undefined;
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
							if (sdp.lazy && so) {
								const sp = new SerialProxy(so, key, classToken);
								this.addTransferable(sp.port);
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
		this.assignSerialMeta(serialObj, serialMeta);
		return serialObj;
	}
}
