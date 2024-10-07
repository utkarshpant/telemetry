import { ActionFunction, redirect } from "@remix-run/node";
import { prisma } from "prisma/db.server";
import { validateRequestAndReturnSession } from "~/auth/utils.server";

// create a new story and redirect to story/:id
export const action: ActionFunction = async ({ request }) => {
    const session = await validateRequestAndReturnSession(request);
    if (!session) {
        return redirect('/sign-in', 302);
    }
    const userId = session.get('userId');
    const story = await prisma.story.create({
        data: {
            title: 'Untitled Story',
            content: 'Once upon a time...',
            authors: {
                create: {
                    user: {
                        connect: {
                            id: userId
                        }
                    }
                }
            }
        },
    });
    return redirect(`/story/${story.id}`);
};