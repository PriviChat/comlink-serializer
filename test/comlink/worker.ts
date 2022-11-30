import * as Comlink from 'comlink';
import { serializableObjectTransferHandler } from '../../src/serial/comlink/handler';
import { User } from '../fixtures/User';

export class TestWorker {
	constructor() {
		User;
	}

	getUser(user: User) {
		return user;
	}
}
Comlink.expose(TestWorker);
Comlink.transferHandlers.set('SerializableObject', serializableObjectTransferHandler);
