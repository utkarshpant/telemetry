import type * as Party from 'partykit/server';

type CountUpdate = { postId: string; count: number; action: 'update' };
type Query = { storyIds: string[]; action: 'query' };

export default class PostCounterServer implements Party.Server {
	counts = new Map<string, number>();

	constructor(public room: Party.Room) {}

	async onRequest(req: Party.Request) {
		// update requests to update counts for a post
		const request = await req.json<CountUpdate | Query>();
        if (request.action === 'update') {
			this.counts.set(request.postId, request.count);

			// tell each connected telemetry client that counts have changed
			// Object with keys and values from map
			const counts = Object.fromEntries(this.counts);
			this.room.broadcast(JSON.stringify(counts));
		}
		if (request.action === 'query') {
			const counts: Record<string, number> = {};
            request.storyIds.forEach((storyId) => {
                counts[storyId] = this.counts.get(String(storyId)) || 0;
            });
            return new Response(JSON.stringify(counts), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            });
		}
		return new Response('Invalid request', { status: 400 });
	}
}
