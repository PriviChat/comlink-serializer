export class SerialSymbol {
	static readonly serializable: unique symbol = Symbol('ComSer.serializable');
	static readonly serializableCollection: unique symbol = Symbol('ComSer.serializableCollection');
	static readonly serialized: unique symbol = Symbol('ComSer.serialized');
	static readonly serializableIterable: unique symbol = Symbol('ComSer.serializableIterable');
}

export default SerialSymbol;
