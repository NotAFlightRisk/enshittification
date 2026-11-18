import { data } from '#lib/server/data.ts';

export const load = () => ({ paths: data().changes.map(({ path }) => path) });
