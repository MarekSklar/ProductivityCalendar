import { getDatabase } from '~/server/src/database';
import * as Tags from '~/server/src/tags'

export default defineEventHandler(async (event) => {
    const { databaseFilePath } = useRuntimeConfig();
    const db = await getDatabase(databaseFilePath);
    return Tags.list(db);
});