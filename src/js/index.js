import '../index.html';
import '../scss/index.scss';
import Navigo from 'navigo';
import { el, setChildren, mount } from 'redom';
import { LS } from './js-parts/classes/Ls';

const dataArr = [];

const router = new Navigo('/');
const container = el('div.container.page-container');
mount(document.getElementById('page'), container);
function createLink(isAdmin = false) {
	return isAdmin
		? el('a.nav-link.link-reset', { href: '/', 'data-navigo': '' }, 'Главная')
		: el(
				'a.nav-link.link-reset',
				{ href: '/admin', 'data-navigo': '' },
				'Панель администратора'
		  );
}

router.on('/', () => {
	setChildren(container, createLink());
	console.log('hello');
});
router.on('/admin', () => {
	setChildren(container, createLink(true));
	console.log('admin page');
});
router.resolve();
