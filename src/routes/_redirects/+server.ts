import { data } from '#lib/server/data.ts';

export const prerender = true;

// Cloudflare reads this file from the site root, so renamed ids keep their old URLs
export const GET = () =>
  new Response(
    data()
      .redirects.map(({ from, to }) => `${from} ${to} 301`)
      .join('\n') + '\n',
    {
      headers: { 'Content-Type': 'text/plain' }
    }
  );
