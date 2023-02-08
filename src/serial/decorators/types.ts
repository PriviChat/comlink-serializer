import { ReviverCtx, Serialized } from '..';

export const SerialPropertyMetadataKey = 'serialPropertyMetadata';

/**
 * The interface to fulfill to qualify as a Value Object.
 */
export interface ValueObject {
	/**
	 * Determins the equality of objects when serializing and reviving objects.
	 *
	 * True if 'this' the object being serialized and the 'other' object are equal.
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
	 * that signals that the hashCode cannot be derived, and a unique hashCode will be generated for the
	 * object. It's not always possible to uniquely identify an object based on it's properties,
	 * but doing so allows for additional optimizations such as creating only one instance of a serialized or revived object.
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

/**
 *  Identifier of the serializalbe class.
 *  Needs to be unique across all Serializable objects.
 */
export type SerialClassToken = string | symbol;

/**
 * If you choose (it is not required), you can implment this interface on your `@Serializable` classes.
 * It will inform you of the available hooks you can implement when your object is revived.
 *
 * @interface Revivable
 * @function {void} beforeSerialize - called right before serialization begings on the object
 * @function {Serialized} revive - implement this function to override the default reviver.
 * You can access the reviver through the {ReviverCtx} if you need to revive nested objects.
 * @function {any} beforePropertySerialize - called before a property is serialized. Return the value you want serialized for the passed property.
 * @function {Transferable[] | undefined} afterSerialize - called after the object is serialized. You may return an array of Transferable.
 */
export interface Revivable<S extends Serialized = Serialized> {
	revive?(serialObj: S, ctx: ReviverCtx): void;
	afterPropertyRevive?(prop: string, value: any): any;
	afterRevive?(): void;
}

export type SerializedHash = string;

export type SerializedMeta = {
	classToken: string; // class token identifier
	hash: SerializedHash; // generated
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
