import { AnyConstructor } from 'src/serial';

export interface ObjectRegistryEntry {
	name: string;
	$SCLASS: string;
	constructor: AnyConstructor;
}
