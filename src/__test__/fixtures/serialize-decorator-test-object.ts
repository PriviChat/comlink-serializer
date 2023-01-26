import { Serializable, Serialize, hashCd } from '@comlink-serializer';
import Address from '@test-fixtures/address';
import { AddressClass, SerializeDecoratorTestObjectClass } from './types';

@Serializable(SerializeDecoratorTestObjectClass)
export default class SerializeDecoratorTestObject {
	@Serialize()
	readonly proxyFalseObject?: Address;

	@Serialize(false)
	readonly proxyBoolFalseObject?: Address;

	@Serialize(true)
	readonly proxyBoolTrueObject?: Address;

	@Serialize({ proxy: true })
	readonly proxySetTrueObject?: Address;

	@Serialize({ proxy: false })
	readonly proxySetFalseObject?: Address;

	@Serialize(AddressClass)
	readonly proxyFalseArray?: Address[];

	@Serialize({ classToken: AddressClass, proxy: false })
	readonly proxySetFalseArray?: Address[];

	@Serialize({ classToken: AddressClass, proxy: true })
	readonly proxySetTrueArray?: Address[];

	@Serialize(AddressClass)
	readonly proxyFalseMap?: Map<string, Address>;

	@Serialize({ classToken: AddressClass, proxy: false })
	readonly proxySetFalseMap?: Map<string, Address>;

	@Serialize({ classToken: AddressClass, proxy: true })
	readonly proxySetTrueMap?: Map<string, Address>;

	constructor() {}

	public equals(other: unknown): boolean {
		return other instanceof SerializeDecoratorTestObject;
	}

	public hashCode(): number {
		return hashCd('234878473874873847383');
	}
}
