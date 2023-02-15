import { h, Fragment } from 'preact';
import { Link } from 'react-router-dom';
import style from './style.css';

const Home = () => {
	return (
		<div class={style.home}>
			<h1>Available Test Suites</h1>
			<section>
				<Resource title="Performance Tests" description="Speed tests for diffrent operations" link="/perf" />
			</section>
		</div>
	);
};

interface ResourceProps {
	title: string;
	description: string;
	link: string;
}

const Resource = (props: ResourceProps) => {
	return (
		<div>
			<Link activeClassName={style.resource} to={props.link}>
				<h2>{props.title}</h2>
			</Link>
			<p>{props.description}</p>
		</div>
	);
};

export default Home;
