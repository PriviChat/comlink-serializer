import Serializable, { SerializableObject } from './decorators/Serializable';
import { Serialized } from './types';
import objectRegistry from '../registry';
import SerialSymbol, { symDes } from './SerialSymbol';
import { SerialMeta } from './decorators';
export default class Deserializer {
	private asjustSerialSymbol(serialized: Serialized) {
		const serSymStr = "'" + SerialSymbol.serializable.toString() + "'";

		if (typeof serialized[SerialSymbol.serializable] === 'function') return serialized;
		else if (serSymStr in serialized) {
			const meta = (serialized as any)[serSymStr] as SerialMeta;
			if (meta) {
				Object.assign(serialized, {
					[SerialSymbol.serializable]: () => {
						return {
							...meta,
						};
					},
				});
				delete (serialized as any)[serSymStr];
			}
		}
		return serialized;
	}
	public deserialize<T extends Serializable>(serialObj: Serialized): T {
		serialObj = this.asjustSerialSymbol(serialObj);

		let meta;
		if (SerialSymbol.serializable in serialObj) {
			meta = serialObj[SerialSymbol.serializable]!();
			if (!meta) {
				const err = `ERR_MISSING_META: Object not deserializable. Missing meta properties in Symbol: [${SerialSymbol.serializable.toString()}]. Object: ${JSON.stringify(
					serialObj
				)}. Make sure you have properly decorated your class with @Serializable.`;
				console.error(err);
				throw TypeError(err);
			}
			if (!meta.rid) {
				const err = `ERR_MISSING_RID: Object not deserializable. Missing meta property: rid. Object: ${JSON.stringify(
					serialObj
				)}. Make sure you have properly decorated your class with @Serializable.`;
				console.error(err);
				throw TypeError(err);
			}
			if (!meta.hsh) {
				const err = `ERR_MISSING_HSH: Object not deserializable, missing meta property: hsh. Object: ${JSON.stringify(
					serialObj
				)}. Make sure you have properly decorated your class with @Serializable.`;
				console.error(err);
				throw TypeError(err);
			}
			if (!meta.cln) {
				const wrn = `WRN_MISSING_CLN: Object with rid: ${
					meta.rid
				} is missing meta property: cln. Object: ${JSON.stringify(serialObj)}`;
				console.warn(wrn);
			}
		} else {
			const err = `ERR_MISSING_SYMBOL: Object not deserializable. Missing Symbol: [${SerialSymbol.serializable.toString()}]. Object: ${JSON.stringify(
				serialObj
			)}. Make sure you have properly decorated your class with @Serializable.`;
			console.error(err);
			throw TypeError(err);
		}

		const entry = objectRegistry.getEntry(meta.rid);
		if (!entry) {
			const err = `ERR_MISSING_REG: Object with rid: ${meta.rid} and cln: ${meta.cln} not found in registry.
					 Make sure you are property configuring the transfer handler. Remember the object must be registered on each thread.`;
			console.error(err);
			throw new Error(err);
		}

		const instance = Object.create(entry.constructor.prototype) as SerializableObject<any, T>;
		const obj = instance.deserialize(serialObj, this);
		if (!(SerialSymbol.serializable in obj)) {
			const err = `ERR_DESERIAL_FAIL: The deserialized object with rid: ${meta.rid} and cln: ${
				meta.cln
			} is missing Symbol: [${SerialSymbol.serializable.toString()}]. There is a known issue with babel and using legacy decorators. See README for a workaround.`;
			console.error(err);
			throw new TypeError(err);
		}
		return obj;
	}
}
