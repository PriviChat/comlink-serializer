/* Registry of all the classes that are serializable */

import { ObjectRegistryEntry } from './types';

export class ObjectRegistry {
	static _instance: ObjectRegistry;
	private registry: Map<string, ObjectRegistryEntry>;

	private constructor() {
		this.registry = new Map();
	}

	static get(): ObjectRegistry {
		if (!ObjectRegistry._instance) ObjectRegistry._instance = new ObjectRegistry();
		return ObjectRegistry._instance;
	}

	public getEntry(SCLASS: string): ObjectRegistryEntry {
		const entry = this.registry.get(SCLASS);
		if (!entry)
			throw Error(
				`Entry for $SCLASS: ${SCLASS} not found in registry! You need to make sure you register the class with the registerTransferHandler. And remember to do it on both threads.`
			);
		return entry;
	}

	public register(entry: ObjectRegistryEntry): ObjectRegistryEntry {
		if (!entry.$SCLASS) {
			throw TypeError('Object not serializable!');
		}

		const existing = this.registry.get(entry.$SCLASS);
		if (existing)
			throw TypeError(
				`Object: ${entry.name} has the same _SCLASS: ${entry.$SCLASS} as a class with name: ${existing.name}. _SCLASS must be unique.`
			);
		this.registry.set(entry.$SCLASS, entry);
		console.info(`Object: [${entry.name}] _SCLASS: [${entry.$SCLASS}] has been registered as serializable.`);
		return entry;
	}
}
