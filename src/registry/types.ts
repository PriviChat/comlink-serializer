import { AnyConstructor } from '../serial';
import { SerialClassToken } from '../serial/decorators';

export interface ObjectRegistryEntry {
	classToken: SerialClassToken;
	constructor: AnyConstructor;
}
