import type * as Party from 'partykit/server';

export default class PostServer implements Party.Server {
	constructor(public room: Party.Room) {}

	onRequest(req: Party.Request): Response | Promise<Response> {
		console.log('Request received!', req);
		return new Response('OK');
	}

	async onConnect(conn: Party.Connection) {
		console.log('Connection opened!', conn);
		conn.send('Hello from the server!');
		await this.updateCounter();
	}

	async onClose() {
		await this.updateCounter();
	}

	async updateCounter() {
		const count = [...this.room.getConnections()].length;
		await this.room.context.parties.telemetry.get('central').fetch({
			method: 'POST',
			body: JSON.stringify({
				postId: this.room.id + process.env.NODE_ENV === 'production' ? '' : '-dev',
				count,
				action: 'update',
			}),
		});
	}
}
