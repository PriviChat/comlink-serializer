import hash from 'object-hash';
import objectRegistry from '../../registry';
import Reviver from '../Reviver';
import SerialSymbol from '../SerialSymbol';
import { AnyConstructor, Serialized } from '../types';
import { SerialMeta, ValueObject } from './types';
import { generateId } from './utils';

interface Serializable<S extends Serialized = Serialized> extends ValueObject {
	serialize(): S;
	revive?(serialObj: S, reviver: Reviver): void;
}

export interface SerializableObject<S extends Serialized, T extends Serializable<S>> extends Serializable<S> {
	[SerialSymbol.serializable](): SerialMeta;
	serialize(): S;
	assign(key: string, value: any): SerializableObject<S, T>;
}

interface SerializableSettings {
	class?: string;
}

type SerializableCtor<S extends Serialized> = AnyConstructor<Serializable<S>>;

function Serializable<S extends Serialized, T extends Serializable<S>, Ctor extends SerializableCtor<S>>(
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
					hsh: undefined,
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
				// escaped for serialization
				Object.assign(serialObj, { ["'" + SerialSymbol.serializable.toString() + "'"]: meta });

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
			constructor: serializedObject,
			id: generateId(className),
			name: className,
		});

		return serializedObject;
	};
}

export default Serializable;
