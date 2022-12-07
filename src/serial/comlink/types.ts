import Serializable from '../mixin';
import { AnyConstructor } from '../mixin/types';

export interface TransferHandlerRegistration {
	transferClasses: AnyConstructor<Serializable>[];
}
