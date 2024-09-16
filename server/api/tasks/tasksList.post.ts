import { getDatabase } from '~/server/src/database';
import * as Tasks from '~/server/src/tasks'

export default defineEventHandler(async (event) => {
    const { databaseFilePath } = useRuntimeConfig();
    const db = await getDatabase(databaseFilePath);
    const body = await readBody(event);
    return Tasks.list(db, body);
});