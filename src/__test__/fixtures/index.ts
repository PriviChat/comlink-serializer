import { Serializable } from '@comlink-serializer';
import Address from './address';
import Order from './order';
import Product from './product';
import User from './user';

function mA(idx: number) {
	return new Address('addr_' + idx, 'street_' + idx, 'city_' + idx, 'state_' + idx, idx);
}

function mP(idx: number) {
	return new Product('SKU_' + idx, 'iPad_' + idx);
}

function mU(idx: number) {
	const loopArr = new Array<number>(idx + 1).fill(idx + 1);
	const addrArr = loopArr.map((_, i) => mA(i));
	return new User('bob@email.org_' + idx, 'Bob_' + idx, 'Smith_' + idx, mA(idx), addrArr, idx);
}

function mO(idx: number) {
	const loopArr = new Array<number>(idx + 1).fill(idx + 1);
	const prodArr = loopArr.map((_, i) => mP(i));
	return new Order('ORD_' + idx, mU(idx), prodArr);
}

export function makeArr<T extends Serializable, A extends Array<T> = Array<T>>(
	name: 'user' | 'prod' | 'addr' | 'order',
	ct: number
): A {
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
