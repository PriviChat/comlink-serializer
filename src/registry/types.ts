import { AnyConstructor } from '../serial';
import { SerialClassToken } from '../serial/decorators';

export interface ObjectRegistryEntry {
	class: string;
	classToken: SerialClassToken;
	constructor: AnyConstructor;
}
