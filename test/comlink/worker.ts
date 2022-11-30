import * as Comlink from 'comlink';
import { SerializableArray, SerializableMap } from '../../src';
import { serializableObjectTransferHandler } from '../../src/serial/comlink/handler';
import { User } from '../fixtures/User';

export class TestWorker {
	constructor() {
		SerializableArray;
		SerializableMap;
		User;
	}

	getUser(user: User) {
		return user;
	}

	getArray(arr: SerializableArray<User>) {
		return arr;
	}

	getMap(map: SerializableMap<string, User>) {
		return map;
	}
}
Comlink.expose(TestWorker);
Comlink.transferHandlers.set('SerializableObject', serializableObjectTransferHandler);
