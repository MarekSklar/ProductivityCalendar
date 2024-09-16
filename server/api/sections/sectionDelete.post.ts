import { getDatabase } from '~/server/src/database';
import * as Sections from '~/server/src/sections'

export default defineEventHandler(async (event) => {
    try {
        const { databaseFilePath } = useRuntimeConfig();
        const db = await getDatabase(databaseFilePath);
        const body = await readBody(event);
        return Sections.deleteSection(db, body);
    } catch(err) {
        return;
    }
});