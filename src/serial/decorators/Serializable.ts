import 'reflect-metadata';
import objectRegistry from '../../registry';
import SerialSymbol from '../serial-symbol';
import { AnyConstructor, Dictionary, SerializeCtx, Serialized } from '../types';
import {
	Revivable,
	SerialClassToken,
	SerializePropertyDescriptor,
	SerialPropertyMetadataKey,
	ValueObject,
} from './types';

/**
 * This interface shares a name with the decorator @Serializable
 *
 * If you choose (it is not required), you can implment this interface on your @Serializable classes.
 *
 * It will inform you of the available hooks you can implement durring serialization.
 *
 * @interface Serializable
 * @function {void} beforeSerialize - called right before serialization begings on the object
 * @function {Serialized} serialize - implement this function to override the default serializer. You
 * will also need to override the default reviver if you are making changes to property names or overall structure of
 * your Serialized object.
 * You can access the serializer through the {SerializeCtx} if you need to serialize nested objects.
 * @function {any} beforePropertySerialize - called before a property is serialized. Return the value you want serialized for the passed property.
 * @function {Transferable[] | undefined} afterSerialize - called after the object is serialized. You may return an array of Transferable.
 */
interface Serializable<S extends Serialized = Serialized> extends ValueObject {
	beforeSerialize?(): void;
	serialize?(ctx: SerializeCtx): S;
	beforePropertySerialize?(prop: string): any;
	afterSerialize?(): Transferable[] | undefined;
}

/* this is the interface that is implemented by the decorator @Serializable */
export interface SerializableObject<T extends Serializable = Serializable> {
	[SerialSymbol.serializable]: () => boolean;
	[SerialSymbol.revived]: () => boolean;
	[SerialSymbol.classToken]: () => SerialClassToken;
	[SerialSymbol.serializeDescriptor](): Dictionary<SerializePropertyDescriptor>;
	get self(): SerializableObject<T>;
}

/**
 * Not implemented yet.
 *
 * @interface SerializableSettings
 */
interface SerializableSettings {}

type SerializableCtor<S extends Serialized> = AnyConstructor<Serializable<S> & Revivable<S>>;
/**
 * The @Serializable decorator allows your class to be registered as serializable.
 *
 * There are two interfaces available implement, Serializable and Revivable, to see the availaible lifecycle hooks.
 *
 * You are only required to implemnt `hashCode`and `equals` to make an object Serializable.
 *
 * @param {SerialClassToken} classToken - This is a unique identifier for the class. It's used to
 * identify the class when serializing and deserializing.
 * @param {SerializableSettings} [settings] - SerializableSettings
 * @returns An object wrapping your class to enable it to passed to a seperate thread and revived on the other side.
 */
function Serializable<S extends Serialized, T extends Serializable<S>, Ctor extends SerializableCtor<S>>(
	classToken: SerialClassToken,
	settings?: SerializableSettings
): (base: Ctor) => any {
	return function (base: Ctor) {
		let serializeDescriptor: Dictionary<SerializePropertyDescriptor>;

		const serializable = class Serializable extends base implements SerializableObject<T> {
			constructor(...args: any[]) {
				super(...args);
				serializeDescriptor = this.getSerializeDescriptor();
			}

			[SerialSymbol.serializable](): boolean {
				return true;
			}
			[SerialSymbol.revived](): boolean {
				return false;
			}
			[SerialSymbol.classToken](): SerialClassToken {
				return classToken;
			}
			[SerialSymbol.serializeDescriptor](): Dictionary<SerializePropertyDescriptor> {
				if (!serializeDescriptor) {
					serializeDescriptor = this.getSerializeDescriptor();
				}
				return serializeDescriptor;
			}

			/* Getting the serialize descriptor from the prototype chain. */
			private getSerializeDescriptor() {
				let rtnDescr: Dictionary<SerializePropertyDescriptor> = {};
				let target = Object.getPrototypeOf(this);
				while (target != Object.prototype) {
					const foundDescr = Reflect.getOwnMetadata(SerialPropertyMetadataKey, target) || undefined;
					if (foundDescr) {
						for (const [key, entry] of Object.entries(foundDescr)) {
							if (typeof entry === 'function') {
								// resolve the delayed @Serialize decorator discriptor
								foundDescr[key] = entry();
							}
						}
						rtnDescr = foundDescr;
						break;
					}
					target = Object.getPrototypeOf(target);
				}
				return rtnDescr;
			}

			public get self() {
				return this;
			}
		};

		objectRegistry.register({
			class: base.name,
			classToken,
			constructor: serializable,
		});

		return serializable;
	};
}

export default Serializable;
