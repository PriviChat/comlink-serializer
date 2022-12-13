import Serializable, { Deserializable, AnyConstructor } from '../serial/mixin';

export interface ObjectRegistryEntry {
	name: string;
	$SCLASS: string;
	constructor: AnyConstructor<Serializable> & Deserializable;
}
