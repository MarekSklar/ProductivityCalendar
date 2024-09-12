import { getDatabase } from '~/server/src/database';
import * as Tasks from '~/server/src/tasks'

export default defineEventHandler(async (event) => {
    try {
        const { databaseFilePath } = useRuntimeConfig();
        const db = await getDatabase(databaseFilePath);
        const body = await readBody(event);
        return await Tasks.edit(db, body);
    } catch(error) {
        console.log("Failed to edit task");
    }    
});