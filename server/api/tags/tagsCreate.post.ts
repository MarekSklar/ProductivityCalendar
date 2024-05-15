import { getDatabase } from '~/server/src/database';
import * as Tags from '~/server/src/tags'

export default defineEventHandler(async (event) => {
    try {
        const { databaseFilePath } = useRuntimeConfig();
        const db = await getDatabase(databaseFilePath);
        const body = await readBody(event);
        return Tags.add(db, body);
    } catch(error) {
        return;
    }    
});