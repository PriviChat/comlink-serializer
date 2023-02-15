import { ArrayIteratorTestConfig } from './array-iterator-test';
import { Test } from './types';

const arrayIteratorTest: Test<ArrayIteratorTestConfig> = {
	name: 'Array Iterator',
	desc: 'Test speed of array iterator',
	defaultConfig: { items: 5 },
	config: undefined,
	route: 'array-iterator',
};

export const perfTests: Array<Test> = [arrayIteratorTest];
