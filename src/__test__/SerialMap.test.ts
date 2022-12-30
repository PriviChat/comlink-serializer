import { expect, test } from '@jest/globals';
import Product from '@test-fixtures/Product';
import { SerialSymbol, symDes } from '@comlink-serializer-internal';
import { SerialMap } from '@comlink-serializer';
import { SymClassMap, SymRegIdMap } from '@test-fixtures/SymMap';
import { SerializedProduct } from '@test-fixtures/types';

describe('SerialMap Tests', () => {
	test('Map serializes contents', () => {
		const product0 = new Product('0', 'product_0');
		const product1 = new Product('1', 'product_1');

		const map = new SerialMap<string, Product>([
			['0', product0],
			['1', product1],
		]);
		const serializedMap = map.serialize();

		expect(symDes(SerialSymbol.registryId) in serializedMap).toBeTruthy();
		expect(serializedMap['ComSer.registryId']).toEqual(SymRegIdMap.SerialMap);
		expect(serializedMap['ComSer.class']).toEqual(SymClassMap.SerialMap);

		let idx = 0;
		serializedMap._map.forEach((value, key) => {
			const serialProd = value as SerializedProduct;
			expect(serialProd['ComSer.registryId']).toEqual(SymRegIdMap.Product);
			expect(serialProd['ComSer.class']).toEqual(SymClassMap.Product);
			expect(serialProd.productId).toEqual(idx.toString());
			expect(serialProd.productName).toEqual('product_' + idx);
			idx += 1;
		});
		expect(idx).toEqual(2);
	});

	test('Species constructor returns Map', () => {
		const map = new SerialMap[Symbol.species]();
		expect(map).toBeInstanceOf(Map);
		expect(map).not.toBeInstanceOf(SerialMap);
	});
});
