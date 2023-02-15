import { h } from 'preact';
import style from './style.css';

const Header = () => (
	<header class={style.header}>
		<a href="/" class={style.logo}>
			<h1>Comlink Serializer Test App</h1>
		</a>
		<nav></nav>
	</header>
);

export default Header;
