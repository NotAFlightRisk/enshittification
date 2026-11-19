import { stats, wall } from '#lib/server/data.ts';

export const load = () => ({ counts: stats(), wall: wall() });
