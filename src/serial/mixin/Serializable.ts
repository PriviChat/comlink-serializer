import { ObjectRegistry } from '../../registry';
import { AnyConstructor, Serialized } from './types';
import { generateSCLASS } from './utils';

interface Serializable<S extends Serialized = Serialized> {
	serialize(): S;
}
interface StaticDeserializable<S extends Serialized, C extends Serializable<S>> {
	deserialize(data: S): C;
}

function Serializable<
	S extends Serialized,
	C extends Serializable<S>,
	CtorC extends AnyConstructor<any> & StaticDeserializable<S, C>
>(base: CtorC) {
	type SerializableObject = C & {
		isSerializable: boolean;
		$SCLASS: string;
		serialize(): S;
	};
	const serializableObject = class SerializableObject extends base {
		readonly $SCLASS: string;

		constructor(...args: any[]) {
			super(...args);
			this.$SCLASS = generateSCLASS(base);
		}

		public get isSerializable() {
			return true;
		}

		public serialize(): S {
			return { ...super.serialize(), $SCLASS: generateSCLASS(base) };
		}
	} as AnyConstructor<SerializableObject> & StaticDeserializable<S, C> & any;

	ObjectRegistry.get().register({
		deserialize: serializableObject.deserialize,
		$SCLASS: generateSCLASS(base),
		name: base.name,
	});
	return serializableObject;
}

export default Serializable;
