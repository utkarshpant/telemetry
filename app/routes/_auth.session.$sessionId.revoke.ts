import { ActionFunctionArgs, json } from '@remix-run/node';
import { prisma } from 'prisma/db.server';
import { validateRequestAndReturnSession } from '~/auth/utils.server';

export async function action({ request, params }: ActionFunctionArgs) {
	const session = await validateRequestAndReturnSession(request);
	if (!session) {
		return json({ message: 'Invalid request.' }, { status: 400 });
	}
	const { sessionId } = params;
	await prisma.session
		.update({
			where: {
				id: sessionId,
			},
			data: {
				status: 'INACTIVE',
			},
		})
		.catch((error) => {
			throw json({ message: 'An error occurred while signing out.', error }, { status: 500 });
		});
	return json({ message: `Signed-out of session ID ${sessionId}.` });
}
