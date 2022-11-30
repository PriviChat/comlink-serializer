import { ObjectRegistry } from '../../registry';
import { Serialized, Serializer } from '../types';
import { AnyConstructor, StaticDeserializable } from './types';
import { applyMixins, generateSCLASS } from './utils';

export function Serializable<S extends Serialized, C extends Serializable<S>>(
	cons: StaticDeserializable<S, C> & AnyConstructor<Serializable<S>>
): void {
	const SerializableObjectMixin = class SerializableObject {
		private __SCLASS?: string;
		constructor() {
			this._SCLASS = generateSCLASS(cons);
		}

		public get _SCLASS() {
			return this.__SCLASS ?? generateSCLASS(cons);
		}

		public set _SCLASS(sclass: string) {
			this.__SCLASS = sclass;
		}

		public get isSerializable() {
			return true;
		}

		public serialize(): S {
			return { ...(this as any).original_serialize(), _SCLASS: this._SCLASS };
		}
	};
	applyMixins(cons, [SerializableObjectMixin]);
	ObjectRegistry.get().register({
		deserialize: cons.deserialize,
		_SCLASS: generateSCLASS(cons),
		name: cons.name,
	});
}

export interface Serializable<S extends Serialized = Serialized> {
	//serialize(seializer:r Serializer<S>): S;
	serialize(): S;
}
