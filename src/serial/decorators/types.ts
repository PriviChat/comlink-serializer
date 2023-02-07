import { ReviverCtx, Serialized } from '..';

export const SerialPropertyMetadataKey = 'serialPropertyMetadata';

/**
 * The interface to fulfill to qualify as a Value Object.
 */
export interface ValueObject {
	/**
	 * Determins the equality of objects when serializing and reviving objects.
	 *
	 * True if 'this' and the 'other' object which is being serialized or revived are equal.
	 * It is critical for the optimization of these processes. If you cannot determine equality
	 * return false, but depending on your dataset this can hurt performance. If hashCode returns -1,
	 * equals will not be called.
	 */
	equals(other: unknown): boolean;

	/**
	 * Computes and returns the hashed identity for this Serializable.
	 *
	 * The `hashCode` of a Serializable is used to determine potential equality,
	 * and is used when serializing and reviving.
	 *
	 *
	 * Note: hashCode() MUST return a number between 0 and 4294967295 (inclusive), or if you return -1
	 * that signals that the hashCode cannot be derived, and the system should generate a unique hashCode for the
	 * object. It's not always possible to uniquely identify an object based on it's properties,
	 * but doing so allows for additional optimizations.
	 *
	 * You can leverage the `hashCd` included in this lib to generate the hashCode.
	 *
	 * If two values have the same `hashCode`, they are [not guaranteed
	 * to be equal][Hash Collision]. If two values have different `hashCode`s,
	 * they must not be equal.
	 *
	 * [Hash Collision]: https://en.wikipedia.org/wiki/Collision_(computer_science)
	 */
	hashCode(): number;
}

/* identifier of the class */
export type SerialClassToken = string | symbol;

export interface Revivable<S extends Serialized = Serialized> {
	revive?(serialObj: S, ctx: ReviverCtx): void;
	afterPropertyRevive?(prop: string, value: any): any;
	afterRevive?(): void;
}

export type SerializedHash = string;

export type SerializedMeta = {
	classToken: string; // class token identifier
	hash?: SerializedHash; // generated
};

export interface SerializePropertyDescriptor {
	prop: string;
	type: 'Array' | 'Map' | 'Serializable';
	classToken: SerialClassToken;
	proxy: boolean;
}

export interface SerializeSettings {
	classToken?: SerialClassToken;
	proxy: boolean;
}
