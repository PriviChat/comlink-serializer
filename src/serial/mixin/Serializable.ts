import objectRegistry from '../../registry';
import { AnyConstructor, Serialized } from './types';
import { generateSCLASS, applyMixins } from './utils';

interface Serializable<S extends Serialized = Serialized> {
	serialize(): S;
}
interface StaticDeserializable<S extends Serialized, C extends Serializable<S>> {
	deserialize(data: S): C;
}

function Serializable<
	S extends Serialized,
	C extends Serializable<S>,
	CtorC extends AnyConstructor<Serializable<S>> & StaticDeserializable<S, C>
>(base: CtorC) {
	const serializableObject = class SerializableObject extends base {
		readonly $SCLASS = generateSCLASS(base);

		constructor(...args: any[]) {
			super(...args);
		}

		public get isSerializable() {
			return true;
		}

		public serialize(): S {
			return { ...super.serialize(), $SCLASS: generateSCLASS(base) };
		}

		static deserialize(data: S) {
			const descBase = base.deserialize(data);
			const obj = Object.assign(descBase, SerializableObject.prototype);
			return obj;
		}
	};

	objectRegistry.register({
		constructor: serializableObject,
		$SCLASS: generateSCLASS(base),
		name: base.name,
	});
	return serializableObject;
}

export default Serializable;
