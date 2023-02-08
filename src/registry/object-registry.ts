/* Registry of all the classes that are serializable */
import { SerialClassToken } from '../serial/decorators';
import { ObjectRegistryEntry } from './types';

export default class ObjectRegistry {
	// map of classToken => ObjectRegistryEntry
	private tokenRegistry = new Map<string, ObjectRegistryEntry>();
	// map of base class name => ObjectRegistryEntry
	private classRegistry = new Map<string, ObjectRegistryEntry>();

	/**
	 * Given a class token, return the corresponding object registry entry.
	 * @param {SerialClassToken} classToken - The class token of the object you want to retrieve.
	 * @returns An ObjectRegistryEntry or undefined
	 */
	public getEntryByToken(classToken: SerialClassToken): ObjectRegistryEntry | undefined {
		const entry = this.tokenRegistry.get(classToken.toString());
		return entry;
	}

	/**
	 * Get the entry from the class registry, and return it.
	 * @param {string} clazz - The class name of the object you want to retrieve.
	 * @returns The entry is being returned.
	 */
	public getEntryByClass(clazz: string): ObjectRegistryEntry | undefined {
		const entry = this.classRegistry.get(clazz);
		return entry;
	}

	/**
	 * It takes an ObjectRegistryEntry and adds it to the classRegistry and tokenRegistry
	 * @param {ObjectRegistryEntry} entry - ObjectRegistryEntry
	 * @returns The ObjectRegistryEntry
	 */
	public register(entry: ObjectRegistryEntry): ObjectRegistryEntry {
		if (!entry.classToken) {
			throw TypeError('Object not Serializable, missing classToken.');
		}

		if (!entry.class) {
			throw TypeError('Object not Serializable, missing class.');
		}

		const hasClass = this.classRegistry.has(entry.classToken.toString());
		const hasClassToken = this.tokenRegistry.has(entry.classToken.toString());

		if (hasClass)
			throw TypeError(
				`Class: [${
					entry.class
				}] with ClassToken: [{${entry.classToken.toString()}}] has already been registered. This means you have two Serializable classes with the same name. That's not supported.`
			);

		if (hasClassToken)
			throw TypeError(
				`ClassToken: [${entry.classToken.toString()}] has already been registered. The classToken must be unique across all Serializalbe objects.`
			);

		// register under the class name
		this.classRegistry.set(entry.class, entry);
		// register under the class token
		this.tokenRegistry.set(entry.classToken.toString(), entry);
		console.info(
			`Class: [${entry.class}] with classToken: [${entry.classToken.toString()}] has been registered as Serializable.`
		);
		return entry;
	}
}
