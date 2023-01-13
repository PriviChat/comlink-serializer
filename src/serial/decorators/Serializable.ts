import 'reflect-metadata';
import hash from 'object-hash';
import objectRegistry from '../../registry';
import Reviver from '../Reviver';
import Serializer from '../serializer';
import SerialSymbol from '../SerialSymbol';
import { AnyConstructor, Dictionary, SerializeCtx, Serialized } from '../types';
import {
	SerialClassToken,
	SerializeDescriptorProperty,
	SerialMeta,
	SerialPropertyMetadataKey,
	ValueObject,
} from './types';

interface Serializable<S extends Serialized = Serialized> extends ValueObject {
	revive?(serialObj: S, reviver: Reviver): void;
	serialize?(ctx?: SerializeCtx): S;
}

export interface SerializableObject<T extends Serializable = Serializable> extends Serializable {
	[SerialSymbol.serializable](): SerialMeta;
	[SerialSymbol.classToken](): SerialClassToken;
	[SerialSymbol.serializeDescriptor](): Dictionary<SerializeDescriptorProperty>;
	serialize(ctx?: SerializeCtx): Serialized;
	assign(key: string, value: any): SerializableObject<T>;
}

interface SerializableSettings {}

type SerializableCtor<S extends Serialized> = AnyConstructor<Serializable<S>>;

function Serializable<S extends Serialized, T extends Serializable<S>, Ctor extends SerializableCtor<S>>(
	classToken: SerialClassToken,
	settings?: SerializableSettings
): (base: Ctor) => any {
	return function (base: Ctor) {
		let serializeDescriptor: Dictionary<SerializeDescriptorProperty>;

		const serializable = class Serializable extends base implements SerializableObject<T> {
			constructor(...args: any[]) {
				super(...args);
			}

			[SerialSymbol.serializable](): SerialMeta {
				return {
					classToken: classToken.toString(),
					hash: undefined,
				};
			}

			[SerialSymbol.classToken](): SerialClassToken {
				return classToken;
			}

			[SerialSymbol.serializeDescriptor](): Dictionary<SerializeDescriptorProperty> {
				if (!serializeDescriptor) {
					serializeDescriptor = this.getSerializeDescriptor();
				}
				return serializeDescriptor;
			}

			/* Getting the serialize descriptor from the prototype chain. */
			private getSerializeDescriptor() {
				let rtnDescr: Dictionary<SerializeDescriptorProperty> = {};
				let target = Object.getPrototypeOf(this);
				while (target != Object.prototype) {
					const foundDescr = Reflect.getOwnMetadata(SerialPropertyMetadataKey, target) || undefined;
					if (foundDescr) {
						rtnDescr = foundDescr;
						break;
					}
					target = Object.getPrototypeOf(target);
				}
				return rtnDescr;
			}
			/**
			 * > It serializes the object
			 * @param {SerializeCtx} ctx - SerializeCtx = new Serializer()
			 * @returns The serialized object.
			 */
			public serialize(ctx: SerializeCtx = new Serializer()): S {
				const serialMeta = this[SerialSymbol.serializable]();
				let serialObj;

				if (super.serialize) {
					serialObj = super.serialize(ctx);
				} else {
					const classToken = this[SerialSymbol.classToken]();
					const descr = this[SerialSymbol.serializeDescriptor]();
					serialObj = ctx.serialize(this, classToken, descr) as S;
				}

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
				// escaped for serialization
				const escSym = "'" + SerialSymbol.serialized.toString() + "'";
				Object.assign(serialObj, { [escSym]: serialMeta });

				return serialObj;
			}

			/**
			 * Assigns a value to a key (property) in an object.
			 * @param {string} key - The name of the property to assign.
			 * @param {any} value - The value to be assigned to the key.
			 * @returns The object itself.
			 */
			public assign(key: string, value: any) {
				Object.assign(this, { [key]: value });
				return this;
			}
		};

		objectRegistry.register({
			classToken,
			constructor: serializable,
		});

		return serializable;
	};
}

export default Serializable;
