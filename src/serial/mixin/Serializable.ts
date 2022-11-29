import { ObjectRegistry } from '../../registry';
import { Serialized, Serializer } from '../types';
import { AnyConstructor, StaticDeserializable } from './types';
import { applyMixins, generateSCLASS } from './utils';

export function Serializable<S extends Serialized, C extends Serializable<S>>(
	constructor: StaticDeserializable<S, C> & AnyConstructor<Serializable<S>>
): void {
	const SerializableObjectMixin = class SerializableObject extends constructor {
		public readonly _SCLASS = generateSCLASS(constructor);

		public get isSerializable() {
			return true;
		}
		public serialize() {
			return { ...super.serialize(), _SCLASS: this._SCLASS };
		}
	};
	applyMixins(constructor, [SerializableObjectMixin]);
	ObjectRegistry.get().register({
		deserialize: constructor.deserialize,
		_SCLASS: generateSCLASS(constructor),
		name: constructor.name,
	});
}

export interface Serializable<S extends Serialized = Serialized> {
	//serialize(seializer:r Serializer<S>): S;
	serialize(): S;
}
