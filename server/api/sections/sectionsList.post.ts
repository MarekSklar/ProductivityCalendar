import { getDatabase } from '~/server/src/database';
import * as Sections from '~/server/src/sections'

export default defineEventHandler(async (event) => {
    const { databaseFilePath } = useRuntimeConfig();
    const db = await getDatabase(databaseFilePath);
    return Sections.list(db);
});