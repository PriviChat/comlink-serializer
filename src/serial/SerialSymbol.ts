export default class SerialSymbol {
	static readonly registryId: unique symbol = Symbol('ComSer.registryId');
	static readonly class: unique symbol = Symbol('ComSer.class');
	static readonly serializable: unique symbol = Symbol('ComSer.serializable');
	static readonly iterator: unique symbol = Symbol('ComSer.iterator');
}

export function symDes(symbol: Symbol) {
	return symbol.description!;
}
