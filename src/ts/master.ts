import Swiper from 'swiper';
import {Navigation, Pagination} from 'swiper/modules';
import Lazy from 'vanilla-lazyload';
import * as M from 'materialize-css';

declare var ymaps:any;
let isScrollingLeft:boolean;
let isScrollingRight:boolean;

(() => {
	const newsSwiper = document.querySelectorAll('#news-swiper').length > 0 ? new Swiper('#news-swiper', {
		modules: [Navigation, Pagination],
		spaceBetween: 25,
		navigation: {
			nextEl: '.next',
			prevEl: '.prev',
		},
		pagination: {
			el: '.swiper-pagination',
			type: 'bullets',
			clickable: true
		},
		breakpoints: {
			300: {
				slidesPerView: 1,
			},
			800: {
				slidesPerView: 2
			},
			1400: {
				slidesPerView: 3
			},
			2000: {
				slidesPerView: 4
			}
		}
	}) : null;

	new Lazy(null, document.querySelectorAll('.lazy'));
	M.Sidenav.init(document.querySelectorAll('.sidenav'), {
		edge: 'right'
	});

	document.querySelector('.spec-prev')?.addEventListener('touchstart', scrollSpecLeft);
	document.querySelector('.spec-prev')?.addEventListener('mousedown', scrollSpecLeft);

	document.querySelector('.members')?.addEventListener('mouseenter', clearActive);

	document.querySelector('.spec-prev')?.addEventListener('touchend', stopScroll);
	document.querySelector('.spec-prev')?.addEventListener('mouseup', stopScroll);

	document.querySelector('.spec-next')?.addEventListener('touchstart', scrollSpecRight);
	document.querySelector('.spec-next')?.addEventListener('mousedown', scrollSpecRight);

	document.querySelector('.spec-next')?.addEventListener('touchend', stopScroll);
	document.querySelector('.spec-next')?.addEventListener('mouseup', stopScroll);

	document.querySelectorAll('#ymap').length && initMap();
	document.querySelectorAll('#countdown').length && initCounter();

	document.querySelectorAll('.modal-trigger').forEach(el => el.addEventListener('click', openModal));
	document.querySelectorAll('.closer').forEach(el => el.addEventListener('click', closeModal));
	document.querySelectorAll('.modal-wrapper').forEach(el => el.addEventListener('click', closeModal));

	document.querySelectorAll('.scroll-link').forEach(el => el.addEventListener('click', scrollTo));

	renderTracks();

})();

function clearActive(){
	document.querySelector('.members')?.classList.remove('animated');
	document.querySelectorAll('.members').forEach(el => {
		(el as HTMLElement).classList.remove('active');
	})
}

function scrollTo(e:MouseEvent){
	e.preventDefault();
	const el = e.currentTarget as HTMLLinkElement;
	const hash = new URL(el.href).hash;
	const top = (document.querySelector(hash) as HTMLElement).offsetTop;

	const sidenav = M.Sidenav.getInstance(document.querySelector('.sidenav'));
	
	sidenav.close();

	document.documentElement.scrollTop = top;
}

function closeModal(e:MouseEvent){

	e.preventDefault();
	document.body.classList.remove('modal-opened');
	const el = e.currentTarget as HTMLElement;

	if(el.classList.contains('closer')){

		// Если клик по кнопке с крестиком
		const modal = parents(el, 'modal-wrapper');
		modal?.classList.remove('open');
	}else{

		// Если клик по полю мимо модального окна
		const path = e.composedPath();

		const filtered = path.filter(el => {
			const classlist = (el as HTMLElement).classList;

			if(classlist){
				return classlist.contains('modal')
			}
		});

		if(filtered.length == 0){
			el.classList.remove('open');
		}
	}
}

function parents(el:HTMLElement, className: string){
	const parent = el.parentElement;
	if(parent?.classList.contains(className)){
		return parent;
	}else{
		if(parent != null){
			return parents(parent, className)
		}else{
			return null;
		}
	}
}

function openModal(e:MouseEvent){
	e.preventDefault;
	const el = e.currentTarget as HTMLLinkElement;
	const hash = new URL(el.href).hash;
	document.body.classList.add('modal-opened');

	const modal = document.querySelector(hash) as HTMLElement;
	modal.classList.add('open');
}

