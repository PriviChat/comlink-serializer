import objectRegistry from '../../registry';
import Deserializer from '../Deserializer';
import SerialSymbol from '../SerialSymbol';
import { AnyConstructor, Serialized } from '../types';
import { generateId } from './utils';

export interface Deserializable<S extends Serialized, T extends Serializable<S>> {
	deserialize(data: S, deserializer: Deserializer): T | null;
}

interface Serializable<S extends Serialized = Serialized> {
	serialize(): S | null;
}

export interface SerializableObject extends Serializable {
	[SerialSymbol.registryId]: string;
	[SerialSymbol.class]: string;
	isSerializable: boolean;
	deserialize(data: Serialized, deserializer: Deserializer): Serializable;
	serialize(): Serialized;
}

interface SerializableSettings {
	name?: string;
}

type SerializableCtor<S extends Serialized, T extends Serializable<S>> = AnyConstructor<
	Serializable<S> & Deserializable<S, T>
>;

function Serializable<S extends Serialized, T extends Serializable<S>, Ctor extends SerializableCtor<S, T>>(
	settings?: SerializableSettings
): (base: Ctor) => any {
	return function (base: Ctor) {
		const serializedObject = class SerializedObject extends base implements SerializableObject {
			[SerialSymbol.registryId] = generateId(settings.name ?? base.name);
			[SerialSymbol.class] = settings.name ?? base.name;

			constructor(...args: any[]) {
				super(...args);
			}

			public get isSerializable() {
				return true;
			}

			public serialize(): S {
				let serialObj = super.serialize();
				if (!serialObj) {
					serialObj = JSON.stringify(this) as unknown as S;
				}
				serialObj = {
					...serialObj,
					['' + SerialSymbol.registryId.toString() + '']: this[SerialSymbol.registryId],
					['' + SerialSymbol.class.toString() + '']: this[SerialSymbol.class],
				};
				return serialObj;
			}

			public deserialize(data: S, deserializer: Deserializer): T {
				const deserObj = super.deserialize(data, deserializer);
				if (deserObj) return deserObj;
				else return Object.assign(this, data) as unknown as T;
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
