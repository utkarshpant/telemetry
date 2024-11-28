/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	type ActionFunctionArgs,
	json,
	unstable_parseMultipartFormData,
	unstable_createMemoryUploadHandler,
	unstable_createFileUploadHandler,
	unstable_composeUploadHandlers,
} from '@remix-run/node';

import { validateRequestAndReturnSession } from '~/auth/utils.server';

export async function action({ request, params }: ActionFunctionArgs) {
	const session = await validateRequestAndReturnSession(request);
	if (!session || session.get('userId') !== Number(params.userId)) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}
	return null;
}
