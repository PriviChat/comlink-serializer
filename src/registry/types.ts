import { AnyConstructor } from 'src/serial';
import { SerialClassToken } from 'src/serial/decorators';

export interface ObjectRegistryEntry {
	classToken: SerialClassToken;
	constructor: AnyConstructor;
}
