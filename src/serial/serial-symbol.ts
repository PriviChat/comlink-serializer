export default class SerialSymbol {
	static readonly classToken: unique symbol = Symbol('ComSer.classToken');
	static readonly serializeDescriptor: unique symbol = Symbol('ComSer.serialDescriptor');

	static readonly serializable: unique symbol = Symbol('ComSer.serializable');

	static readonly serial: unique symbol = Symbol('ComSer.serial');
	static readonly serialLazy: unique symbol = Symbol('ComSer.serialLazy');
	static readonly serialIterableWrap: unique symbol = Symbol('ComSer.serialIterableWrap');

	static readonly serialized: unique symbol = Symbol('ComSer.serialized');
	static readonly serializedProxy: unique symbol = Symbol('ComSer.serializedProxy');
}
