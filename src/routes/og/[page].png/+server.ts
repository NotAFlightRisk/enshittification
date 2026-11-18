import { error } from '@sveltejs/kit';
import { cardPages, drawPage } from '#lib/server/og.ts';

export const prerender = true;

export const entries = () => cardPages().map((page) => ({ page }));

export const GET = async ({ params }) => {
  const image = await drawPage(params.page);
  if (!image) error(404, 'No card for that page');
  return new Response(image, { headers: { 'Content-Type': 'image/png' } });
};
