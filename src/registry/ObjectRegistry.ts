/* Registry of all the classes that are serializable */

import { ObjectRegistryEntry } from './types';

export default class ObjectRegistry {
	private registry = new Map<string, ObjectRegistryEntry>();

	public getEntry(id: string): ObjectRegistryEntry {
		const entry = this.registry.get(id);
		if (!entry)
			throw Error(
				`Entry for SerialId: ${id} not found in registry! You need to make sure you register the class with the registerTransferHandler. And remember to do it for both threads.`
			);
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
