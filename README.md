# Comlink Serializer

Comlink Serializer makes working with [Comlink](https://github.com/GoogleChromeLabs/comlink) even more enjoyable by providing a framework for the serialization and deserialization of your transfer objects. Your transfer objects come out on the Worker side with their prototypes intact. The framwork supports deep serialization, and comes with collection support for both Array and Map. There is no need to setup multiple tansfer handlers because Comlink Serializer handles that for you. If you are new to Comlink, it's a good idea to start reading that documentation first.

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

- [Comlink Serializer](#comlink-serializer)
  - [Install](#install)
  - [Setup](#setup)
    - [Babel](#babel)
  - [@Serializable](#serializable)
  - [Comlink Integration](#comlink-integration)
    - [Worker Side](#worker-side)
  - [SerializableArray and SerializableMap](#serializablearray-and-serializablemap)
    - [Worker Thread](#worker-thread)
    - [Main Thread](#main-thread)

## Install

```bash
npm i comlink comlink-serializer
```

## [Setup](#setup)

Comlink Serializer leverages [decorators](https://www.typescriptlang.org/docs/handbook/decorators.html) to enforce the Serialize and Deserialize methods in your class. Decorators are still an exparimental feature and as such, it is subject to change, but as far as I can tell has very good adoption and has been stable.

> **Note**
> The decorator feature must be enabled in your project. Below are some examples, but consult the documentation for your setup.

Command Line:

```bash
tsc --target ES5 --experimentalDecorators
```

tsconfig.json:

```json
{
	"compilerOptions": {
		"target": "ES5",
		"experimentalDecorators": true
	}
}
```

### Babel

If you're using [Babel](https://babeljs.io/docs/en/). More on Babel [Decorators](https://babel.dev/docs/en/babel-plugin-proposal-decorators).

```bash
npm install --save-dev @babel/plugin-proposal-decorators
```

.babelrc

```json
{
	"plugins": [
		["@babel/plugin-proposal-decorators", { "legacy": true }],
		["@babel/plugin-proposal-class-properties", { "loose": true }]
	],
	"presets": ["@babel/preset-typescript"]
}
```

## [@Serializable](Serializable)

You must apply the Serializable class decorator to any class you'd like to be transfered to a worker thread and have the prototype maintained. This decorator enforces the methods you are required to implement.

```ts
import { Serializable } from 'comlink-serializer';

@Serializable
export class User implements Serializable<SerializedUser> {
	constructor(readonly email: string, readonly firstName: string, readonly lastName: string) {}

	static deserialize(data: SerializedUser): User {
		return Object.assign(Object.create(User.prototype), data);
	}

	public serialize(): SerializedUser {
		return {
			email: this.email,
			firstName: this.firstName,
			lastName: this.lastName,
		};
	}
}
```

Your class must also implement the Serializable\<T\> interface which takes a generic parmeter that is the interface or serialized representation of your class. That interface must extend Serialized.

```ts
import { Serialized } from 'comlink-serializer';

export interface SerializedUser extends Serialized {
	email: string;
	firstName: string;
	lastName: string;
}
```

It is also possible to create a deep object structure of Serialized objects that get deserialized with their prototypes intact. How this works is not sorcery, you are doing a lot of the light lifting, but this framwork helps you implement your code in a consistant way, which is not only nice to your fellow developers, but also might save the world.

Let's work off the above example for User and add an Address class. The Address class you'd create would also get the @Serializable decorator and implement Serializable\<T\> and implmented in a similar way as User above. The User class would need updates to its serialize and deserialize function to handle the Address class.

```ts
@Serializable
export class User implements Serializable<SerializedUser> {
	constructor(
		readonly email: string,
		readonly firstName: string,
		readonly lastName: string,
		readonly address: Address
	) {}

	static deserialize(data: SerializedUser): User {
		const address = Address.deserialize(data.address);
		return Object.assign(Object.create(User.prototype), { ...data, address });
	}

	public serialize(): SerializedUser {
		return {
			email: this.email,
			firstName: this.firstName,
			lastName: this.lastName,
			address: this.address.serialize(),
		};
	}
}
```

The SerializedUser interface would need to be updated.

```ts
export interface SerializedUser extends Serialized {
	email: string;
	firstName: string;
	lastName: string;
	address: SerializedAddress;
}

export interface SerializedAddress extends Serialized {
	address1: string;
	address2: string;
	city: string;
	state: string;
	zip: string;
}
```

If the User object needs to contain an Array of Address objects you'd make the following updates.

```ts
@Serializable
export class User implements Serializable<SerializedUser> {
	constructor(
		readonly email: string,
		readonly firstName: string,
		readonly lastName: string,
		readonly addresses: Address[]
	) {}

	static deserialize(data: SerializedUser): User {
		const addresses = data.addresses.map((address) => Address.deserialize(address));
		return Object.assign(Object.create(User.prototype), { ...data, addresses });
	}

	public serialize(): SerializedUser {
		return {
			email: this.email,
			firstName: this.firstName,
			lastName: this.lastName,
			addresses: this.addresses.map((address) => address.serialize()),
		};
	}
}

export interface SerializedUser extends Serialized {
	email: string;
	firstName: string;
	lastName: string;
	addresses: SerializedAddress[];
}
```

## [Comlink Integration](#comlink-integration)

> **Note**
> This document assumes a good understanding of how to work with Comlink. If you are new to Comlink, please do your homework.

Comlink supplies a feature called [Transfer Handlers](https://github.com/GoogleChromeLabs/comlink#transfer-handlers-and-event-listeners) which is what Comlink Serializer uses under the covers to assist in marshalling your objects between threads. Just like with Comlink where you need to register your transfer handlers on both sides (eg. main thread and worker thread - I always think of Space Balls - There are two sides to every Schwartz), you need to do the same with the Comlink Serializer Transfer Handler. This is because each thread has it's own Execution Context.

### Worker Side

```ts
import * as Comlink from 'comlink';
import ComlinkSerializer, { TransferHandlerRegistration } from 'comlink-serializer';
import { User, Address } from 'somewhere';

const handlerRegistration: TransferHandlerRegistration = { transferClasses: [User, Address] };

export class MyWorker {
	getUser(user: User) {
		return user;
	}
}
Comlink.expose(MyWorker);
ComlinkSerializer.registerTransferHandler(handlerRegistration);
```

You can read more about [Comlink.expose()](https://github.com/GoogleChromeLabs/comlink#comlinkwrapendpoint-and-comlinkexposevalue-endpoint) if you are just coming up to speed or need a refresher. ComlinkSerializer.registerTransferHandler(...) does two things (currently), it creates the required Comlink Transfer Hander for your [@Serializable](#serializable) classes, and it takes a configuration that that needs an Array of your Serializable classes. If you forget to include a class, your application may work perfectly fine, but it also may explode, so take care to make sure all classes are included. If you are working with a large number of Serializable classes, it may make sense put the TransferHandlerRegistration in a common file that gets imported on both sides of the thread.

## [SerializableArray and SerializableMap](#serializable-array-map)

Comlink Serializer currently supplies two data structures that can be serialized out of the box, SerializableArray and SerializableMap. Let's build upon the example in the [@Serializable](Serializable) section where we created User, but let's assume you want to transfer an array of User objects to your worker thread.

### Worker Thread

```ts
import * as Comlink from 'comlink';
import ComlinkSerializer, { TransferHandlerRegistration, SerializableArray } from 'comlink-serializer';
import { User, Address } from 'somewhere';

const handlerRegistration: TransferHandlerRegistration = { transferClasses: [User, Address] };

export class MyWorker {
	loadUsers() {
		const users: Array<User> = db.fetchUsers();
		return SerializableArray.from(users);
	}
}
Comlink.expose(MyWorker);
ComlinkSerializer.registerTransferHandler(handlerRegistration);
```

When you receive the results back in the caller thread convert it back to an Array\<User\> before passing the results to any other functions.

### Main Thread

```ts
const users = await myWorker.loadUsers();
return results.map((user) => user);
```

From an archetecture prespective, we don't recommend propagating SerializableArray and SerializableMap throughout your code. We've found it better to restrict the use of them to the thread boundries. If you have an extreamly large dataset where the conversion is a performance problem, SerializableArray and SerializableMap extend Array and Map respectively and should function exactly the same.

\[build\-img\]:https://github\.com/ryansonshine/typescript\-npm\-package\-template/actions/workflows/release\.yml/badge\.svg
\[build\-url\]:https://github\.com/ryansonshine/typescript\-npm\-package\-template/actions/workflows/release\.yml
\[downloads\-img\]:https://img\.shields\.io/npm/dt/typescript\-npm\-package\-template
\[downloads\-url\]:https://www\.npmtrends\.com/typescript\-npm\-package\-template
\[npm\-img\]:https://img\.shields\.io/npm/v/typescript\-npm\-package\-template
\[npm\-url\]:https://www\.npmjs\.com/package/typescript\-npm\-package\-template
\[issues\-img\]:https://img\.shields\.io/github/issues/ryansonshine/typescript\-npm\-package\-template
\[issues\-url\]:https://github\.com/ryansonshine/typescript\-npm\-package\-template/issues
\[codecov\-img\]:https://codecov\.io/gh/ryansonshine/typescript\-npm\-package\-template/branch/main/graph/badge\.svg
\[codecov\-url\]:https://codecov\.io/gh/ryansonshine/typescript\-npm\-package\-template
\[semantic\-release\-img\]:https://img\.shields\.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80\-semantic\-\-release\-e10079\.svg
\[semantic\-release\-url\]:https://github\.com/semantic\-release/semantic\-release
\[commitizen\-img\]:https://img\.shields\.io/badge/commitizen\-friendly\-brightgreen\.svg
\[commitizen\-url\]:http://commitizen\.github\.io/cz\-cli/
