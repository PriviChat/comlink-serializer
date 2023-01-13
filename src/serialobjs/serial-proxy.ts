import * as Comlink from 'comlink';
import { v4 as uuid } from 'uuid';
import stringHash from 'string-hash';
import { SerialClassToken, Serializable } from '../serial/decorators';
import { SerializeCtx, Serialized, SerialSymbol } from '../serial';
import { SerializedProxy } from './types';
import { isSerializableObject } from '../serial/decorators/utils';

@Serializable(SerialProxy.classToken)
export default class SerialProxy<T extends Serializable> implements Serializable<SerializedProxy> {
	static readonly classToken: unique symbol = Symbol('ComSer.serialProxy');
	private _id: string;
	private _port1: MessagePort;
	private _port2: MessagePort;
	private _proxyClass: string;
	private _proxyProp: string;
	private _outerClass: string;
	private _proxy?: Comlink.Remote<Serializable>;

	constructor(private obj: T, prop: string, outerClass: SerialClassToken) {
		if (!isSerializableObject(obj)) {
			const err = `ERR_NOT_SERIALIZABLE: Cannot create lazy proxy for prop: ${prop} on class: ${outerClass.toString()}. Prehaps you decorated: ${prop} with @Serialize but it's value is not @Serializable. Object: ${JSON.stringify(
				obj
			)}`;
			console.error(err);
			throw new TypeError(err);
		}
		this._id = uuid();
		const { port1, port2 } = new MessageChannel();
		this._port1 = port1;
		this._port2 = port2;
		this._proxyClass = obj[SerialSymbol.serializable]().classToken;
		this._proxyProp = prop;
		this._outerClass = outerClass.toString();
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

	public get port() {
		return this._port2;
	}

	public getProxy<T extends Serializable>(): Comlink.Remote<T> {
		// there is some weird comlink typescript stuff happening
		// so we must hack away.
		if (!this._proxy) this._proxy = Comlink.wrap<T>(this._port2) as any;
		return this._proxy as Comlink.Remote<T>;
	}

	public serialize(ctx: SerializeCtx): SerializedProxy {
		const serialObj: SerializedProxy = {
			[SerialSymbol.serializedProxy]: true,
			id: this._id,
			port: this._port2,
			proxyClass: this.proxyClass,
			proxyProp: this._proxyProp,
			outerClass: this._outerClass,
		};
		Comlink.expose(this.obj, this._port1);
		return serialObj;
	}

	public revive?(sp: SerializedProxy) {
		this._id = sp.id;
		this._port2 = sp.port;
		this._proxyClass = sp.proxyClass;
		this._proxyProp = sp.proxyProp;
		this._outerClass = sp.outerClass;
	}

	public equals(other: unknown): boolean {
		return other instanceof SerialProxy && other._id === this._id;
	}

	public hashCode(): number {
		return stringHash(this._id);
	}
}
