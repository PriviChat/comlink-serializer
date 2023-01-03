export default class SerialSymbol {
	static readonly serializable: unique symbol = Symbol('ComSer.serializable');
	static readonly serializableIterable: unique symbol = Symbol('ComSer.serializableIterable');
}

export function symDes(symbol: Symbol) {
	return symbol.description!;
}