function renderTracks(){
	const tracks = document.querySelector('.specialties-wrapper .scroll-wrapper');

	if(isScrollingRight){
		tracks.scrollLeft += 20;
	}

	if(isScrollingLeft){
		tracks.scrollLeft -= 20;
	}

	requestAnimationFrame(renderTracks);
}

function stopScroll(e:Event){
	e.preventDefault();
	isScrollingLeft = false;
	isScrollingRight = false;
}

function scrollSpecLeft(e:Event){
	e.preventDefault();
	isScrollingLeft = true;
}

function scrollSpecRight(e:Event){
	e.preventDefault();
	isScrollingRight = true;
}

function initCounter()
{
	let currentDate = new Date(); // Текущая дата
	let endDate = new Date("May 13, 2025 16:00"); // Целевая дата

	// Расчитываем разницу между текущей и целевой датой
	var timeDiff = (endDate.getTime() - currentDate.getTime());

	if(timeDiff <= 0){
		// Скрываем счётчик, и отображаем уведомление о том, что приём начался
		$('.counter').hide();
	}

	// Вычисляем количество дней, часов, минут и секунд до достижения цели
	var days = Math.floor(timeDiff / (1000 * 3600 * 24));
	var hours = Math.floor((timeDiff % (1000 * 3600 * 24)) / (1000 * 3600));
	var minutes = Math.floor((timeDiff % (1000 * 3600)) / 60000);
	var seconds = Math.floor((timeDiff % 60000) / 1000);

	let daysEl = <HTMLElement>document.querySelector('#ds');
	let hoursEl = <HTMLElement>document.querySelector('#hr');
	let minutesEl = <HTMLElement>document.querySelector('#mn');
	let secondsEl = <HTMLElement>document.querySelector('#sc');

	daysEl.textContent = addZero(days);
	hoursEl.textContent = addZero(hours);
	minutesEl.textContent = addZero(minutes);
	secondsEl.textContent = addZero(seconds);

	requestAnimationFrame(initCounter);
}

function addZero(n: number): string {
	return n > 9 ? "" + n : "0" + n;
}

function loadScript(url: string, callback: () => any) {
	let script = document.createElement("script");
	script.type = "text/javascript";
	script.src = url;
	script.onload = callback;
	document.body.appendChild(script);

	if ((script as any).readyState) {
		//IE
		(script as any).onreadystatechange = function () {
			if (
				(script as any).readyState === "loaded" ||
				(script as any).readyState === "complete"
			) {
				(script as any).onreadystatechange = null;
				callback();
			}
		};
	} else {
		script.onload = callback;
	}

	script.src = url;
	document.getElementsByTagName("head")[0].appendChild(script);
}

function initMap()
{
	loadScript('https://api-maps.yandex.ru/2.1/?lang=ru_RU', () => {

		const map = document.querySelector('#ymap') as HTMLElement;

		if(map){

			let lat = map.dataset['lat'];
			let lon = map.dataset['lon'];
			let zoom = map.dataset['zoom'];
			let link = map.dataset['link'];

			if(!lat || !lon || !zoom || !link){
				return;
			}

			ymaps.ready(() => {
				const map = new ymaps.Map('ymap', {
					center: [lat, lon],
					zoom: zoom
				});

				let marker = new ymaps.Placemark([lat, lon], {
					balloonOffset: [0, -70]
				});
				marker.options.set('iconLayout', 'default#image');
				marker.options.set('iconImageHref', './finkred-2025/img/map-marker.svg')
				marker.options.set('iconImageSize', [50, 50]);
				marker.options.set('iconImageOffset', [-25, -50]);
				let balloonText = `2022 ФГБОУ ВО «Кубанский Государственный Аграрный Университет имени И.Т. Трубилина»; 350044, Россия, г. Краснодар, ул. Калинина, 13 <br /> <a href="${link}" target="_blank" rel="nofollow">Открыть в Яндекс-картах</a>`;

				marker.events.add('click', () => {
					map.balloon.open([lat, lon], balloonText, {
						offset: [0, -60]
					})
				})

				map.balloon.open([lat, lon], balloonText, {
					offset: [0, -60]
				})

				map.geoObjects.add(marker);

				map.behaviors.disable('scrollZoom');

			})
		}

	})
}