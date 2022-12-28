import { AnyConstructor } from 'src/serial';

export interface ObjectRegistryEntry {
	name: string;
	id: string;
	constructor: AnyConstructor;
}
