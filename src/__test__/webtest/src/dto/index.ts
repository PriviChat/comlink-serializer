import { Serializable } from 'comlink-serializer';
import Address from './address';
import Order from './order';
import Product from './product';
import User from './user';

let users: Map<number, User>;
let addresses: Map<number, Address>;
let products: Map<number, Product>;
let orders: Map<number, Order>;

function initCache() {
	users = new Map();
	addresses = new Map();
	products = new Map();
	orders = new Map();
}

function mA(idx: number) {
	const cv = addresses.get(idx);
	if (cv) return cv;
	else {
		const a = new Address('addr_' + idx, 'street_' + idx, 'city_' + idx, 'state_' + idx, idx);
		addresses.set(idx, a);
		return a;
	}
}

function mP(idx: number) {
	const cv = products.get(idx);
	if (cv) return cv;
	else {
		const p = new Product('SKU_' + idx, 'iPad_' + idx);
		products.set(idx, p);
		return p;
	}
}

function mU(idx: number) {
	const cv = users.get(idx);
	if (cv) return cv;
	else {
		const loopArr = new Array<number>(idx + 1).fill(idx + 1);
		const addrArr = loopArr.map((_, i) => mA(i));
		const u = new User('bob@email.org_' + idx, 'Bob_' + idx, 'Smith_' + idx, mA(idx), addrArr, idx);
		users.set(idx, u);
		return u;
	}
}

function mO(idx: number) {
	const cv = orders.get(idx);
	if (cv) return cv;
	else {
		const loopArr = new Array<number>(idx + 1).fill(idx + 1);
		const prodArr = loopArr.map((_, i) => mP(i));
		const o = new Order('ORD_' + idx, mU(idx), mA(idx), prodArr);
		orders.set(idx, o);
		return o;
	}
}

export function makeArr<T extends Serializable, A extends Array<T> = Array<T>>(
	name: 'user' | 'prod' | 'addr' | 'order',
	ct: number
): A {
	initCache();
	const loopArr = new Array<number>(ct).fill(ct);
	switch (name) {
		case 'user':
			return loopArr.map((_, idx) => mU(idx)) as unknown as A;
		case 'addr':
			return loopArr.map((_, idx) => mA(idx)) as unknown as A;
		case 'prod':
			return loopArr.map((_, idx) => mP(idx)) as unknown as A;
		case 'order':
			return loopArr.map((_, idx) => mP(idx)) as unknown as A;
	}
}

export function makeObj<T extends Serializable>(name: 'user' | 'prod' | 'addr' | 'order', idx: number): T {
	initCache();
	switch (name) {
		case 'user':
			return mU(idx) as unknown as T;
		case 'addr':
			return mA(idx) as unknown as T;
		case 'prod':
			return mP(idx) as unknown as T;
		case 'order':
			return mO(idx) as unknown as T;
	}
}
