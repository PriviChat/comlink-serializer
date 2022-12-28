import { expect, test } from '@jest/globals';
import Product from '@test-fixtures/Product';
import { SerialMap, _$ } from '@comlink-serializer';

describe('SerialMap Tests', () => {
	test('Map serializes values', () => {
		const product1 = new Product('1', 'product1');
		const product2 = new Product('2', 'product2');

		const map = new SerialMap([
			['1', product1],
			['2', product2],
		]);
		const serializedMap = map.serialize();

		expect((serializedMap as any)[_$.SerialSymbol.registryId]).toBeDefined();
		serializedMap._map.forEach((value, key) => {
			expect((value as any)[_$.SerialSymbol.registryId]).toBeDefined();
		});

		const newMap = new SerialMap[Symbol.species]();
	});

	test('species constructor returns Map', () => {
		const map = new SerialMap[Symbol.species]();
		expect(map).toBeInstanceOf(Map);
		expect(map).not.toBeInstanceOf(SerialMap);
	});
});
