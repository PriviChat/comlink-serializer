import 'reflect-metadata';
import objectRegistry from '../../registry';
import SerialSymbol from '../serial-symbol';
import { AnyConstructor, Dictionary, SerializeCtx, Serialized } from '../types';
import {
	Revivable,
	SerialClassToken,
	SerializeDescriptorProperty,
	SerialMeta,
	SerialPropertyMetadataKey,
	ValueObject,
} from './types';

interface Serializable<S extends Serialized = Serialized> extends ValueObject {
	beforeSerialize?(): void;
	serialize?(ctx: SerializeCtx): S;
	beforePropertySerialize?(prop: string): any;
}

export interface SerializableObject<T extends Serializable> {
	[SerialSymbol.serializable](): SerialMeta;
	[SerialSymbol.classToken](): SerialClassToken;
	[SerialSymbol.serializeDescriptor](): Dictionary<SerializeDescriptorProperty>;
	get self(): SerializableObject<T>;
}

interface SerializableSettings {}

type SerializableCtor<S extends Serialized> = AnyConstructor<Serializable<S> & Revivable<S>>;

function Serializable<S extends Serialized, T extends Serializable<S>, Ctor extends SerializableCtor<S>>(
	classToken: SerialClassToken,
	settings?: SerializableSettings
): (base: Ctor) => any {
	return function (base: Ctor) {
		let serializeDescriptor: Dictionary<SerializeDescriptorProperty>;

		const serializable = class Serializable extends base implements SerializableObject<T> {
			constructor(...args: any[]) {
				super(...args);
			}

			[SerialSymbol.serializable](): SerialMeta {
				return {
					classToken: classToken.toString(),
					hash: undefined,
				};
			}

			[SerialSymbol.classToken](): SerialClassToken {
				return classToken;
			}

			[SerialSymbol.serializeDescriptor](): Dictionary<SerializeDescriptorProperty> {
				if (!serializeDescriptor) {
					serializeDescriptor = this.getSerializeDescriptor();
				}
				return serializeDescriptor;
			}

			/* Getting the serialize descriptor from the prototype chain. */
			private getSerializeDescriptor() {
				let rtnDescr: Dictionary<SerializeDescriptorProperty> = {};
				let target = Object.getPrototypeOf(this);
				while (target != Object.prototype) {
					const foundDescr = Reflect.getOwnMetadata(SerialPropertyMetadataKey, target) || undefined;
					if (foundDescr) {
						rtnDescr = foundDescr;
						break;
					}
					target = Object.getPrototypeOf(target);
				}
				return rtnDescr;
			}

			/**
			 * Assigns a value to a key (property) in an object.
			 * @param {string} key - The name of the property to assign.
			 * @param {any} value - The value to be assigned to the key.
			 * @returns The object itself.
			 */
			public assign(key: string, value: any) {
				Object.assign(this, { [key]: value });
				return this;
			}

			public get self() {
				return this;
			}
		};

		objectRegistry.register({
			classToken,
			constructor: serializable,
		});

		return serializable;
	};
}

export default Serializable;
