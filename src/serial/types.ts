import SerialSymbol from './SerialSymbol';

// eslint-disable-next-line @typescript-eslint/ban-types
export type AnyConstructor<T = void> = new (...input: any[]) => T;

export interface Serialized {
	'ComSer.registryId'?: string;
	'ComSer.class'?: string;
}
