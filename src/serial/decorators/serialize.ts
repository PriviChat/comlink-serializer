import { SerialClassToken, SerializeSettings } from './types';
import { defineSerializePropertyMetadata } from './utils';

/**
 * The @Serialize decorator tells the serializer to serialize the property.
 *
 * The property decorated must be a class that is either decorated with @Serializable or an Array or Map containing  Serializable objects.
 *
 * Map keys must be of primitive types (boolean | number | bigint | string).
 *
 * When decorating an Array or Map with @Serialize you must also specify the SerialClassToken.
 *
 * If you pass boolean (true) into @Serialize you will get a lazy serialization which is a proxy to your object.
 *
 * @param {SerialClassToken | SerializeSettings | boolean} [settings] - SerialClassToken |
 * SerializeSettings | boolean
 * @returns void
 */
export default function Serialize(settings?: SerialClassToken | SerializeSettings | boolean) {
	if (!settings) {
		return defineSerializePropertyMetadata({ lazy: false });
	} else if (typeof settings === 'boolean') {
		return defineSerializePropertyMetadata({ lazy: settings });
	} else if (typeof settings === 'string' || typeof settings === 'symbol') {
		return defineSerializePropertyMetadata({ classToken: settings, lazy: false });
	} else {
		return defineSerializePropertyMetadata(settings);
	}
}
