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
    - [Serializable \& Deserializable](#serializable--deserializable)
    - [Serialized](#serialized)
  - [Comlink Integration](#comlink-integration)
    - [RegisterTransferHandler](#registertransferhandler)
  - [Available Data Structures](#available-data-structures)
    - [SerializableArray \& SerializableMap](#serializablearray--serializablemap)
  - [Roadmap](#roadmap)

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

Comlink Serializer leverages [decorators](https://www.typescriptlang.org/docs/handbook/decorators.html) to enforce the Serialize and Deserialize methods in your class. Decorators are still an experimental feature and as such, it is subject to change, but as far as I can tell has significant developer adoption. Compatibility issues do exist if you are using tools like Babel to transpile your source code and dependencies.

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
	"plugins": [["@babel/plugin-proposal-decorators"], ["@babel/plugin-proposal-class-properties", { "loose": true }]],
	"presets": ["@babel/preset-typescript"]
}
```

> **Warning**
> There is an open issue [12007](https://github.com/babel/babel/pull/12007) in Babel that prevents class decorators from getting applied when you attempt to instantiate a class from within itself. This is often done when using the singleton pattern or any type of static factory method. If you instantiate your class this way, the resulting object will not be wrapped by the @Serializable decorator and will fail to be properly serialized or deserialized. We have only experienced this when configuring the plugin-proposal-decorators with **version:"legacy"**.

---

## Usage

### @Serializable

You must apply the Serializable class decorator to any class you'd like to be transferred to a Worker Thread (or vice versa) and have the prototype maintained. This decorator enforces the methods you are required to implement.

### Serializable & Deserializable

These are convenience interfaces that you can apply to your class to allow your IDE to automatically add the methods you need to implement when using the @Serializable decorator. You can remove these interfaces once you have your class properly set up.

```ts
import { Serializable, Deserializable } from 'comlink-serializer';

@Serializable
export class Foo implements Serializable<SerializedFoo>, Deserializable<SerializedFoo, Foo> {}
```

**_serialize()_**

Automatically called immediately before your object is sent to another thread. There are many options available to serialize a Class. One highly performant way is using JSON.stringify(). The example below takes more of a manual approach, has great performance, and gives you greater control when you have a deep nesting of Serializable objects as you will see later.

> **Warning**
> Comlink Serializer does not currently detect or prevent circular references. It is currently up to you to prevent it from happening.

**_deserialize_**

Automatically called after your serialized object has been received by another thread, but before your worker function gets called. When the worker function gets called, a new fully hydrated object with its prototype intact will be available as a parameter or return type. Using Object.assign() is being used for deserializing the serialized object in the example below.

```ts
import { Serializable, Deserializable } from '@comlink-serializer';
import { SerializedUser } from './types';

@Serializable
export default class User {
	constructor(readonly email: string, readonly firstName: string, readonly lastName: string) {}

	public deserialize(data: SerializedUser): User {
		return Object.assign(this, data);
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

It's worth noting that _deserialize_ is not a static method. We are operating inside a new instance of User and are assigning the contents of data and returning the new instance. If you are using Babel and legacy decorators please read the [Warning](#babel) carefully and avoid creating a new instance of a decorated class from within the same decorated class.

The serialized forms of your Serializable class must extend Serialized.

```ts
import { Serialized } from 'comlink-serializer';

export interface SerializedUser extends Serialized {
	email: string;
	firstName: string;
	lastName: string;
}
```

It is also possible to create a deep or nested structure of Serialized objects that all get deserialized. How this works is not sorcery, you are doing a lot of the light lifting, but this framework helps you implement your code in a consistent way, which is not only nice to your fellow developers but also might save the world.

Let's work from the above example for User and add an Address class. The Address class you'd create would also get the @Serializable decorator and implement _serialize()_ and _deserialize(...)_ in a similar way as User above, except we are using the second parameter to the deserialize method which is the Deserializer. The Deserializer handles making sure that deserialize method get's called on the Address instance with the serialized address data.

```ts
import { Serializable, Deserializer } from 'comlink-serializer';

@Serializable
export class User {
	constructor(
		readonly email: string,
		readonly firstName: string,
		readonly lastName: string,
		readonly address: Address
	) {}

	static deserialize(data: SerializedUser, deserializer: Deserializer): User {
		const address = deserializer.deserialize(data.address);
		return Object.assign(this, { ...data, address });
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

If the User object needs to contain an Array of Address objects we'd make the following updates.

```ts
@Serializable
export class User {
	constructor(
		readonly email: string,
		readonly firstName: string,
		readonly lastName: string,
		readonly addresses: Address[]
	) {}

	static deserialize(data: SerializedUser, deserializer: Deserializer): User {
		const addresses = data.addresses.map((address) => deserializer.deserialize(address));
		return Object.assign(this, { ...data, addresses });
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

### RegisterTransferHandler

Comlink supplies a feature called [Transfer Handlers](https://github.com/GoogleChromeLabs/comlink#transfer-handlers-and-event-listeners) which is what Comlink Serializer uses under the covers to assist in marshaling your objects between threads. Just like with Comlink where you **must** register your transfer handlers on both sides (eg. Main Thread and Worker Thread - I always think of Space Balls - 'There are two sides to every Schwartz'), you need to do the same with the Comlink Serializer Transfer Handler. This is because each thread has a dedicated Execution Context.

The supplied Transfer Handler takes the place of having to register any individual Comlink Transfer Handlers. That said, nothing prevents you from creating and registering a custom ComLink Transfer Handler if you need something outside the scope of Comlink Serializer.

**_Worker Thread_**

```ts
import * as Comlink from 'comlink';
import ComlinkSerializer, { TransferHandlerRegistration } from 'comlink-serializer';
import { User, Address } from './somewhere';

const handlerRegistration: TransferHandlerRegistration = { transferClasses: [User, Address] };

export default class MyWorker {
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
import { User, Address } from './somewhere';

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

You can read more about [Comlink.expose()](https://github.com/GoogleChromeLabs/comlink#comlinkwrapendpoint-and-comlinkexposevalue-endpoint) if you are just coming up to speed or need a refresher. _ComlinkSerializer.registerTransferHandler(...)_ does two things (currently), it creates the required Comlink Transfer Hander for the [@Serializable](#serializable) classes, and it takes a configuration that requires an Array of Serializable classes. If you forget to include a class, your application may work perfectly fine, but it also may not (you'll know the difference), so take care to make sure all Serializable classes are included. This is because decorators don't get processed unless the decorated class is actually in use.

> **Warning**
> It is possible if you are using transpiled or bundled code that [Tree Shaking](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking) may remove the references to the Serializable classes from the _TransferHandlerRegistration_. Please report this by opening an issue and giving sufficient detail to both describe and reproduce the circumstances.

---

## Available Data Structures

### SerializableArray & SerializableMap

Comlink Serializer currently supplies two data structures that can be serialized out of the box, SerializableArray and SerializableMap. To illustrate, let's build upon the example in the [@Serializable](Serializable) section where we created User, but let's assume you want to transfer an array of User objects from a Worker Thread.

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

From an architecture perspective, it may not be recommended to propagate _SerializableArray_ or _SerializableMap_ throughout the code. We've found it better to restrict the use of them to the thread boundaries. If you have an extremely large dataset and converting the Array or Map is a performance concern, _SerializableArray_ and _SerializableMap_ extend Array and Map respectively, and should function the same.

## Roadmap

- Create @Identity decorator that would be used to prevent the same object from being deserialized more than once
- Give the ability for automatic serialization/deserialization of simple objects
- Automatically identify nested objects to alleviate the need for passing a deserializer
- Support a lazy iterator in _SerializableArray_ so you can begin to process a large dataset without waiting for it to be completely serialized.

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
