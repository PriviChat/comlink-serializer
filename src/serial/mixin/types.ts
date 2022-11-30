import { Serialized } from '../types';
import { Serializable } from './Serializable';

// eslint-disable-next-line @typescript-eslint/ban-types
export type AnyConstructor<T = any> = new (...input: any[]) => T;
//export type AnyConstructor<T = any, A extends any[] = any[]> = new (...args: A) => T;

export interface StaticDeserializable<S extends Serialized, C extends Serializable<S>> {
	deserialize(data: S): C;
}
