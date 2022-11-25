/* Registry of all the classes that are serializable */

import { Deserializable } from '../serial';
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

	public getEntry(_SCLASS: string): ObjectRegistryEntry {
		const entry = this.registry.get(_SCLASS);
		if (!entry)
			throw Error(
				`Entry for _SCLASS: ${_SCLASS} not found in registry! You need to make sure you are instantiating the class on both sides of the worker thread.`
			);
		return entry;
	}

	public register(constructor: Deserializable): ObjectRegistryEntry {
		if (!constructor._SCLASS) {
			throw TypeError('Object not serializable!');
		}
		const entry: ObjectRegistryEntry = {
			name: constructor.name,
			_SCLASS: constructor._SCLASS,
			constructor,
		};

		const existing = this.registry.get(constructor._SCLASS);
		if (existing)
			throw TypeError(
				`Object: ${entry.name} has the same _SCLASS: ${constructor._SCLASS} as a class with name: ${existing.name}. _SCLASS must be unique.`
			);
		this.registry.set(constructor._SCLASS, entry);
		return entry;
	}
}
