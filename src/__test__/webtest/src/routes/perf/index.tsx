import { h, Fragment } from 'preact';
import PerfSuit from '../../components/perf';
import style from './style.css';

const Perf = () => {
	return (
		<div class={style.perf}>
			<h1>Performance Tests</h1>
			<PerfSuit />
		</div>
	);
};

export default Perf;
