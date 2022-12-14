import * as Comlink from 'comlink';
import ComlinkSerializer, { SerializableArray, SerializableMap } from '@comlink-serializer';
import User from '@test-fixtures/User';

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
Comlink.expose(TestWorker, this);
ComlinkSerializer.registerTransferHandler({ transferClasses: [User] });
