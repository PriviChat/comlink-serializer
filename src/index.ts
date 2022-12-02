import { registerTransferHandler, Serializable } from './serial';
export * from './serial';
export * from './serialobjs';

const ComlinkSerializer = {
	registerTransferHandler,
	Serializable,
};

export default ComlinkSerializer;
