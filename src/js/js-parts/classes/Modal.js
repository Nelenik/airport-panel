export function ModalConstructor(triggerSelectorOrEl, userOptions) {
	this.core = {
		main() {
			let defaults = {
				autoOpen: false,
				isStatic: false,
				modalInner: null,
				enableTransition: true,
				animTime: null,
				easing: 'ease',
				elemToFocus: null,
				// classes
				modalCloseBtnClass: null,
				modalOverlayClass: 'modal-overlay',
				modalWrapperClass: 'modal-wrapper',
				modalOpenClass: 'modal-open',
				ariaLabelledbyId: '',
				beforeOpen: () => {},
				afterOpen: () => {},
				beforeClose: () => {},
				afterClose: () => {},
			};
			this.options = Object.assign(defaults, userOptions);
			this.isStatic = this.options.isStatic;
			this.animTime = this.options.animTime;
			const isString = typeof triggerSelectorOrEl === 'string';
			this.triggerBtn = isString
				? document.querySelector(triggerSelectorOrEl)
				: triggerSelectorOrEl;
			this.isOpen = false;
			this.modalEl;
			this.lastFocusedOutOfModal;
			this.focusableElems;
			this.manageModal();
		},

		manageModal() {
			if (this.options.autoOpen) {
				document.addEventListener('click', this.openByClick.bind(this));
			}
		},

		createHtml(options) {
			const tag = document.createElement(options.tagName);
			if (options.classes) tag.classList.add(...options.classes);
			if (options.attributes) {
				for (let key in options.attributes) {
					tag.setAttribute(key, options.attributes[key]);
				}
			}
			if (options.text) tag.textContent = options.text;
			if (options.inner) tag.innerHTML = options.inner;
			return tag;
		},
		createModalOverlay() {
			const { modalOverlayClass } = this.options;
			const overlay = this.createHtml({
				tagName: 'div',
				classes: [modalOverlayClass],
			});
			overlay.append(this.createModalWrapper());
			document.body.append(overlay);
			return overlay;
		},

		createModalWrapper() {
			const { ariaLabelledbyId, modalInner, modalWrapperClass } = this.options;
			if (!modalInner) return;
			let isObject = typeof modalInner === 'object';
			const wrapper = this.createHtml({
				tagName: 'div',
				classes: [modalWrapperClass],
				attributes: {
					tabindex: '0',
					role: 'dialog',
					'aria-labelledby': `${ariaLabelledbyId}`,
				},
			});
			isObject ? wrapper.append(modalInner) : (wrapper.innerHTML = modalInner);
			return wrapper;
		},

		openModal() {
			const { modalOpenClass } = this.options;
			if (this.isStatic) {
				this.modalEl = document.querySelector(
					`[data-modal="${this.triggerBtn.dataset.path}"]`
				);
			} else this.modalEl = this.createModalOverlay();

			this.isOpen = true;
			this.modalEl.dispatchEvent(
				new CustomEvent('modalOnOpen', {
					bubbles: true,
					cancelable: true,
					detail: { isOpen: this.isOpen },
				})
			);

			this.lastFocusedOutOfModal = document.activeElement;
			this.focusableElems = this.recieveFocusableElems(this.modalEl);

			setTimeout(() => {
				this.modalEl.classList.add(modalOpenClass);
				this.setTransition();
			}, 0);

			setTimeout(() => {
				this.setFocus();
				this.catchFocus();
			}, this.animTime);
			document.addEventListener('click', this.closeByClick.bind(this));
			document.addEventListener('keyup', this.closeByEsc.bind(this));
		},

		closeModal() {
			const { modalOpenClass } = this.options;
			this.isOpen = false;
			this.modalEl.dispatchEvent(
				new CustomEvent('modalOnClose', {
					bubbles: true,
					cancelable: true,
					detail: { isOpen: this.isOpen },
				})
			);
			this.modalEl.classList.remove(modalOpenClass);
			this.setFocus();
			this.manageScroll();
			if (!this.isStatic)
				setTimeout(() => {
					this.modalEl.remove();
				}, this.animTime);
		},

		setTransition() {
			const { enableTransition, easing } = this.options;
			if (!enableTransition) return;
			this.modalEl.style.transition = `all ${this.animTime / 1000}s ${easing}`;
		},

		manageScroll() {
			let body = document.body;
			let scrollWidth = window.innerWidth - body.offsetWidth + 'px';
			let fixedEl = document.querySelectorAll('.fixed-el');
			if (this.isOpen) {
				body.style.overflow = 'hidden';
				body.style.paddingRight = scrollWidth;
				fixedEl.forEach((el) => {
					el.style.paddingRight = scrollWidth;
				});
			} else {
				body.style.overflow = 'auto';
				body.style.paddingRight = '';
				fixedEl.forEach((el) => {
					el.style.paddingRight = '';
				});
			}
		},

		recieveFocusableElems(el) {
			let focusableElementsString =
				'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable]';
			let elemsArray = [...el.querySelectorAll(focusableElementsString)];
			let result = elemsArray.filter(
				(i) =>
					!i.hasAttribute('tabindex') ||
					(i.hasAttribute('tabindex') && i.getAttribute('tabindex') >= 0)
			);
			result = result.length > 0 ? result : false;
			return result;
		},

		setFocus() {
			let { elemToFocus } = this.options;

			if (this.isOpen && elemToFocus) {
				let toFocus = this.modalEl.querySelector(elemToFocus);
				if (!toFocus) return;
				toFocus.focus();
			} else if (this.isOpen && this.focusableElems) {
				this.focusableElems[0].focus();
			} else this.lastFocusedOutOfModal.focus();
		},

		catchFocus() {
			let focArr = this.focusableElems;
			let firstFocused = focArr[0];
			let lastFocused = focArr[focArr.length - 1];
			this.modalEl.addEventListener(
				'keydown',
				function (e) {
					if (
						e.code == 'Tab' &&
						e.shiftKey &&
						document.activeElement == firstFocused
					) {
						e.preventDefault();
						lastFocused.focus();
					}
					if (e.code == 'Tab' && document.activeElement == lastFocused) {
						e.preventDefault();
						firstFocused.focus();
					}
				}.bind(this)
			);
		},

		// handlers
		openByClick(e) {
			const { autoOpen } = this.options;
			if (autoOpen && e.target === this.triggerBtn) {
				this.options.beforeOpen(e);
				this.openModal();
				this.manageScroll();
				this.options.afterOpen(e);
			}
		},
		closeByClick(e) {
			const { modalCloseBtnClass, modalOverlayClass, modalWrapperClass } =
				this.options;
			if (
				this.isOpen &&
				(e.target.closest(`.${modalCloseBtnClass}`) ||
					(!e.target.closest(`.${modalWrapperClass}`) &&
						e.target.matches(`.${modalOverlayClass}`)))
			) {
				this.options.beforeClose(e);
				this.closeModal();
				this.options.afterClose(e);
			}
		},
		closeByEsc(e) {
			if (this.isOpen && e.code == 'Escape') {
				this.options.beforeClose(e);
				this.closeModal();
				this.options.afterClose(e);
			}
		},
	};
	this.updateInner = (inner) => {
		if (inner) {
			this.core.options.modalInner = inner;
		}
	};
	this.open = () => {
		this.core.openModal();
		this.core.manageScroll();
	};
	this.close = () => {
		this.core.closeModal();
	};
	this.core.main();
}

