import { getDatabase } from '~/server/src/database';
import * as Sections from '~/server/src/sections'

export default defineEventHandler(async (event) => {
    const db = await getDatabase();
    return Sections.list(db);
});