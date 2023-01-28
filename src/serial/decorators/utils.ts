import stringHash from 'string-hash';
import { v5 as uuidv5 } from 'uuid';
import SerialSymbol from '../serial-symbol';
import { Serialized } from '../types';
import Serializable, { SerializableObject } from './serializable';
import { SerialClassToken, SerializedHash } from './types';

export function isSerializableObject<T extends Serializable>(obj: any): obj is SerializableObject<T> {
	return obj && typeof obj[SerialSymbol.serializable] === 'function';
}

export function isSerializable<T extends Serializable = Serializable>(obj: any): obj is T {
	return obj && typeof obj[SerialSymbol.serializable] === 'function';
}

export function isSerialized(obj: any): obj is Required<Serialized> {
	return SerialSymbol.serialized in obj;
}

/**
 * It takes a hash code and a class token and returns a unique identifier for the object
 * @param {number} hashCode - This is the hash code of the object. If -1 is passed then
 * a UTC timestamp will be used to generate the hash.
 * @param {SerialClassToken} classToken - This is a unique identifier for the class.
 * @returns A function that takes in a hashCode and a classToken and returns a string.
 */
export function serializedHash(hashCode: number, classToken: SerialClassToken): SerializedHash {
	const namespace = uuidv5('SerialClassToken', strToIntArr(classToken.toString()));
	const name = hashCode > -1 ? hashCode.toString() : Date.now().toString();
	return uuidv5(name, namespace);
}

/**
 * It takes a string, hashes it, and returns an array of 16 bytes
 * @param {string} str - The string to be hashed.
 * @returns An array of 16 numbers, each of which is a hexadecimal digit.
 */
function strToIntArr(str: string) {
	const hash = stringHash(str).toString();
	const bytes = new Array<number>(16).fill(0);
	[...hash].forEach((val, idx) => {
		bytes[idx] = parseInt(val, 16);
	});

	return bytes;
}
