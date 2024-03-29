export default class SerialSymbol {
	static readonly serializable: unique symbol = Symbol('ComSer.serializable');
	static readonly serialized = 'ComSer.serialized';
	static readonly transferables = 'ComSer.transferables';

	static readonly revived: unique symbol = Symbol('ComSer.revived');

	static readonly classToken: unique symbol = Symbol('ComSer.classToken');
	static readonly serializeDescriptor: unique symbol = Symbol('ComSer.serializeDescriptor');

	static readonly toSerial: unique symbol = Symbol('ComSer.toSerial');
	static readonly toSerialProxy: unique symbol = Symbol('ComSer.toSerialProxy');
	static readonly toSerialIterator: unique symbol = Symbol('ComSer.toSerialIterator');

	/* serial classes */
	static readonly serialMap: unique symbol = Symbol('ComSer.serialMap');
	static readonly serialArray: unique symbol = Symbol('ComSer.serialArray');
	static readonly serialSet: unique symbol = Symbol('ComSer.serialSet');
	static readonly serialProxy: unique symbol = Symbol('ComSer.serialProxy');
	static readonly serialIterableProxy: unique symbol = Symbol('ComSer.serialIterableProxy');
	static readonly serialIteratorResult: unique symbol = Symbol('ComSer.serialIteratorResult');
}
