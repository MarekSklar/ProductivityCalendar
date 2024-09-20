import { getDatabase } from '~/server/src/database';
import * as Sections from '~/server/src/sections'

export default defineEventHandler(async (event) => {
    try {
        const db = await getDatabase();
        const body = await readBody(event);
        return Sections.deleteSection(db, body);
    } catch(err) {
        return;
    }
});