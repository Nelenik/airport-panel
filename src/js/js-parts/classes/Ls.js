/*Утилита LS
 для работы с localStorage содержит методы get(принимает ключ), set(принимает ключ и сохраняемый элементы), remove(принимает ключ), change(принимает ключ и колбэк, в который передаем полученный из хранилища элемент, изменяем его как нужно внутри функции в зависимости от типа данных) */
export class LS {
	static get(key) {
		let saved = localStorage.getItem(key);
		if (saved) return JSON.parse(saved);
		else return false;
	}

	static set(key, item) {
		localStorage.setItem(key, JSON.stringify(item));
	}

	static change(key, func) {
		let saved = LS.get(key);
		func(saved);
		LS.set(key, saved);
	}

	static remove(key) {
		localStorage.removeItem(key);
	}
}
