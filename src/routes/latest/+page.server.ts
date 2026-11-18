import { data } from '#lib/server/data.ts';

export const load = () => ({ changes: data().changes });
