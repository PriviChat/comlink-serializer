import { ObjectRegistry } from '../../registry';
import { Serialized } from '../types';
import { AnyConstructor, StaticDeserializable } from './types';
import { generateSCLASS } from './utils';

export function Serializable<S extends Serialized, C extends Serializable<S>>() {
	type SerializableObject = C & {
		isSerializable: boolean;
		$SCLASS: string;
		serialize(): S;
	};
	return function <CtorC extends AnyConstructor<any> & StaticDeserializable<S, C>>(base: CtorC) {
		const serializableObject = class SerializableObject extends base {
			readonly $SCLASS: string;

			constructor(...args: any[]) {
				super(...args);
				this.$SCLASS = generateSCLASS(base);
			}

			public get isSerializable() {
				return this.$SCLASS ? true : false;
			}

			public serialize(): S {
				return { ...super.serialize(), $SCLASS: this.$SCLASS };
			}
		} as AnyConstructor<SerializableObject> & StaticDeserializable<S, C>;

		ObjectRegistry.get().register({
			deserialize: serializableObject.deserialize,
			$SCLASS: generateSCLASS(base),
			name: base.name,
		});
		return serializableObject;
	};
}

export interface Serializable<S extends Serialized = Serialized> {
	serialize(): S;
}
