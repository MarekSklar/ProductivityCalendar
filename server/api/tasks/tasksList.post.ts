import { getDatabase } from '~/server/src/database';
import * as Tasks from '~/server/src/tasks'

export default defineEventHandler(async (event) => {
    const { databaseFilePath } = useRuntimeConfig();
    const db = await getDatabase(databaseFilePath);
    return Tasks.list(db);
});