/**
 * This route is responsible for PATCH requests to update a story.
 * The storyId is passed as a parameter in the URL, and any updates are passed in the request body.
 * A 200 OK response indicates updates were successful.
 */

import { ActionFunction, json } from '@remix-run/node';
import { prisma } from '../../prisma/db.server';
import { commitSession, validateRequestAndReturnSession } from '~/auth/utils.server';
import { redirect, useFetcher } from '@remix-run/react';

export const action: ActionFunction = async ({ request, params }) => {
	const session = await validateRequestAndReturnSession(request);
	if (!session) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}
	const { storyId } = params;
	const storyAuthorRecord = await prisma.storyAuthor.findUnique({
		where: {
			storyId_userId: {
				storyId: Number(storyId),
				userId: session.get('userId') as number,
			},
		},
	});
	// currently logged in user is not an author of the story
	if (!storyAuthorRecord) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	if (request.method === 'DELETE') {
		try {
			await prisma.story.delete({
				where: {
					id: Number(storyId),
				},
			});
			return redirect('/home?deletion=success');
		} catch (e) {
			if (e instanceof Error) {
				return json({ message: e.message ?? 'Something went wrong.' }, { status: 500 });
			}
		}
	} else {
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
						publishedAt: updates.isPublished === 'true' ? new Date() : null,
					}),
					...(updates.wordCount && { wordCount: Number(updates.wordCount) }),
				},
			});
			return json(200);
		} catch (e) {
			if (e instanceof Error) {
				return json({ message: e.message ?? 'Something went wrong.' }, { status: 500 });
			}
		}
	}
};

export function useUpdateFetcher() {
	return useFetcher({ key: 'update' });
}

export function useDeleteFetcher() {
	return useFetcher({ key: 'delete' });
}
