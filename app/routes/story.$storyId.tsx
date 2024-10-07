/* eslint-disable no-mixed-spaces-and-tabs */
import { validateRequestAndReturnSession } from '~/auth/utils.server';
import { prisma } from 'prisma/db.server';
import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { type Story } from '@prisma/client';
import EditableTitle from '~/components/EditableTitle';

type LoaderData =
	| {
			story: Story;
			allowEdits: boolean;
	  }
	| {
			message: string;
	  };

export const loader: LoaderFunction = async ({ request, params }) => {
	const session = await validateRequestAndReturnSession(request);
	const { storyId } = params;
	const story = await prisma.story.findUnique({
		where: {
			id: Number(storyId),
		},
		include: {
			authors: {
				select: {
					userId: true,
				},
			},
		},
	});
	if (story) {
		return json({
			story,
			allowEdits: story.authors.some((author) => author.userId === session?.get('userId')),
		});
	} else {
		return json(
			{
				message: "Sorry, we couldn't find that story!",
			},
			404
		);
	}
};

export default function Story() {
	const loaderData = useLoaderData() as LoaderData;
	if ('story' in loaderData) {
		return (
			<div className='w-full h-full flex flex-col gap-4 p-12'>
				<h2 className='text-base'>{loaderData.story.content ?? "This is a placeholder."}</h2>
			</div>
		);
	}
}
