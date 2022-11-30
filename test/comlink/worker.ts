import * as Comlink from 'comlink';
import { SerializableArray } from '../../src';
import { serializableObjectTransferHandler } from '../../src/serial/comlink/handler';
import { User } from '../fixtures/User';

export class TestWorker {
	constructor() {
		User;
	}

	getUser(user: User) {
		return user;
	}

	getArray(arr: SerializableArray<User>) {
		return arr;
	}
}
Comlink.expose(TestWorker);
Comlink.transferHandlers.set('SerializableObject', serializableObjectTransferHandler);
