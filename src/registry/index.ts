import { v5 as uuidv5 } from 'uuid';
import ObjectRegistry from './ObjectRegistry';
import { ObjectRegistryEntry } from './types';
export const objectRegistry: ObjectRegistry = new ObjectRegistry();
export default objectRegistry;

export function getRegId(name: string) {
	const namespace = '22547e41-5fab-482d-9524-19d9d3872596';
	return uuidv5(name, namespace);
}

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
