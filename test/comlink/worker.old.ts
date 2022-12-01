import * as Comlink from 'comlink';
import ComlinkSerializer, { SerializableArray, SerializableMap } from '../../src';
import { User } from '../fixtures/User';

export class TestWorker {
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
ComlinkSerializer.registerTransferHandler([User]);
