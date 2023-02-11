import { hashCd, Serializable, Serialize } from '@comlink-serializer';
import Product from './product';
import User from './user';
import Address from './address';
import { OrderClass, ProductClass, SerializedOrder } from './types';

@Serializable(OrderClass)
class Order implements Serializable<SerializedOrder> {
	readonly orderId: string;

	@Serialize(true)
	readonly userProxy: User;

	@Serialize()
	readonly user: User;

	@Serialize(false)
	private address: Address;

	@Serialize(true)
	readonly addressProxy: Address;

	@Serialize(ProductClass)
	readonly productArr: Product[];

	@Serialize(ProductClass)
	readonly productSet: Set<Product>;

	@Serialize({ classToken: ProductClass, proxy: true })
	readonly productSetProxy: Set<Product>;

	constructor(orderId: string, user: User, address: Address, products: Product[]) {
		this.orderId = orderId;
		this.user = user;
		this.userProxy = new User(user.email, user.firstName, user.lastName, user.getPriAddress(), user.addressArr);
		this.address = address;
		this.addressProxy = new Address(address.id, address.street, address.city, address.state, address.zip);
		this.productArr = products;
		this.productSet = new Set(products);
		this.productSetProxy = new Set(products);
	}

	public setAddress(address: Address) {
		this.address = address;
	}

	public getAddress() {
		return this.address;
	}

	public hashCode(): number {
		return hashCd(this.orderId);
	}

	public equals(other: unknown) {
		return other instanceof Order && other.orderId === this.orderId;
	}
}

export default Order;
