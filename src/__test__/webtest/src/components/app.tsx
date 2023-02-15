import 'reflect-metadata';
import * as Comlink from 'comlink';
import ComlinkSerializer from 'comlink-serializer';
import { h } from 'preact';
import { createBrowserRouter, createRoutesFromElements, Outlet, Route, RouterProvider, Routes } from 'react-router-dom';
import { StyledEngineProvider } from '@mui/material/styles';

import Header from './header';

// Code-splitting is automated for `routes` directory
import Home from '../routes/home';
import Perf from '../routes/perf';

import { WorkerFacade } from '../types';
import hardWorkerLoader from 'worker-loader!../worker/hard.worker';
import HardWorker from '../worker/hard.worker';
import ArrayIteratorTest from './perf/array-iterator-test';
import User from '../dto/user';
import Order from '../dto/order';
import Address from '../dto/address';
import Product from '../dto/product';

// Webpack 5 syntax
//const worker = new Worker(
//	/* webpackChunkName: "hard-worker" */ new URL('../../worker/hard.worker.ts', import.meta.url)
//);

ComlinkSerializer.registerTransferHandler({ transferClasses: [User, Order, Address, Product] });

const workerLoader = (() => {
	let hardWorker: Comlink.Remote<HardWorker> | undefined;

	return {
		// public interface
		loadHardWorker: async () => {
			if (!hardWorker) {
				console.info('Loading Hard Worker....');
				const comlinkFacade = Comlink.wrap(new hardWorkerLoader()) as WorkerFacade<HardWorker>;
				hardWorker = await new comlinkFacade();
				if (!hardWorker) throw new Error('Unable to load Hard Worker!');
				console.info('Hard Worker Loaded');
			}
			return hardWorker;
		},
	};
})();

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path="/">
			<Route index element={<Home />} />
			<Route id="pref" path="/perf/*" element={<Perf />}>
				<Route path="array-iterator" element={<ArrayIteratorTest />} loader={workerLoader.loadHardWorker} />
			</Route>
		</Route>
	)
);

const App = () => (
	<div id="app">
		<StyledEngineProvider injectFirst>
			<main>
				<Header />
				<RouterProvider router={router} />
			</main>
		</StyledEngineProvider>
	</div>
);

export default App;
