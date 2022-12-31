import hash from 'object-hash';
import objectRegistry from '../../registry';
import Deserializer from '../Deserializer';
import SerialSymbol, { symDes } from '../SerialSymbol';
import { AnyConstructor, Serialized } from '../types';
import { SerialMeta, ValueObject } from './types';
import { generateId } from './utils';

export interface Deserializable<S extends Serialized, T extends Serializable<S>> {
	deserialize?(data: S, deserializer: Deserializer): T;
}

interface Serializable<S extends Serialized = Serialized> extends ValueObject {
	serialize(): S;
}

export interface SerializableObject<S extends Serialized, T extends Serializable<S>> extends Serializable<S> {
	[SerialSymbol.serializable](): SerialMeta;
	serialize(): S;
	deserialize(data: Serialized, deserializer: Deserializer): T;
}

interface SerializableSettings {
	class?: string;
}

type SerializableCtor<S extends Serialized, T extends Serializable<S>> = AnyConstructor<
	Serializable<S> & Deserializable<S, T>
>;

function Serializable<S extends Serialized, T extends Serializable<S>, Ctor extends SerializableCtor<S, T>>(
	settings?: SerializableSettings
): (base: Ctor) => any {
	return function (base: Ctor) {
		const className = settings?.class ?? base.name;
		const serializedObject = class SerializedObject extends base implements SerializableObject<S, T> {
			constructor(...args: any[]) {
				super(...args);
			}

			[SerialSymbol.serializable](): SerialMeta {
				return {
					rid: generateId(className),
					cln: className,
				};
			}

			/**
			 * > This function is used to serialize a deserialized object of type `T` into an object of type `S`
			 * @returns The serialized object.
			 */
			public serialize(): S {
				let serialObj = super.serialize();
				if (Object.keys(serialObj).length === 0) {
					serialObj = JSON.parse(JSON.stringify(this)) as unknown as S;
				}
				const meta = this[SerialSymbol.serializable]();
				meta.hsh = hash(serialObj);
				// this get's through comlink
				serialObj = Object.assign(serialObj, { ["'" + SerialSymbol.serializable.toString() + "'"]: meta });
				// this gets stripped out when it goes through comlink
				// it's here to satisfy the interface
				serialObj = Object.assign(serialObj, { [SerialSymbol.serializable]: () => meta });
				return serialObj;
			}

			/**
			 * > This function is used to deserialize a serialized object of type `S` into an object of type `T`
			 * @param {S} serialObj - S - the serialized object
			 * @param {Deserializer} deserializer - Deserializer - the deserializer that is deserializing the
			 * object
			 * @returns The object that was deserialized.
			 */
			public deserialize(serialObj: S, deserializer: Deserializer): T {
				delete serialObj[symDes(SerialSymbol.serializable) as keyof S];
				let obj: T;
				if (super.deserialize) {
					// if super implements deserialize
					obj = super.deserialize(serialObj, deserializer);
				} else {
					// default deserializer
					obj = Object.assign(this, serialObj) as unknown as T;
				}
				Object.assign(this, {
					[SerialSymbol.serializable](): SerialMeta {
						return {
							rid: generateId(className),
							cln: className,
						};
					},
				});
				return obj;
			}
		};
		objectRegistry.register({
			constructor: serializedObject,
			id: generateId(className),
			name: className,
		});

		return serializedObject;
	};
}

export default Serializable;
