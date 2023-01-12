import { SerialMeta } from './decorators/types';
import SerialSymbol from './SerialSymbol';

// eslint-disable-next-line @typescript-eslint/ban-types
export type AnyConstructor<T = void> = new (...input: any[]) => T;

export interface Serialized {
	[SerialSymbol.serialized]?: SerialMeta;
}

export type SerialPrimitive = boolean | number | bigint | string;
export const serialPrimitives = new Set<string>(['boolean', 'number', 'bigint', 'string']);

export type Dictionary<T> = {
	[key: string]: T;
};
