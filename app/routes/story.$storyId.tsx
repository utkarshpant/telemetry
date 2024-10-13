/* eslint-disable react/no-children-prop */
/* eslint-disable no-mixed-spaces-and-tabs */
import { validateRequestAndReturnSession } from '~/auth/utils.server';
import { prisma } from 'prisma/db.server';
import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { type Story } from '@prisma/client';
import LexicalEditor from '~/components/Editor/LexicalEditor';

export type StoryLoaderData =
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
	const loaderData = useLoaderData() as StoryLoaderData;
	if ('story' in loaderData) {
		return (
			<div className='w-full h-full flex flex-col gap-0'>
				<div
					className='relative h-full w-full m-auto md:px-12'
					id='editor-container'
				>
					<LexicalEditor>
						{/* <textarea
							aria-label='Title'
							className='text-4xl w-full p-4 font-heading resize-y animate-fade-in m-auto mt-2 py-6 bg-neutral-950 border border-transparent hover:border hover:border-b-white hover:border-opacity-50 break-words'
							disabled={!loaderData.allowEdits}
							defaultValue={loaderData.story.title}
						>
						</textarea> */}
					</LexicalEditor>
				</div>
			</div>
		);
	}
	return <div>Sorry, we couldn&apos;t find that story!</div>;
}