// Initialization:
//   let modal = new ModalConstructor(triggerSelectorOrEl, options)
//   По умолчанию открытие окна нужно настроить принудительно методом modal.open(). Если нужно, чтобы окно автоматически открывалось при клике на триггер(например содержимое известно и не будет меняться, или на триггере кроме открытия нет других действий), то нужно добавить настройку autoOpen: true;

//   - triggerSelectorOrEl - string, селектор или элемент по клику на который открывается окно. (Если окно статическое(скрыто в разметке), то для триггера добавляем - data-path =
//   "value", для контента - data-modal="value");
//   -options = объект с настройками.

// Options:
//   -- autoOpen: (boolean, default=false) указываем должно ли окно открываться автоматически плагином. По умолчанию false,  для октытия окна нужно воспользоваться методом modal.open()
//   -- isStatic: (boolean, default=false) указываем статичное или динамичное модальное окно;
//   -- modalInner: (html/el, default = null), контент модального окна при динамическом создании.(конструктор создает оверлей и обертку контента, кнопку закрытия и сам контент можно добавить в этой настройке);
//   -- enableTransition: (boolean, default = true) если true настраивается transition для появления окна. Если false можно настроить анимацию с помощью библиотеки (например GreenSock) В случае сторонней анимации для динамического окна обязательно нужно указать animTime, который будет задержкой при удалении из DOM(значение нужно согласовать со временем анимации библиотеки)
//   -- animTime: (ms, default=null) время анимации. Этот параметр нужно указывать при настройке анимации с помощью библиотеки, т.к. он также является задержкой удаления модалки из DOM
//   -- easing: (string, default = 'ease') название easing-функции для transition
//   -- elemToFocus: (string, default=null) передаем селектор элемента, который должен быть в фокусе при открытии модального окна.Если не задано фокус устанавливается первому фокусируемому элементу в модалке
//   //классы
//   -- modalCloseBtnClass: (string, default-null) класс кнопки закрытия(если есть)(для динамических окон ее также нужно создать самостоятельно)
//   -- modalOverlayClass: (string, default="modal-overlay"),класс оверлея, дефолтный класс добавляется при динамическом создании, для статических окон нужно передать соответствующие классы
//   -- modalWrapperClass: (string, default="modal-wrapper"), класс обертки контента
//   -- modalOpenClass: (string, default="modal-open"), класс активного класса
//   -- ariaLabelledbyId: (string, default = ''), можно указать id элемента, который опишет назначение модального окна, например заголовка.
//   -- beforeOpen: (event)=> {}, функция добавляется к обработчику открытия модалки, до ее открытия. В качестве аргумента принимает объект события. работает только с autoOpen: true;
//   -- afterOpen: (event)=> {}, функция добавляется к обработчику открытия модалки, после ее открытия. В качестве аргумента принимает объект события. работает только с autoOpen: true;
//   -- beforeClose: (event)=> {}, функция добавляется к обработчику закрытия модалки, до ее закрытия. В качестве аргумента принимает объект события. Если модалка закрывается методом modal.close() и при этом обработчики плагина остановлены с помощью e.preventDefault(), то не сработает
//   -- afterClose: (event) => {}, функция добавляется к обработчику закрытия модалки, после ее закрытия. В качестве аргумента принимает объект события. Если модалка закрывается методом modal.close() и при этом обработчики плагина остановлены с помощью e.preventDefault(), то не сработает

