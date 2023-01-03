import { Serializable } from './decorators';
import { SerialMeta } from './decorators/types';
import { AnySerialIterable } from './iterable';
import SerialSymbol from './SerialSymbol';

// eslint-disable-next-line @typescript-eslint/ban-types
export type AnyConstructor<T = void> = new (...input: any[]) => T;

export interface Serialized {
	[SerialSymbol.serializable]?: () => SerialMeta;
}

//export type SerialPrimitive = boolean | number | bigint | string;
export type SerialPrimitive = number | string;
