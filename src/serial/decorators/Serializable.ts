import objectRegistry from '../../registry';
import Deserializer from '../Deserializer';
import { AnyConstructor, Serialized } from '../types';
import { generateSCLASS } from './utils';

export interface Deserializable<S extends Serialized, T extends Serializable<S>> {
	deserialize(data: S, deserializer: Deserializer): T;
}

interface Serializable<S extends Serialized = Serialized> {
	serialize(): S | null;
}

export interface SerializableObject extends Serializable {
	$SCLASS: string;
	$SNAME: string;
	isSerializable: boolean;
	doDeserialize(data: Serialized, deserializer: Deserializer): Serializable;
	doSerialize(): Serialized;
}

type SerializableCtor<S extends Serialized, T extends Serializable<S>> = AnyConstructor<
	Serializable<S> & Deserializable<S, T>
>;

function Serializable<S extends Serialized, T extends Serializable<S>, Ctor extends SerializableCtor<S, T>>(
	base: Ctor
) {
	const serializedObject = class SerializedObject extends base implements SerializableObject {
		public $SCLASS = generateSCLASS(base.name);
		public $SNAME = base.name;

		constructor(...args: any[]) {
			super(...args);
		}

		public get isSerializable() {
			return true;
		}

		public doSerialize(): S {
			const serialObj = super.serialize();
			if (serialObj) return { ...serialObj, $SCLASS: generateSCLASS(base.name) };
			else return JSON.stringify(this) as unknown as S;
		}

		public doDeserialize(data: S, deserializer: Deserializer): T {
			const deserObj = super.deserialize(data, deserializer);
			return deserObj;
		}
	};

	objectRegistry.register({
		constructor: serializedObject,
		$SCLASS: generateSCLASS(base.name),
		name: base.name,
	});
	return serializedObject;
}

export default Serializable;