// Методы:
//   ? требует доработки --modal.updateInner(html-string/el) - можно заменить/добавить контент динамической модалки, в момент клика по триггеру

//   --modal.open() - открывает модалку

//   --modal.close() - закрывает модалку

// События:
// Позволяют сделать что то с окном в момент открытия/закрытия (например анимацию). события всплывают, можно отловить на document, e.target = модальное окно
//   --modalOnOpen
//   --modalOnClose

// Примерный html для статичного окна:
//   <button class="trigger" type="button" data-path="1">open </button>
//   <div class="overlay" data-modal="1">
//     <div class="content-wrapper" >
//       <button class="close-btn" type="button">close</button>
//   </div>
//   </div>

// Примечания:
// ! если окно динамическое, то при создании его содержимого, нужно учесть кнопку закрытия если она нужна и передать ее класс в modalCloseBtnClass. по дефолту окно без кнопки.

// !! если в документе есть элементы с position: fixed, то им нужно назначить доп класс "fixed-el". Это нужно чтобы убрать "прыжок" контента при открытии модалки и блокировки скролла.

// !!! если в прокете не используется normalize.css необходимо обнулить дефолтные margin у body, если этого не сделать некорректно считается ширина скроллбара и сохраняется "прыжок" контента.

// !!!! при открытии окна фокус будет сосредоточен на первом фокусируемом в разметке элементе (для динамического окна это обертка контента) чтобы назначить фокус на желаемый элемент нужно передать соответствующий селектор в elemToFocus.
