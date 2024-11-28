import { ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { prisma } from 'prisma/db.server';
import { commitSession, validateRequestAndReturnSession } from '~/auth/utils.server';

export async function action({ request, params }: ActionFunctionArgs) {
	const session = await validateRequestAndReturnSession(request);
	if (!session || session.get('userId') !== Number(params.userId)) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}
	if (request.method === 'PATCH') {
		const updates = Object.fromEntries((await request.formData()).entries());
		try {
			await prisma.user.update({
				where: {
					id: Number(params.userId),
				},
				data: {
					...(updates.username && { username: updates.username as string }),
					...(updates.email && { email: updates.email as string }),
					...(updates.firstName && { firstName: updates.firstName as string }),
					...(updates.lastName && { lastName: updates.lastName as string }),
					...(updates.bio && { bio: updates.bio as string }),
				},
			});
			return redirect('/home', {
				headers: {
					'Set-Cookie': await commitSession(session),
				}
			});
		} catch (e) {
			if (e instanceof Error) {
				return json({ message: e.message ?? 'Something went wrong.' }, { status: 500 });
			}
		}
	}
	return json({ message: 'Invalid request method' }, { status: 405 });
}
