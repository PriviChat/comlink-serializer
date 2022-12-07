import Serializable from '../mixin';

// eslint-disable-next-line @typescript-eslint/ban-types
export type AnyConstructor<T = any> = new (...input: any[]) => T;
//export type AnyConstructor<T = any, A extends any[] = any[]> = new (...args: A) => T;

export interface Serialized {
	$SCLASS?: string;
}
