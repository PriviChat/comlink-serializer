import { expect, test } from '@jest/globals';
import Product from '@test-fixtures/Product';
import { SerializableMap } from '@comlink-serializer';

describe('SerializableMap Tests', () => {
	test('Map serializes values', () => {
		const product1 = new Product('1', 'product1');
		const product2 = new Product('2', 'product2');

		const map = new SerializableMap([
			['1', product1],
			['2', product2],
		]);
		const serializedMap = map.serialize();

		expect(serializedMap.__$SCLASS).toBeDefined();
		serializedMap._map.forEach((value, key) => {
			expect(value.__$SCLASS).toBeDefined();
		});

		const newMap = new SerializableMap[Symbol.species]();
	});

	test('species constructor returns Map', () => {
		const map = new SerializableMap[Symbol.species]();
		expect(map).toBeInstanceOf(Map);
		expect(map).not.toBeInstanceOf(SerializableMap);
	});
});
