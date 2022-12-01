# Comlink Serializer

## Introduction

Comlink Serializer makes working with [Comlink](https://github.com/GoogleChromeLabs/comlink) even more enjoyable by providing a framework for the serialization and deserialization of your transfer objects. Your transfer objects come out on the Worker side with their prototypes intact. The framwork supports deep serialization, and comes with collection support for both Array and Map. There is no need to setup multiple tansfer handlers because Comlink Serializer handles that for you. If you are new to Comlink, it's a good idea to start reading that documentation first.

# comlink-serializer

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

## Install

```bash
npm i comlink-serializer
```

## Usage

- [Setup](#setup)
- [@Serializable](#serializable)
- [Comlink Integration](#comlink-integration)

### [Setup](#setup)

Comlink Serializer leverages [decorators](https://www.typescriptlang.org/docs/handbook/decorators.html) to enforce the Serialize and Deserialize methods in your class. Decorators are still an exparimental feature and as such, it is subject to change, but as far as I can tell has very good adoption and has been stable.

> **Note**
> The decorator feature must be enabled in your project. Below are some examples, but consult the documentation for your setup.

#### Command Line:

```bash
tsc --target ES5 --experimentalDecorators
```

### tsconfig.json:

```json
{
	"compilerOptions": {
		"target": "ES5",
		"experimentalDecorators": true
	}
}
```

If using [Babel](https://babeljs.io/docs/en/). More on Babel [Decorators](https://babel.dev/docs/en/babel-plugin-proposal-decorators).

### .babelrc

```bash
npm install --save-dev @babel/plugin-proposal-decorators
```

```json
{
	"plugins": [
		["@babel/plugin-proposal-decorators", { "legacy": true }],
		["@babel/plugin-proposal-class-properties", { "loose": true }]
	],
	"presets": ["@babel/preset-typescript"]
}
```

### [@Serializable](Serializable)

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

### [Comlink Integration](#comlink-integration)

> **Note**
> This document assumes a good understanding of how to work with Comlink. If you are new to Comlink, please do your homework.

Comlink supplies a feature called [Transfer Handlers](https://github.com/GoogleChromeLabs/comlink#transfer-handlers-and-event-listeners) which is what Comlink Serializer uses under the covers to assist in marshalling your objects between threads.

## API

### myPackage(input, options?)

#### input

Type: `string`

Lorem ipsum.

#### options

Type: `object`

##### postfix

Type: `string`
Default: `rainbows`

Lorem ipsum.

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
