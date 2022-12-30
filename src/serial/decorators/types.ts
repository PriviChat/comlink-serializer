/**
 * The interface to fulfill to qualify as a Value Object.
 */
interface ValueObject {
	/**
	 * True if 'this' and the 'other' object which is being serialized or deserialized are equal.
	 * It is critical for the optimization of these processes.
	 */
	equals(other: unknown): boolean;
}
