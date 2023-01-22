import ObjectRegistry from './object-registry';
import { ObjectRegistryEntry } from './types';
export * from './types';
export const objectRegistry: ObjectRegistry = new ObjectRegistry();
export default objectRegistry;

export const defaultRegistryObjects = new Map<string, ObjectRegistryEntry>([
	/* [
		'Sample',
		{
			name: 'Sample',
			id: '',
			constructor: Sample,
		},
	], */
]);
