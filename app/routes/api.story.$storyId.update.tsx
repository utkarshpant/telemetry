/**
 * This route is responsible for PATCH requests to update a story.
 * The storyId is passed as a parameter in the URL, and any updates are passed in the request body.
 * A 200 OK response indicates updates were successful.
 */

import { ActionFunction, json } from '@remix-run/node';
import { prisma } from '../../prisma/db.server';
import { validateRequestAndReturnSession } from '~/auth/utils.server';
import { useState } from 'react';
import EditMaterialIcon from '../assets/edit-material-icon.svg?url';
// import { useFetcher } from '@remix-run/react';

export const action: ActionFunction = async ({ request, params }) => {
	const session = await validateRequestAndReturnSession(request);
	if (!session) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}
	const { storyId } = params;
	const updates = Object.fromEntries((await request.formData()).entries());
	console.log(updates);
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
			},
		});
		return json(200);
	} catch (e) {
		if (e instanceof Error) {
			return json({ message: e.message ?? 'Something went wrong.' }, { status: 500 });
		}
	}
};

export function EditableTitle({
	editable,
	defaultValue,
}: {
	editable: boolean;
	defaultValue: string;
}) {
	// const fetcher = useFetcher();
	const [allowEdits, setAllowEdits] = useState<boolean>(false);
	const postIsEditable = editable && allowEdits;
	return (
		<div className='flex flex-row items-baseline'>
			<button
				className='hover:bg-neutral-700 rounded'
				onClick={() => {
					setAllowEdits(!allowEdits);
				}}
			>
				<img
					alt='Edit title'
					src={EditMaterialIcon}
				></img>
			</button>
			<input
				className={`text-6xl ${postIsEditable ? 'border-b-white' : 'border-b-transparent'}`}
				aria-label='Editable title'
				disabled={!editable || !allowEdits}
				defaultValue={defaultValue}
				onChange={(e) => {
					console.log(e.target.value);
				}}
			></input>
		</div>
	);
}
