# Comlink Serializer

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

- [Comlink Serializer](#comlink-serializer)
  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Setup](#setup)
    - [TypeScript](#typescript)
    - [Babel](#babel)
  - [Usage](#usage)
    - [@Serializable](#serializable)
    - [Serialized](#serialized)
  - [Comlink Integration](#comlink-integration)
  - [Framework Data Structures](#framework-data-structures)
    - [SerializableArray \& SerializableMap](#serializablearray--serializablemap)

---

## Introduction

Comlink Serializer makes working with [Comlink](https://github.com/GoogleChromeLabs/comlink) even more enjoyable by providing a framework for the serialization and deserialization of your transfer objects. Your transfer objects come out on the Worker side with their prototypes intact. The framework supports deep serialization and comes with collection support for both Array and Map. There is no need to setup multiple transfer handlers because Comlink Serializer handles that for you. If you are new to Comlink, it's a good idea to start reading that documentation first.

---

## Installation

```bash
npm i comlink comlink-serializer
```

---

## Setup

Comlink Serializer leverages [decorators](https://www.typescriptlang.org/docs/handbook/decorators.html) to enforce the Serialize and Deserialize methods in your class. Decorators are still an experimental feature and as such, it is subject to change, but as far as I can tell has significant developer adoption.

> **Note**
> The decorator feature must be enabled in your project. Below are some examples, but consult the documentation for your setup.

### TypeScript

**_Command Line:_**

```bash
tsc --target ES5 --experimentalDecorators
```

**_tsconfig.json:_**

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

**_.babelrc:_**

```json
{
	"plugins": [
		["@babel/plugin-proposal-decorators", { "legacy": true }],
		["@babel/plugin-proposal-class-properties", { "loose": true }]
	],
	"presets": ["@babel/preset-typescript"]
}
```

---

## Usage

### @Serializable

You must apply the Serializable class decorator to any class you'd like to be transfered to a Worker Thread (or vice versa) and have the prototype maintained. This decorator enforces the methods you are required to implement.

**_serialize()_**

Automatically called immediately before your object is sent to another thread. There is no magic happening here to serialize your object. There are many options available to serialize a Class. One highly performant way is using JSON.stringify. The example below takes more of a manual approach, has great performance, and gives you greater control when you have a deep nesting of Serializable objects as you will see later.

> **Warning**
> Comlink Serializer does not currently detect or prevent circular references. It is currently up to you to prevent it from happening.

**_deserialize_**

Automatically called after your serialized object has been received by another thread, but before your worker function gets called. When the worker function gets called, the fully hydrated object with its prototype intact will be available as a parameter or return type. Object.assign and Object.create are the suggested approach for deserializing your serialized objects.

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

Your class must also implement the Serializable\<T\> interface which takes a generic parameter that is the interface or serialized representation of your class. That interface must extend Serialized.

```ts
import { Serialized } from 'comlink-serializer';

export interface SerializedUser extends Serialized {
	email: string;
	firstName: string;
	lastName: string;
}
```

It is also possible to create a deep or nested structure of Serialized objects that all get deserialized with their prototypes intact. How this works is not sorcery, you are doing a lot of the light lifting, but this framework helps you implement your code in a consistent way, which is not only nice to your fellow developers but also might save the world.

Let's work from the above example for User and add an Address class. The Address class you'd create would also get the @Serializable decorator and implement Serializable\<T\> and is implemented with serialize() and deserialize(...) in a similar way as User above. The User class requires updates to its serialize() and deserialize(...) functions to properly handle the Address class.

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

The SerializedUser interface would need to be updated to include the new address property of type SerializedAddress.

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

### Serialized

As illustrated in the examples above, the interface of the serialized form of your class must extend Serialized.

```ts
import { Serialized } from 'comlink-serializer';

export interface SerializedUser extends Serialized {
	email: string;
	firstName: string;
	lastName: string;
}
```

---

## Comlink Integration

> **Note**
> This document assumes a good understanding of how to work with Comlink. If you are new to Comlink, please do your homework.

Comlink supplies a feature called [Transfer Handlers](https://github.com/GoogleChromeLabs/comlink#transfer-handlers-and-event-listeners) which is what Comlink Serializer uses under the covers to assist in marshaling your objects between threads. Just like with Comlink where you need to register your transfer handlers on both sides (eg. Main Thread and Worker Thread - I always think of Space Balls - 'There are two sides to every Schwartz'), you need to do the same with the Comlink Serializer Transfer Handler. This is because each thread has a dedicated Execution Context.

The supplied Transfer Handler takes the place of having to register any individual Comlink Transfer Handlers. That said, nothing prevents you from creating and registering a custom ComLink Transfer Handler if you need something outside the scope of Comlink Serializer.

**_Worker Thread_**

```ts
import * as Comlink from 'comlink';
import ComlinkSerializer, { TransferHandlerRegistration } from 'comlink-serializer';
import { User, Address } from 'somewhere';

const handlerRegistration: TransferHandlerRegistration = { transferClasses: [User, Address] };

export class MyWorker {
	getUser(email: string) {
		const user = api.loadUser(email);
		return user;
	}
}
Comlink.expose(MyWorker);
ComlinkSerializer.registerTransferHandler(handlerRegistration);
```

**_Main Thread_**

```ts
import * as Comlink from 'comlink';
import ComlinkSerializer, { TransferHandlerRegistration } from 'comlink-serializer';
import type { MyWorker } from './path/to/your/worker';
import { User, Address } from 'somewhere';

const handlerRegistration: TransferHandlerRegistration = { transferClasses: [User, Address] };

type WorkerConstructor<T> = new (...input: any[]) => Promise<Comlink.Remote<T>>;
type WorkerFacade<T> = Comlink.Remote<WorkerConstructor<T>>;

const getUser = async (email: string) => {
	const worker = new Worker('./path/to/your/worker.js');
	const wrappedWorker = Comlink.wrap(worker) as WorkerFacade<TestWorker>;
	const myWorker = await new wrappedWorker();
	return await myWorker.getUser(email);
};

ComlinkSerializer.registerTransferHandler(handlerRegistration);
```

You can read more about [Comlink.expose()](https://github.com/GoogleChromeLabs/comlink#comlinkwrapendpoint-and-comlinkexposevalue-endpoint) if you are just coming up to speed or need a refresher. ComlinkSerializer.registerTransferHandler() does two things (currently), it creates the required Comlink Transfer Hander for your [@Serializable](#serializable) classes, and it takes a configuration that needs an Array of your Serializable classes. If you forget to include a class, your application may work perfectly fine, but it also may not (you'll know the difference), so take care to make sure all Serializable classes are included. If you are working with a large number of Serializable classes, it may make sense put the TransferHandlerRegistration in a common file that gets imported on both sides of the thread.

---

## Framework Data Structures

### SerializableArray & SerializableMap

Comlink Serializer currently supplies two data structures that can be serialized out of the box, SerializableArray and SerializableMap. To illustrate, let's build upon the example in the [@Serializable](Serializable) section where we created User, but let's assume you want to transfer an array of User objects from your Worker Thread (or vice versa).

**_Worker Thread_**

```ts
import * as Comlink from 'comlink';
import ComlinkSerializer, { TransferHandlerRegistration, SerializableArray } from 'comlink-serializer';
import { User, Address } from 'somewhere';

const handlerRegistration: TransferHandlerRegistration = { transferClasses: [User, Address] };

export class MyWorker {
	getUsers() {
		const users: Array<User> = api.loadUsers();
		return SerializableArray.from(users);
	}
}
Comlink.expose(MyWorker);
ComlinkSerializer.registerTransferHandler(handlerRegistration);
```

When you receive the results back in the caller thread convert it back to an Array\<User\> before passing the results to any other functions.

**_Main Thread_**

```ts
const users = await myWorker.getUsers();
return results.map((user) => user);
```

From an architecture perspective, we don't recommend propagating SerializableArray and SerializableMap throughout your code. We've found it better to restrict the use of them to the thread boundaries. If you have an extremely large dataset and converting the Array or Map is a performance concern, SerializableArray and SerializableMap extend Array and Map respectively, and should function the same.

[build-img]: https://github.com/privichat/comlink-serializer/actions/workflows/release.yml/badge.svg
[build-url]: https://github.com/privichat/comlink-serializer/actions/workflows/release.yml
[downloads-img]: https://img.shields.io/npm/dt/comlink-serializer
[downloads-url]: https://www.npmtrends.com/comlink-serializer
[npm-img]: https://img.shields.io/npm/v/comlink-serializer
[npm-url]: https://www.npmjs.com/package/comlink-serializer
[issues-img]: https://img.shields.io/github/issues/privichat/comlink-serializer
[issues-url]: https://github.com//privichat/comlink-serializer/issues
[codecov-img]: https://codecov.io/gh/privichat/comlink-serializer/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/privichat/comlink-serializer
[semantic-release-img]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[commitizen-img]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]: http://commitizen.github.io/cz-cli/
