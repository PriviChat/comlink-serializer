export class SerialSymbol {
	static readonly serializable: unique symbol = Symbol('ComSer.serializable');
	static readonly serializableCollection: unique symbol = Symbol('ComSer.serializableCollection');
	static readonly serialized: unique symbol = Symbol('ComSer.serialized');
	static readonly serializableIterable: unique symbol = Symbol('ComSer.serializableIterable');
	static readonly serializableLazy: unique symbol = Symbol('ComSer.serializableLazy');
	static readonly classToken: unique symbol = Symbol('ComSer.classToken');
	static readonly serializeDescriptor: unique symbol = Symbol('ComSer.serialDescriptor');
	static readonly serializedProxy: unique symbol = Symbol('ComSer.serializedProxy');
}

export default SerialSymbol;
