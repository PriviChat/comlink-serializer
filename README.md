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
  - [Getting Started](#getting-started)
    - [Install](#install)
    - [Setup](#setup)
      - [TypeScript](#typescript)
      - [Babel](#babel)
  - [Usage](#usage)
    - [@Serializable](#serializable)
      - [hashCode()](#hashcode)
      - [equals()](#equals)
    - [@Serialize](#serialize)
    - [Serializable](#serializable-1)
    - [Revivable](#revivable)
    - [toSerial()](#toserial)
    - [toSerialProxy()](#toserialproxy)
    - [toSerialIterable()](#toserialiterable)
    - [Example Serializable Classes](#example-serializable-classes)
  - [Comlink Integration](#comlink-integration)
    - [RegisterTransferHandler](#registertransferhandler)
  - [License](#license)

<br/>

---

<br/>

## Introduction

Comlink Serializer makes working with [Comlink](https://github.com/GoogleChromeLabs/comlink) even more enjoyable by providing a framework for the serialization and reviving of your transfer objects. Your objects come out on the Worker side with their prototypes intact.

The framework supports deep serialization, handles circular references, and allows you to indicate that a property value should be sent as a proxy. If you send an Array or Map object as a proxy and it will send the entries using an `AsyncIterableIterator`, meaning you don't need to wait for the whole collection to transfer before you start processing entries. If you send a basic object as a proxy, any function calls or property changes automatically get reflected in the main thread.

There is no need for multiple transfer handlers because Comlink Serializer handles that for you. If you are new to Comlink, it's a good idea to start reading that documentation first.

> **Warning**
> While we have a lot of unit tests in place and feel comfortable that the library is working as expected, we need to see how it performs in the wild.
> <br/>
> The following still needs to be implemented:
>
> - Stress Testing - Making sure allocated objects are getting garage collected and memory usage is stable
> - Performance Testing - Figure out how fast (or slow) the processing is with very large datasets
> - Unit Testing - We have many but can always use more
>
> Contact me if you are interested in helping out!

<br/>

---

<br/>

## Getting Started

### Install

Using npm:

```bash
npm i comlink comlink-serializer reflect-metadata
```

### Setup

Comlink Serializer leverages [decorators](https://www.typescriptlang.org/docs/handbook/decorators.html) to enable the serialization and reviving of your class objects. Decorators are still an experimental feature and as such, it is subject to change, but as far as I can tell has significant developer adoption. Compatibility issues do exist if you are using tools like Babel to transpile your source code and dependencies.

> **Note**
> The `experimentalDecorators` feature must be enabled along with setting `emitDecoratorMetadata` to true in your project. Below are some examples, but consult the documentation for your setup.

#### TypeScript

**_Command Line:_**

```bash
tsc --target ES5 --experimentalDecorators --emitDecoratorMetadata
```

**_tsconfig.json:_**

```json
{
	"compilerOptions": {
		"target": "ES5",
		"experimentalDecorators": true,
		"emitDecoratorMetadata": true
	}
}
```

#### Babel

If you're using [Babel](https://babeljs.io/docs/en/). More on Babel [Decorators](https://babel.dev/docs/en/babel-plugin-proposal-decorators).

```bash
npm install --save-dev @babel/plugin-proposal-decorators
```

**_.babelrc:_**

```json
{
	{
  "plugins": [
    "babel-plugin-transform-typescript-metadata",
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", { "loose": true }],
  ],
  "presets": [
    "@babel/preset-typescript"
  ]
}
}
```

> **Note**
> You must `import reflect-metadata` at the entry point of your application.
>
> ```ts
> import 'reflect-metadata';
> ```

</br>

> **Warning**
> There is an open issue [12007](https://github.com/babel/babel/pull/12007) in Babel that prevents class decorators from getting applied when you attempt to instantiate a class from within itself. This is often done when using the singleton pattern or any type of static factory method. If you instantiate your class this way, the resulting object will not be wrapped by the @Serializable decorator and will fail to be properly serialized and revive. We have only experienced this when configuring the plugin-proposal-decorators with **version:"legacy"**. To work around this you can create a factory function outside your class that creates a new instance.

<br/>

---

<br/>

## Usage

### @Serializable

```ts
@Serializable(classToken: SerialClassToken)
```

The Serializable class decorator should be applied to any class you'd like to be transferred to a worker (or vice versa), and have the prototype maintained. You are only required to implement hashCode() and equals() to fulfill the interface contract.

The `classToken` argument is either a string or a symbol that uniquely identifies the class.

#### hashCode()

This library supplies a helper function `hashCd()` to generate a valid return value. The return value, a number must be between 0 and 4294967295 (inclusive). hashCode() is used in conjunction with equals() during serialization to identify the same object that may be of a different instance. Instance equality Object.is() is used first before falling back on hashCode and equals. The hashCode is derived by choosing one or more properties that uniquely identify a class instance, concatenating them and passing them into hashCd(). When using an object loaded from a database you may have a unique id field, or if the object represents a person, you may have a unique email field. Other times it's a combination of multiple fields that uniquely identify the object instance.

If you have no way to uniquely identify an object, return -1 from hashCode(). Doing so will bypass the equals check, so returning true or false will have no effect. This also means the serializer is only able to use instance equality to optimize serialization and reviving.

```ts
	public hashCode(): number {
		return hashCd(this._id);
	}
```

#### equals()

A hashCode is not guaranteed to be unique. When two objects have different hashCode, those objects won't be equal. When two objects have the same hashCode (collision), they are not guaranteed to be is equal, and equals() is used to test for equality. If -1 is returned from hashCode, equals will not be called.

```ts
	public equals(other: unknown) {
		return other instanceof MyClass && other._id === this._id;
	}
```

> **Note**
> It is often the case to use the same properties to generate the hashCode that you use for equality.

<br/>

---

<br/>

### @Serialize

```ts
@Serialize(settings?: SerialClassToken | SerializeSettings | boolean)
```

The Serialize decorator is used to identify Serializable properties, including basic Serializable properties, or more complex Array or Map of Serializable objects. All other class objects will not be serialized by the serializer and hence will lose their prototype. The Serialize decorator can only be used within a class decorated with @Serializable, and only on class properties.

> **Warning**
> Decorating class properties defined in the constructor is not yet supported.

To serialize a basic property of type User it is not necessary to pass any arguments to Serialize.

```ts
	@Serialize()
	readonly user: User;
```

To pass User as a proxy, pass true to Serialize.

```ts
	@Serialize(true)
	readonly user: User;
```

A Serializable object passed as a proxy means that any function calls or property modifications on the proxy will automatically be reflected on the corresponding object in the main thread.

To serialize a more complex property of type Product[], you would need to pass the same unique `classToken` that was passed to @Serializable when defining the Product class.

```ts
	@Serialize(ProductClass)
	readonly products: Product[];
```

To pass Product[] as a proxy, pass true to Serialize.

```ts
	@Serialize({ classToken: ProductClass, proxy: true })
	readonly products: Product[];
```

An Array or Map passed as a proxy causes the entries to be serialized one at a time as you iterate over the proxy in the worker. This means that you can begin processing each entry without waiting for the whole collection to be serialized.

A Serializable Map is Map containing primitive keys, 'boolean', 'number', 'bigint', 'string' with an entry that is Serializable.

<br/>

---

<br/>

### Serializable

Not to be confused with the decorator of the same name, Serializable is an interface you can choose to implement on your class that should allow the IDE to automatically add the method hooks that are called at different stages of the serialization process.

- `beforeSerialize?()` - called at the start of the object serialization process
- `serialize?(ctx: SerializeCtx)` - used to override the default serialization of the class. You would probably need to implement the `revive` hook if you make major changes
- `beforePropertySerialize?(prop: string)` - called before the property is serialized
- `afterSerialize?()` - called after the object has been serialized

<br/>

---

<br/>

### Revivable

Revivable is an interface you can choose to implement on your class that should allow the IDE to automatically add the method hooks that are called at different stages of the revive process.

- `revive?(serialObj: Object, ctx: ReviverCtx)` - override the default reviver
- `afterPropertyRevive?(prop: string, value: any)` - after the property is revived but before it is set on the object
- `afterRevive?()` - called after the object has been revived

<br/>

---

<br/>

### toSerial()

When you are working directly with an Array, Map or Iterator of Serializable objects and you want to pass it as a parameter to a worker or return it from a worker you need to wrap it in toSerial() to tell the underlining transfer handler and serializer to properly handle the object.

**_Worker Thread_**

```ts
import { toSerial } from '@comlink-serializer';

export default class OrderWorker {
	async getOrderUserAddresses(order: Order): Promise<Address[]> {
		//Address is a Serializable object
		const addresses = new Array<Address>();
		// await is needed to fetch the addressses iterator
		// both user and addresses proxies
		// you need to use the for-await syntax because the iterator is async
		for await (const address of await order.user.addresses) {
			addresses.push(address);
		}
		// toSerial allows an array of Serializable objects to be transfered back to the main thread
		return toSerial(addresses);
	}
}
```

<br/>

---

<br/>

### toSerialProxy()

When you are working with a Serializable object and you want to pass it as a proxy to a worker or return a proxy from a worker wrap the object in toSerialProxy().

**_Main Thread_**

```ts
import { toSerialProxy } from '@comlink-serializer';

// order is a Serializable object
const processOrder = async (order: Order) => {
	// assume orderWorker has been created and is accessable
	const processedOrder = await orderWorker.processOrder(toSerialProxy(order));
	return processedOrder;
};
```

<br/>

---

<br/>

### toSerialIterable()

When you are working directly with an Array, Map or Iterator of Serializable objects and you want to pass it as a proxy to a worker or return it from a worker you need to wrap it in toSerialIterable() to tell the underlining transfer handler and serializer to properly handle the object. The object received will be of type `AsyncIterableIterator` and you need to use the `for-await` syntax.

**_Main Thread_**

```ts
import { toSerialIterable } from '@comlink-serializer';

// orders is an Array Serializable objects
const processOrders = async (orders: Order[]) => {
	// assume orderWorker has been created and is accessable
	const processedOrders = await orderWorker.processOrders(toSerialIterable(orders));
	return processedOrders;
};
```

**_Worker Thread_**

```ts
export default class OrderWorker {
	async processOrders(orders: AsyncIterableIterator<Order>): Promise<Order[]> {
		// Order is a Serializable object
		const processedOrders = new Array<Order>();

		// you need to use a for-await because the iterator is async
		for await (const order of orders) {
			//do some processing
			processedOrders.push(order);
		}
		// toSerial allows an array of Serializable objects to be transfered back to the main thread
		return toSerial(processedOrders);
	}
}
```

<br/>

---

<br/>

### Example Serializable Classes

```ts
import { Serializable, hashCd } from '@comlink-serializer';
import { AddressClass } from './types';

@Serializable(AddressClass)
export default class Address {
	constructor(
		readonly id: string,
		readonly street: string,
		readonly city: string,
		readonly state: string,
		readonly zip: number
	) {}

	public hashCode(): number {
		return hashCd(this.id);
	}

	public equals(other: unknown) {
		return other instanceof Address && other.id === this.id;
	}
}
```

<br/>

When a `user` object is passed to a worker and revived, the `user` object and `priAddress` property will be copied, complete with the prototype. The `addresses` Array will be a proxy (not copied). When you iterate over `addresses`, for each iteration it will serialize and revive an entry.

```ts
import { Serializable, Serialize, Revivable, hashCd } from '@comlink-serializer';
import Address from './address';
import { AddressClass, SerializedUser, UserClass } from './types';

@Serializable(UserClass)
export default class User implements Serializable<SerializedUser>, Revivable<SerializedUser> {
	@Serialize()
	private priAddress: Address;
	@Serialize({ classToken: AddressClass, proxy: true })
	readonly addresses: Address[];

	constructor(
		readonly email: string,
		readonly firstName: string,
		readonly lastName: string,
		priAddress: Address,
		addresses: Address[],
		public totalOrders: number = 0
	) {
		this.priAddress = priAddress;
		this.addresses = addresses;
	}

	public setOrderTotal(total: number) {
		this.totalOrders = total;
	}

	public setPriAddress(address: Address) {
		this.priAddress = address;
	}

	public getPriAddress() {
		return this.priAddress;
	}

	public hashCode(): number {
		return hashCd(this.email);
	}

	public equals(other: unknown) {
		return other instanceof User && other.email === this.email;
	}
}
```

<br/>

---

<br/>

## Comlink Integration

> **Note**
> This document assumes a good understanding of how to work with Comlink. If you are new to Comlink, please do a little homework.

### RegisterTransferHandler

Comlink supplies a feature called [Transfer Handlers](https://github.com/GoogleChromeLabs/comlink#transfer-handlers-and-event-listeners) which is what Comlink Serializer uses under the covers to assist in marshaling your objects between threads. Just like with Comlink where you **must** register your transfer handlers on both sides (eg. Main Thread and Worker Thread - I always think of Space Balls - 'There are two sides to every Schwartz'), you need to do the same with the Comlink Serializer Transfer Handler. This is because each thread has a dedicated Execution Context.

The supplied Transfer Handler takes the place of having to register any individual Comlink Transfer Handlers. That said, nothing prevents you from creating and registering a custom ComLink Transfer Handler if you need something outside the scope of Comlink Serializer.

**_Worker Thread_**

```ts
import * as Comlink from 'comlink';
import ComlinkSerializer, { TransferHandlerRegistration, toSerial } from '@comlink-serializer';
import { User, Address } from './somewhere';

// don't forget to register your Serializable objects on both threads
const handlerRegistration: TransferHandlerRegistration = { transferClasses: [User, Address] };

export default class OrderWorker {
	async getOrderUserAddresses(order: Order): Promise<Address[]> {
		const addresses = new Array<Address>();
		// await is needed to fetch the addressses iterator
		// for-await is needed because its an async iterator
		// both user and addresses are proxies
		for await (const address of await order.user.addresses) {
			addresses.push(address);
		}
		// toSerial allows an array of Serializable objects to be transfered back to the main thread
		return toSerial(addresses);
	}
}
Comlink.expose(OrderWorker);
ComlinkSerializer.registerTransferHandler(handlerRegistration);
```

**_Main Thread_**

```ts
import * as Comlink from 'comlink';
import ComlinkSerializer, { TransferHandlerRegistration } from 'comlink-serializer';
import type { OrderWorker } from './path/to/your/worker';
import { User, Address } from './somewhere';

// don't forget to register your Serializable objects on both threads
const handlerRegistration: TransferHandlerRegistration = { transferClasses: [User, Address] };

// helper types for comlink
type WorkerConstructor<T> = new (...input: any[]) => Promise<Comlink.Remote<T>>;
type WorkerFacade<T> = Comlink.Remote<WorkerConstructor<T>>;

// order is a Serializable object
const getOrderUserAddersses = async (order: Order) => {
	const worker = new Worker('./path/to/your/worker.js');
	const comlinkWorker = Comlink.wrap(worker) as WorkerFacade<OrderWorker>;
	const orderWorker = await new comlinkWorker();
	const addresses = await orderWorker.getOrderUserAddresses(order);
	// do something with address
};

ComlinkSerializer.registerTransferHandler(handlerRegistration);
```

You can read more about [Comlink.expose()](https://github.com/GoogleChromeLabs/comlink#comlinkwrapendpoint-and-comlinkexposevalue-endpoint) if you are just coming up to speed or need a refresher. _ComlinkSerializer.registerTransferHandler(...)_ does two things (currently), it creates the required Comlink Transfer Hander for the [@Serializable](#serializable) classes, and it takes a configuration that requires an Array of Serializable classes. If you forget to include a class, your application may work perfectly fine, but it also may not (you'll know the difference), so take care to make sure all Serializable classes are included. This is because decorators don't get processed unless the decorated class is actually in use.

> **Warning**
> It is possible if you are using transpiled or bundled code that [Tree Shaking](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking) may remove the references to the Serializable classes from the _TransferHandlerRegistration_. Please report this by opening an issue and giving sufficient detail to both describe and reproduce the circumstances.

<br/>

---

<br/>

## License

MIT License

Copyright (c) 2023 PriviChat Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

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
