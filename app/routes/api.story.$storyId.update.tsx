/**
 * This route is responsible for PATCH requests to update a story.
 * The storyId is passed as a parameter in the URL, and any updates are passed in the request body.
 * A 200 OK response indicates updates were successful.
 */

import { ActionFunction, json } from '@remix-run/node';
import { prisma } from '../../prisma/db.server';
import { validateRequestAndReturnSession } from '~/auth/utils.server';

export const action: ActionFunction = async ({ request, params }) => {
	const session = await validateRequestAndReturnSession(request);
	if (!session) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}
	const { storyId } = params;
	const updates = Object.fromEntries((await request.formData()).entries());
	try {
		await prisma.story.update({
			where: {
				id: Number(storyId),
				authors: {
					some: {
						userId: session.get('userId'),
					},
				},
			},
			data: {
				...(updates.title && { title: updates.title as string }),
				...(updates.content && { content: updates.content as string }),
				...(updates.subtitle && { subtitle: updates.subtitle as string }),
				...(updates.isPublished && {
					isPublished: updates.isPublished === 'true',
					publishedAt: new Date(),
				}),
				...(!updates.isPublished && { publishedAt: null }), // when unpublished, reset the publishedAt field
			},
		});
		return json(200);
	} catch (e) {
		if (e instanceof Error) {
			return json({ message: e.message ?? 'Something went wrong.' }, { status: 500 });
		}
	}
};
