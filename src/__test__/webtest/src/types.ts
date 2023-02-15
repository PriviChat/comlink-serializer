import * as Comlink from 'comlink';

export type WorkerConstructor<T> = new (...input: any[]) => Promise<Comlink.Remote<T>>;
export type WorkerFacade<T> = Comlink.Remote<WorkerConstructor<T>>;
