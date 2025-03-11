import { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
    return new Response('OK', { status: 200 });
}