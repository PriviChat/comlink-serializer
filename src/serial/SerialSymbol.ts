export default class SerialSymbol {
	static readonly registryId: unique symbol = Symbol('ComSer.registryId');
	static readonly class: unique symbol = Symbol('ComSer.class');
	static readonly iterable: unique symbol = Symbol('ComSer.iterable');
	static readonly iterator: unique symbol = Symbol('ComSer.iterator');
}
