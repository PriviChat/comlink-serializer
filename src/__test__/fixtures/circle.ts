import { Revivable, Serializable, Serialize } from '@comlink-serializer';
import { CircleClass, SerializedCircle } from './types';

@Serializable(CircleClass)
export default class Circle implements Serializable<SerializedCircle>, Revivable<SerializedCircle> {
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
