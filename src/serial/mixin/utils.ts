import Serializable from './Serializable';
import { AnyConstructor, Serialized } from './types';
import { v5 as uuidv5 } from 'uuid';

export function generateSCLASS<S extends Serialized>(constructor: AnyConstructor<Serializable<S>>) {
	const namespace = '22547e41-5fab-482d-9524-19d9d3872596';
	return uuidv5(constructor.name, namespace);
}
