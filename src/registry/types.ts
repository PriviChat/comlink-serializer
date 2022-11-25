import { Deserializable } from '../serial';

export type ObjectRegistryEntry = {
	name: string;
	_SCLASS: string;
	constructor: Deserializable;
};
