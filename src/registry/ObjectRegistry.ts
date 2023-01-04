/* Registry of all the classes that are serializable */
import { v5 as uuidv5 } from 'uuid';
import { ObjectRegistryEntry } from './types';

export default class ObjectRegistry {
	// namespace for uuid v5 generation
	private static namespace = '22547e41-5fab-482d-9524-19d9d3872596';
	// map of entry id => ObjectRegistryEntry
	private registry = new Map<string, ObjectRegistryEntry>();
	// map of class name => ObjectRegistryEntry
	private classLookup = new Map<string, ObjectRegistryEntry>();

	public getEntryById(id: string): ObjectRegistryEntry | undefined {
		const entry = this.registry.get(id);
		return entry;
	}

	public getEntryByClass(cls: string): ObjectRegistryEntry | undefined {
		const entry = this.classLookup.get(cls);
		return entry;
	}

	public genRegId(name: string) {
		return uuidv5(name, ObjectRegistry.namespace);
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
		this.classLookup.set(entry.name, entry);
		this.registry.set(entry.id, entry);
		console.info(`Class: [${entry.name}] SerialId: [${entry.id}] has been registered as Serializable.`);
		return entry;
	}
}
