import { Serialized, SerialPrimitive } from '../types';
import { AnySerialIterator, AsyncReviveIterator, IteratorMessageType } from './types';

export default abstract class MessageChannelIterable<I extends AnySerialIterator | AsyncReviveIterator> {
	protected iterator: I;
	readonly port: MessagePort;

	constructor(param: MessagePort | AnySerialIterator) {
		if (param instanceof MessagePort) {
			this.port = param;
			this.iterator = this.wrap(this.port) as I;
		} else {
			const channel = new MessageChannel();
			this.iterator = this.expose(param, channel.port1) as I;
			this.port = channel.port2;
		}
	}

	private wrap = (port: MessagePort) => {
		const iterator: AsyncReviveIterator = {
			next: function (...args: []) {
				port.postMessage({ type: IteratorMessageType.Next, ...args });
				return new Promise((resolve) => {
					port.onmessage = ({ data }) => {
						resolve(data);
					};
				});
			},

			return: function (value?: Serialized | [SerialPrimitive, Serialized]) {
				port.postMessage({ type: IteratorMessageType.Return, value });
				return new Promise((resolve) => {
					port.onmessage = ({ data }) => {
						resolve(data);
					};
				});
			},
		};
		return iterator;
	};

	private expose = (iterator: AnySerialIterator, port: MessagePort) => {
		port.onmessage = async ({ data: { type, value } }) => {
			switch (type) {
				case IteratorMessageType.Next:
					port.postMessage(await iterator.next(value));
					break;
				case IteratorMessageType.Return:
					if (iterator.return) {
						port.postMessage(await iterator.return(value));
					}
					break;
				case IteratorMessageType.Throw:
					//port.postMessage(await iterator.throw(value));
					break;
				default:
					return;
			}
		};
		return iterator;
	};
}
