import { handleRequest } from './handler.js';

addEventListener('fetch', (event) => {
	event.respondWith(handleRequest(event.request));
});
