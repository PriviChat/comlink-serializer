import { AnyConstructor, Deserializable } from '../serial';
import Serializable from '../serial/decorators/Serializable';

export interface ObjectRegistryEntry {
	name: string;
	$SCLASS: string;
	constructor: AnyConstructor<Serializable & Deserializable>;
}
