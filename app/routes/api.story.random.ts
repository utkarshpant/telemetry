import { Story, User } from '@prisma/client';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { prisma } from 'prisma/db.server';

export type RandomStoryPreview = {
	id: number;
	title: string;
	subtitle: string | null;
	publishedAt: Date | null;
	username?: string;
	bio?: string | null;
	firstName?: string;
	lastName?: string;
	profilePictureUrl?: string | null;
	userId?: string | null;
	user: {
		id: string;
		username: string;
		bio: string | null;
		firstName: string;
		lastName: string;
		profilePictureUrl: string | null;
	};
};

async function getSampledStoriesWithAuthors(n: number) {
	const sampledStories: Array<
		Pick<Story, 'id' | 'title' | 'subtitle' | 'publishedAt'> & {
			authors: Array<
				Pick<User, 'id' | 'firstName' | 'lastName' | 'username' | 'profilePictureUrl'>
			>;
		}
	> = await prisma.$queryRaw`
        SELECT
            id,
            title,
            subtitle,
            "publishedAt"
        FROM
            stories
        WHERE "isPublished" = TRUE
        ORDER BY
            RANDOM()
        LIMIT ${n};
        `;
	const storyAuthors = await prisma.storyAuthor.findMany({
        where: {
            storyId: {
                in: sampledStories.map((story) => story.id),
            },
        }
    });
	const authors = await prisma.user.findMany({
		where: {
			id: {
				in: storyAuthors.map((storyAuthor) => storyAuthor.userId),
			},
		},
		select: {
			id: true,
			firstName: true,
			lastName: true,
			username: true,
			profilePictureUrl: true,
		},
	});

    const storyAuthorMap = storyAuthors.reduce((acc, storyAuthor) => {
        if (!acc[storyAuthor.storyId]) {
            acc[storyAuthor.storyId] = [];
        }
        acc[storyAuthor.storyId].push(storyAuthor.userId);
        return acc;
    }, {} as Record<number, number[]>);

    sampledStories.forEach((story) => {
        const authorIds = storyAuthorMap[story.id];
        if (!authorIds) {
            return;
        }
        story.authors = authors.filter((author) => authorIds.includes(author.id));
    });

	return sampledStories;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const requestUrl = new URL(request.url);
	const queryParams = new URLSearchParams(requestUrl.search);
	const count = Number(queryParams.get('count'));
	"stories.");
    if (!count) {
        return json({ message: 'Invalid count' }, { status: 400 });
    }
	try {
		return json(await getSampledStoriesWithAuthors(count));
	} catch (e) {
		console.error(e);
	}
}
