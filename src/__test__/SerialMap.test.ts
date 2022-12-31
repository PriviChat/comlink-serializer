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
		const serMap = map.serialize();

		expect(SerialSymbol.serializable in serMap).toBeDefined();
		const serMapMeta = serMap[SerialSymbol.serializable]!();
		expect(serMapMeta).toBeDefined();
		expect(serMapMeta?.rid).toEqual(SymRegIdMap.SerialMap);
		expect(serMapMeta?.cln).toEqual(SymClassMap.SerialMap);
		expect(serMapMeta?.hsh).toBeDefined();

		let idx = 0;
		serMap._map.forEach((value, key) => {
			const serProd = value as SerializedProduct;
			expect(SerialSymbol.serializable in serProd).toBeDefined();
			const serProdMeta = serProd[SerialSymbol.serializable]!();
			expect(serProdMeta).toBeDefined();
			expect(serProdMeta?.rid).toEqual(SymRegIdMap.Product);
			expect(serProdMeta?.cln).toEqual(SymClassMap.Product);
			expect(serProdMeta?.hsh).toBeDefined();
			expect(serProd.productId).toEqual(idx.toString());
			expect(serProd.productName).toEqual('product_' + idx);
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
