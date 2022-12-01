export * from './serial';
export * from './serialobjs';
import { registerTransferHandler, Serializable } from './serial';

const ComlinkSerializer = {
	registerTransferHandler,
	Serializable,
};

export default ComlinkSerializer;
