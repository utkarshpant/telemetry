import { type User } from '@prisma/client';
import { useRouteLoaderData } from '@remix-run/react';

type RootUserType = {
    user: User,
    signedIn: true,
} | {
    user: null,
    signedIn: false,
}

export default function useUser() {
	return useRouteLoaderData('root') as RootUserType;
}
