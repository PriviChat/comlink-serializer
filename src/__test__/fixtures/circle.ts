import { Serializable, Serialize } from '@comlink-serializer';
import { CircleClass } from './types';

@Serializable(CircleClass)
export default class Circle {
	readonly color: 'Red' | 'Green' | 'Blue';

	@Serialize()
	public circle: Circle;

	constructor(color: 'Red' | 'Green' | 'Blue') {
		this.circle = this;
		this.color = color;
	}

	public hashCode(): number {
		return -1;
	}

	public equals(other: unknown) {
		return false;
	}
}
