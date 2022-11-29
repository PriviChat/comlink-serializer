export interface Serialized {
	_SCLASS?: string;
}

export type Serializer<S> = (data: Omit<S, '_SCLASS'>) => S;
