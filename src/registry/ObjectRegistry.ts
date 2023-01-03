/* Registry of all the classes that are serializable */

import { Serialized } from 'src/serial';
import { Serializable, SerializableObject } from '../serial/decorators';
import { ObjectRegistryEntry } from './types';

export default class ObjectRegistry {
	private registry = new Map<string, ObjectRegistryEntry>();

	public getEntry(id: string): ObjectRegistryEntry | undefined {
		const entry = this.registry.get(id);
		return entry;
	}

	public register(entry: ObjectRegistryEntry): ObjectRegistryEntry {
		if (!entry.id) {
			throw TypeError('Object not Serializable/Deserializable!');
		}

		const existing = this.registry.get(entry.id);
		if (existing)
			throw TypeError(
				`Class: ${entry.name} has the same SerialId: ${entry.id} as Class: ${existing.name}. SerialId must be unique.`
			);
		this.registry.set(entry.id, entry);
		console.info(`Class: [${entry.name}] SerialId: [${entry.id}] has been registered as Serializable.`);
		return entry;
	}
}
