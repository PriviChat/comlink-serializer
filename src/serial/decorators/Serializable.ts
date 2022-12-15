import objectRegistry from '../../registry';
import Deserializer from '../Deserializer';
import { AnyConstructor, Serialized } from '../types';
import { generateSCLASS } from './utils';

interface Serializable<S extends Serialized = Serialized> {
	serialize(): S;
}
interface Deserializable<S extends Serialized, C extends Serializable<S>> {
	deserialize(data: S, deserializer: Deserializer): C;
}

function Serializable<
	S extends Serialized,
	C extends Serializable<S>,
	CtorC extends AnyConstructor<Serializable<S> & Deserializable<S, C>>
>(base: CtorC) {
	const so = class SerializedObject extends base {
		public $SCLASS;

		constructor(...args: any[]) {
			super(...args);
			this.$SCLASS = generateSCLASS(base);
		}

		public get isSerializable() {
			return true;
		}

		public serialize(): S {
			const parentObj = super.serialize.call(this);
			return { ...parentObj, $SCLASS: generateSCLASS(base) };
		}

		public deserialize(data: S, deserializer: Deserializer) {
			const parent = super.deserialize(data, deserializer);
			return parent;
		}
	};
	objectRegistry.register({
		constructor: so,
		$SCLASS: generateSCLASS(base),
		name: base.name,
	});
	return so;
}

export default Serializable;
