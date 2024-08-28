self.addEventListener('push', (event) => {
	const ThePush = event.data.json().notification;
	event.waitUntil(
	  self.registration.showNotification(ThePush.title, {body: ThePush.body})
	);
  });