import { Serialized } from '../types';
import { Serializable } from './Serializable';

// eslint-disable-next-line @typescript-eslint/ban-types
export type AnyConstructor<A = object> = new (...input: any[]) => A;

export interface StaticDeserializable<S extends Serialized, C extends Serializable<S>> {
	_SCLASS: string;
	deserialize(data: S): C;
}
