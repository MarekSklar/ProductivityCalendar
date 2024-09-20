import { getDatabase } from '~/server/src/database';
import * as Tasks from '~/server/src/tasks'

export default defineEventHandler(async (event) => {
    const db = await getDatabase();
    const body = await readBody(event);
    return Tasks.list(db, body);
});