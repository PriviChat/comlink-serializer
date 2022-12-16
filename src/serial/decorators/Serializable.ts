import objectRegistry from '../../registry';
import Deserializer from '../Deserializer';
import { AnyConstructor, Serialized } from '../types';
import { generateSCLASS } from './utils';

export interface Deserializable<S extends Serialized, T extends Serializable<S>> {
	deserialize(data: S, deserializer: Deserializer): T | null;
}

interface Serializable<S extends Serialized = Serialized> {
	serialize(): S | null;
}

export interface SerializableObject extends Serializable {
	__$SCLASS: string;
	__$SNAME: string;
	isSerializable: boolean;
	deserialize(data: Serialized, deserializer: Deserializer): Serializable;
	serialize(): Serialized;
}

type SerializableCtor<S extends Serialized, T extends Serializable<S>> = AnyConstructor<
	Serializable<S> & Deserializable<S, T>
>;

function Serializable<S extends Serialized, T extends Serializable<S>, Ctor extends SerializableCtor<S, T>>(
	base: Ctor
) {
	const serializedObject = class SerializedObject extends base implements SerializableObject {
		public __$SCLASS = generateSCLASS(base.name);
		public __$SNAME = base.name;

		constructor(...args: any[]) {
			super(...args);
		}

		public get isSerializable() {
			return true;
		}

		public serialize(): S {
			let serialObj = super.serialize();
			if (!serialObj) {
				serialObj = JSON.stringify(this, (key) => {
					if (key.startsWith('__$')) {
						return undefined;
					}
				}) as unknown as S;
			}
			return { ...serialObj, __$SCLASS: generateSCLASS(base.name) };
		}

		public deserialize(data: S, deserializer: Deserializer): T {
			const deserObj = super.deserialize(data, deserializer);
			if (deserObj) return deserObj;
			else return Object.assign(this, data) as unknown as T;
		}
	};

	objectRegistry.register({
		constructor: serializedObject,
		SCLASS: generateSCLASS(base.name),
		name: base.name,
	});
	return serializedObject;
}

export default Serializable;
