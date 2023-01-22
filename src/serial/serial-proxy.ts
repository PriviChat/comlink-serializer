import * as Comlink from 'comlink';
import { v4 as uuid } from 'uuid';
import stringHash from 'string-hash';
import { SerialClassToken, SerializableObject, SerializeDescriptorProperty } from './decorators';
import Serializable from './decorators/serializable';
import { Dictionary, SerializedProxy } from '.';
import { isSerializableObject } from './decorators/utils';
import SerialSymbol from './serial-symbol';

@Serializable(SerialProxy.classToken)
class SerialProxy<T extends Serializable> implements Serializable<SerializedProxy> {
	static readonly classToken: unique symbol = Symbol('ComSer.serialProxy');
	private _id: string;
	private _port1?: MessagePort;
	private _port2: MessagePort;
	private _proxyClass: string;
	private _proxyProp: string;
	private _proxyDescr: Dictionary<SerializeDescriptorProperty>;
	private _refClass: string;
	private _proxy?: Comlink.Remote<SerializableObject<T>>;

	constructor(private obj: T, prop: string, refClass: SerialClassToken) {
		if (!isSerializableObject(obj)) {
			const err = `ERR_NOT_SERIALIZABLE: Cannot create lazy proxy for prop: ${prop} on class: ${refClass.toString()}. Prehaps you decorated: ${prop} with @Serialize but it's value is not @Serializable. Object: ${JSON.stringify(
				obj
			)}`;
			console.error(err);
			throw new TypeError(err);
		}
		this._id = uuid();
		const { port1, port2 } = new MessageChannel();
		this._port1 = port1;
		this._port2 = port2;
		this._proxyClass = obj[SerialSymbol.classToken]().toString();
		this._proxyDescr = obj[SerialSymbol.serializeDescriptor]();
		this._proxyProp = prop;
		this._refClass = refClass.toString();
	}

	[SerialSymbol.serializeDescriptor](): Dictionary<SerializeDescriptorProperty> {
		return this._proxyDescr;
	}

	public get id() {
		return this._id;
	}

	public get proxyClass() {
		return this._proxyClass;
	}

	public get proxyProp() {
		return this._proxyProp;
	}

	public get proxyDescr() {
		return this._proxyDescr;
	}

	public get port() {
		return this._port2;
	}

	public get revived() {
		return this._port1 === undefined;
	}

	public getProxy(): Comlink.Remote<SerializableObject<T>> {
		if (!this._proxy) this._proxy = Comlink.wrap<SerializableObject<T>>(this._port2);
		return this._proxy;
	}

	private wrapProxy(proxy: Comlink.Remote<T>) {}

	public serialize?(): SerializedProxy {
		const serialObj: SerializedProxy = {
			[SerialSymbol.serializedProxy]: true,
			id: this._id,
			port: this._port2,
			proxyClass: this.proxyClass,
			proxyProp: this._proxyProp,
			//	proxyDescr: this._proxyDescr,
			refClass: this._refClass,
		};
		if (this._port1) Comlink.expose(this.obj, this._port1);
		return serialObj;
	}

	public revive?(sp: SerializedProxy) {
		this._id = sp.id;
		this._port1 = undefined;
		this._port2 = sp.port;
		this._proxyClass = sp.proxyClass;
		this._proxyProp = sp.proxyProp;
		//this._proxyDescr = sp.proxyDescr;
		this._refClass = sp.refClass;
	}

	public equals(other: unknown): boolean {
		return other instanceof SerialProxy && other._id === this._id;
	}

	public hashCode(): number {
		return stringHash(this._id);
	}
}

export default SerialProxy;
