import Serializable from './decorators/Serializable';
import Deserializer from './Deserializer';

// eslint-disable-next-line @typescript-eslint/ban-types
export type AnyConstructor<T = any> = new (...input: any[]) => T;

export interface Serialized {
	$SCLASS?: string;
}

export interface Deserializable {
	deserialize(data: Serialized, deserializer: Deserializer): Serializable;
}
