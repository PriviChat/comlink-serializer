import objectRegistry from '../../registry';
import Deserializer from '../Deserializer';
import SerialSymbol, { symDes } from '../SerialSymbol';
import { AnyConstructor, Serialized } from '../types';
import { generateId } from './utils';

export interface Deserializable<S extends Serialized, T extends Serializable<S>> {
	deserialize?(data: S, deserializer: Deserializer): T;
}

interface Serializable<S extends Serialized = Serialized> {
	serialize(): S;
	/**
	 * True if 'this' and the 'other' object which is being serialized are equal.
	 */
	equals(other: unknown): boolean;
}

export interface SerializableObject extends Serializable {
	[SerialSymbol.registryId]: string;
	[SerialSymbol.class]: string;
	[SerialSymbol.serializable]: boolean;
	serialize(): Serialized;
	deserialize(data: Serialized, deserializer: Deserializer): Serializable;
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
		const serializedObject = class SerializedObject extends base implements SerializableObject {
			[SerialSymbol.serializable] = true;
			[SerialSymbol.registryId] = generateId(className);
			[SerialSymbol.class] = className;

			constructor(...args: any[]) {
				super(...args);
			}

			public serialize(): S {
				let serialObj = super.serialize();
				if (Object.keys(serialObj).length === 0) {
					serialObj = JSON.stringify(this) as unknown as S;
				}
				serialObj = {
					...serialObj,
					[symDes(SerialSymbol.registryId)]: this[SerialSymbol.registryId],
					[symDes(SerialSymbol.class)]: this[SerialSymbol.class],
				};
				return serialObj;
			}

			public deserialize(serialObj: S, deserializer: Deserializer): T {
				delete serialObj[symDes(SerialSymbol.registryId) as keyof S];
				delete serialObj[symDes(SerialSymbol.class) as keyof S];
				Object.assign(this, { [SerialSymbol.serializable]: true });
				Object.assign(this, { [SerialSymbol.registryId]: generateId(className) });
				Object.assign(this, { [SerialSymbol.class]: className });
				if (super.deserialize) {
					const obj = super.deserialize(serialObj, deserializer);
					return obj;
				} else {
					return Object.assign(this, serialObj) as unknown as T;
				}
			}
		};
		objectRegistry.register({
			constructor: serializedObject,
			id: generateId(base.name),
			name: base.name,
		});

		return serializedObject;
	};
}

export default Serializable;
