import { Serializable, Serialize, hashCd } from '@comlink-serializer';
import Address from '@test-fixtures/address';
import { AddressClass, SerializeDecoratorSettingsClass } from './types';

@Serializable(SerializeDecoratorSettingsClass)
export default class SerializeDecoratorSettings {
	@Serialize()
	readonly lazyFalseObject: Address | undefined;

	@Serialize(false)
	readonly lazyBoolFalseObject: Address | undefined;

	@Serialize(true)
	readonly lazyBoolTrueObject: Address | undefined;

	@Serialize({ lazy: true })
	readonly lazySettTrueObject: Address | undefined;

	@Serialize({ lazy: false })
	readonly lazySettFalseObject: Address | undefined;

	@Serialize(AddressClass)
	readonly lazyFalseArray: Address[] | undefined;

	@Serialize({ classToken: AddressClass, lazy: false })
	readonly lazySettFalseArray: Address[] | undefined;

	@Serialize({ classToken: AddressClass, lazy: true })
	readonly lazySettTrueArray: Address[] | undefined;

	@Serialize(AddressClass)
	readonly lazyFalseMap: Map<string, Address> | undefined;

	@Serialize({ classToken: AddressClass, lazy: false })
	readonly lazySettFalseMap: Map<string, Address> | undefined;

	@Serialize({ classToken: AddressClass, lazy: true })
	readonly lazySettTrueMap: Map<string, Address> | undefined;

	constructor() {}

	public equals(other: unknown): boolean {
		return other instanceof SerializeDecoratorSettings;
	}

	public hashCode(): number {
		return hashCd('234878473874873847383');
	}
}
