import ObjectRegistry from './ObjectRegistry';
import { ObjectRegistryEntry } from './types';
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
