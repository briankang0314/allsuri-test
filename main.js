import { FillTheBody } from './app.js';
import { LoginByKakao } from './auth/auth.js';
import { KAKAO_APP_KEY } from './utils/constants.js';

document. addEventListener('DOMContentLoaded', async () => {
	if (window.matchMedia('(display-mode: standalone)').matches) {
		Kakao.init(KAKAO_APP_KEY);

		if (window.location.pathname === '/oauth/callback') { await LoginByKakao(); return; }

		if (Notification.permission != 'granted') { FillTheBody('notification'); return; }

		if (localStorage.getItem('user') == null || localStorage.getItem('tokens') == null) { await FillTheBody('login'); return; }

		await FillTheBody('home');
	} else {
		if (navigator.userAgent.toLowerCase().indexOf('kakao') >= 0) { 
			location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(location.href);
			return;
		}

		await FillTheBody('landing');
	}
})