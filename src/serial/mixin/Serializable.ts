import { ObjectRegistry } from '../../registry';
import { Serialized } from '../types';
import { AnyConstructor, StaticDeserializable } from './types';
import { applyMixins } from './utils';

export function Serializable<S extends Serialized, C extends Serializable<S>>() {
	return (constructor: StaticDeserializable<S, C> & AnyConstructor<Serializable>): void => {
		const SerializableObjectMixin = class SerializableObject extends constructor {
			public get isSerializable() {
				return true;
			}
		};
		applyMixins(constructor, [SerializableObjectMixin]);
		ObjectRegistry.get().register(constructor);
	};
}

export interface Serializable<S extends Serialized = Serialized> {
	serialize(): S;
}
