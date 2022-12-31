export default class SerialSymbol {
	static readonly serializable: unique symbol = Symbol('ComSer.serializable');
	static readonly iterator: unique symbol = Symbol('ComSer.iterator');
}

export function symDes(symbol: Symbol) {
	return symbol.description!;
}
