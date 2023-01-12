/* Registry of all the classes that are serializable */
import { SerialClassToken } from 'src/serial/decorators';
import { v5 as uuidv5 } from 'uuid';
import { ObjectRegistryEntry } from './types';

export default class ObjectRegistry {
	// map of entry class => ObjectRegistryEntry
	private objectRegistry = new Map<string, ObjectRegistryEntry>();

	public getEntry(classToken: SerialClassToken): ObjectRegistryEntry | undefined {
		const entry = this.objectRegistry.get(classToken.toString());
		return entry;
	}

	public register(entry: ObjectRegistryEntry): ObjectRegistryEntry {
		if (!entry.classToken) {
			throw TypeError('Object not Serializable, missing classToken.');
		}

		const existing = this.objectRegistry.get(entry.classToken.toString());
		if (existing)
			throw TypeError(
				`Class: [${entry.classToken.toString()}] has already been registered. Make sure the classToken set on Serializable is unique.`
			);

		this.objectRegistry.set(entry.classToken.toString(), entry);
		console.info(`Class with classToken: [${entry.classToken.toString()}] has been registered as Serializable.`);
		return entry;
	}
}
