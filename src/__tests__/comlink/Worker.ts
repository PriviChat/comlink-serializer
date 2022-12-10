import * as Comlink from 'comlink';
import ComlinkSerializer, { SerializableArray, SerializableMap } from '../..';
import { User } from '../fixtures/User';

export default class TestWorker {
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
Comlink.expose(TestWorker, self as any);
ComlinkSerializer.registerTransferHandler({ transferClasses: [User] });
