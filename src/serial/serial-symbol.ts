export default class SerialSymbol {
	static readonly serializable: unique symbol = Symbol('ComSer.serializable');
	static readonly serialized = 'ComSer.serialized';

	static readonly revived: unique symbol = Symbol('ComSer.revived');

	static readonly classToken: unique symbol = Symbol('ComSer.classToken');
	static readonly serializeDescriptor: unique symbol = Symbol('ComSer.serializeDescriptor');

	static readonly toSerial: unique symbol = Symbol('ComSer.toSerial');
	static readonly toSerialProxy: unique symbol = Symbol('ComSer.toSerialProxy');
	static readonly toSerialIterator: unique symbol = Symbol('ComSer.toSerialIterator');
}
