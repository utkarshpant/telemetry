import { Session } from '@prisma/client';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { prisma } from 'prisma/db.server';
import { validateRequestAndReturnSession } from '~/auth/utils.server';
import useUser from '~/hooks/useUser';
import { UAParser } from 'ua-parser-js';
import { getLocaleDateString } from 'utils/utils';
import { Chip } from '~/components/Chip/Chip';

export async function loader({ request }: LoaderFunctionArgs) {
	const session = await validateRequestAndReturnSession(request);
	if (session) {
		const userSessions = await prisma.session
			.findMany({
				where: {
					AND: {
						userId: session.get('userId'),
					},
					NOT: {
						status: {
							equals: 'EXPIRED',
						},
					},
				},
				orderBy: {
					createdAt: 'desc',
				},
				take: 6,
			})
			.catch((error) => {
				throw json(
					{ message: 'There was an error fetching your session details.', error },
					{ status: 500 }
				);
			});
		const parsedSessions = userSessions.map((session) => ({
			...session,
			createdAt: new Date(session.createdAt),
			expiresAt: session.expiresAt ? new Date(session.expiresAt) : null,
		}));
        const currentSessionIndex = parsedSessions.findIndex((dbSession) => dbSession.id === session.id);
        const currentSession = parsedSessions.splice(currentSessionIndex, 1)[0];
        return json({
			sessions: parsedSessions,
			currentSession,
		});
	}
}

function getButtonTextFromSession(session: Session): string {
	if (session.status === 'EXPIRED') {
		return 'Expired';
	} else if (session.status === 'INACTIVE') {
		return 'Inactive';
	} else if (session.status === 'ACTIVE') {
		return 'Sign Out';
	} else {
		return 'Revoke';
	}
}

type SessionCardProps = {
	session: Session;
	fetcher: ReturnType<typeof useFetcher>;
};

function SessionCard({ session, fetcher }: SessionCardProps) {
	const { browser } = UAParser(session.userAgent as string);
	const sessionFetcher = fetcher;
	const { currentSession } = useLoaderData<typeof loader>();
    return (
		<div
			className={`flex flex-col p-4 md:-mx-2 items-baseline text-xl md:text-base w-full border-b border-b-stone-600 gap-2 ${
				session.id === currentSession.id ? 'bg-stone-200 dark:bg-stone-800' : ''
			}`}
			key={session.id}
		>
			{session.id === currentSession.id ? (
				<p className='uppercase text-stone-800 dark:text-stone-400'>Current Session</p>
			) : null}
			<p className='text-stone-800 dark:text-stone-400 text-base md:text-sm'>{session.id}</p>
			<span className={`flex flex-row gap-4 items-center`}>
				<Chip
					content={session.ipAddress as string}
					variant='info'
				/>
				{browser.toString()}. Expires {getLocaleDateString(String(session.expiresAt))}.
				{session.status !== 'ACTIVE' ? (
					<Chip
						variant='alert'
						content={getButtonTextFromSession(session)}
					/>
				) : null}
				{session.status === 'ACTIVE' ? (
					<button
						type='button'
						className='bg-stone-700 px-2 py-1 rounded'
						onClick={() => {
							sessionFetcher.submit(null, {
								action:
									session.id === currentSession.id
										? '/sign-out'
										: `/session/${session.id}/revoke`,
								method: 'POST',
								preventScrollReset: true,
							});
						}}
					>
						Sign out
					</button>
				) : null}
			</span>
		</div>
	);
}

export default function Settings() {
	const { user, signedIn } = useUser();
	const { sessions, currentSession } = useLoaderData<{
		sessions: Session[];
		currentSession: Pick<Session, 'expiresAt' | 'id' | 'ipAddress' | 'status' | 'userAgent'>;
	}>();
	const sessionFetcher = useFetcher({ key: 'session' });

	if (signedIn)
		return (
			<div className='flex flex-col gap-2 text-xl'>
				<p>
					Hi, {user.firstName}! This is where you can control every part of your Telemetry
					experience. Update your email or username, change your profile photo, keep track
					of sessions, and if needed, request deletion of your account.
				</p>
				<h1>Sessions</h1>
				<div className='flex flex-col my-2 h-full w-full text-xl'>
					<SessionCard session={currentSession} fetcher={sessionFetcher} />
                    {sessions.map((session) => (
						<SessionCard
							session={session}
							fetcher={sessionFetcher}
							key={session.id}
						/>
					))}
				</div>
			</div>
		);
}
