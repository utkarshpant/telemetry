import { type User } from '@prisma/client';
import { useRouteLoaderData } from '@remix-run/react';

type UseUserType = {
    user: User;
    isSignedIn: true;
} | {
    user: null;
    isSignedIn: false;
}
export default function useUser() {
	return useRouteLoaderData('root') as UseUserType;
}
