import { ReviverCtx, Serialized } from '..';

export const SerialPropertyMetadataKey = 'serialPropertyMetadata';

/**
 * The interface to fulfill to qualify as a Value Object.
 */
export interface ValueObject {
	/**
	 * Computes and returns the hashed identity for this Serializable.
	 *
	 * The `hashCode` of a Serializable is used to determine potential equality,
	 * and is used when serializing and deserializaing.
	 *
	 *
	 * Note: hashCode() MUST return a number between 0 and 4294967295 (inclusive) or if you return -1
	 * that signals that the hashCode cannot be derived, and the system should generate a unique id for the
	 * object. We realize that it's not always possible to uniquely identify an object based on it's properties,
	 * but if you can, that will allow for additional optimizations.
	 *
	 * You can leverage the {hashCd} included in this lib to generate the code.
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

export type SerializedObjKey = string;
export type SerializedObjHash = string;

export type SerializedMeta = {
	classToken: string; // class token identifier
	hash: SerializedObjHash; // generated
};

export interface SerializeDescriptorProperty {
	prop: string;
	type: 'Array' | 'Map' | 'Serializable';
	classToken: SerialClassToken;
	proxy: boolean;
}

export interface SerializeSettings {
	classToken?: SerialClassToken;
	proxy: boolean;
}
