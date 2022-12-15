import Serializable from '../decorators/Serializable';
import { AnyConstructor } from '../types';

export interface TransferHandlerRegistration {
	transferClasses: AnyConstructor<Serializable>[];
}
