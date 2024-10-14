import { type User } from '@prisma/client';
import { useRouteLoaderData } from '@remix-run/react';

type RootUserType = {
    user: User | null,
    signedIn: boolean,
}

export default function useUser() {
	return useRouteLoaderData('root') as RootUserType;
}
