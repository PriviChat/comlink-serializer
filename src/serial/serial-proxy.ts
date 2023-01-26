import * as Comlink from 'comlink';
import { v4 as uuid } from 'uuid';
import { Revivable, SerializableObject, SerializeDescriptorProperty } from './decorators';
import Serializable from './decorators/serializable';
import { Dictionary, ParentRef, SerializeCtx, SerializedProxy } from '.';
import { isSerializableObject } from './decorators/utils';
import SerialSymbol from './serial-symbol';
import { hashCd } from './utils';

@Serializable(SerialProxy.classToken)
class SerialProxy<T extends Serializable> implements Serializable<SerializedProxy>, Revivable<SerializedProxy> {
	static readonly classToken: unique symbol = Symbol('ComSer.serialProxy');
	private _id = uuid();
	private _port1?: MessagePort;
	private _port2: MessagePort;
	private _proxyClass: string;
	private _proxyDescr: Dictionary<SerializeDescriptorProperty>;
	private _proxyProp?: string;
	private _refClass?: string;
	private _proxy?: Comlink.Remote<SerializableObject<T>>;

	constructor(private obj: T, parentRef?: ParentRef) {
		if (!isSerializableObject(obj)) {
			let err;
			if (parentRef) {
				err = `ERR_NOT_SERIALIZABLE: Cannot create proxy for prop: ${
					parentRef.prop
				} on class: ${parentRef.classToken.toString()}. Prehaps you decorated: ${
					parentRef.prop
				} with @Serialize but it's value is not @Serializable. Object: ${JSON.stringify(obj)}`;
			} else {
				err = `ERR_NOT_SERIALIZABLE: Cannot create proxy for object: ${JSON.stringify(
					obj
				)}. A proxy can only be created for a @Serializable object.`;
			}
			console.error(err);
			throw new TypeError(err);
		}
		const { port1, port2 } = new MessageChannel();
		this._port1 = port1;
		this._port2 = port2;
		this._proxyClass = obj[SerialSymbol.classToken].toString();
		this._proxyDescr = obj[SerialSymbol.serializeDescriptor]();
		this._proxyProp = parentRef?.prop;
		this._refClass = parentRef?.classToken.toString();
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

	public get revived() {
		return this._port1 === undefined;
	}

	public getProxy(): Comlink.Remote<SerializableObject<T>> {
		if (!this._proxy) {
			throw new TypeError('ERR_NO_PROXY: Proxy is undefined in call to getProxy()');
		}
		return this._proxy;
	}

	private wrap() {
		if (!this._port2) {
			throw new TypeError('ERR_NO_PORT: Port2 is undefined in call to wrap()');
		}
		this._proxy = Comlink.wrap<SerializableObject<T>>(this._port2);
	}

	private expose() {
		if (!this._port1) {
			throw new TypeError('ERR_NO_PORT: Port1 is undefined in call to expose()');
		}
		Comlink.expose(this.obj, this._port1);
		return this._port2;
	}

	public async transfer() {
		// returns the unproxied object
		const proxy = this.getProxy();
		return await proxy.self;
	}

	//private wrapProxy(proxy: Comlink.Remote<T>) {}

	public serialize(): SerializedProxy {
		const serialObj: SerializedProxy = {
			id: this._id,
			port: this._port2,
			proxyClass: this.proxyClass,
			proxyProp: this._proxyProp,
			refClass: this._refClass,
		};
		return serialObj;
	}

	public afterSerialize(ctx: SerializeCtx, serialObj: SerializedProxy): SerializedProxy {
		// expose and set port as transferable
		ctx.addTransferable(this.expose());
		return serialObj;
	}

	public revive(sp: SerializedProxy) {
		this._id = sp.id;
		this._port1 = undefined;
		this._port2 = sp.port;
		this._proxyClass = sp.proxyClass;
		this._proxyProp = sp.proxyProp;
		this._refClass = sp.refClass;
	}

	public afterRevive(): void {
		// wrap port2
		this.wrap();
	}

	public hashCode(): number {
		return hashCd(this._id);
	}

	public equals(other: unknown) {
		return false;
	}
}

export default SerialProxy;
