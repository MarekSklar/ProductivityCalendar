import { getDatabase } from '~/server/src/database';
import * as Tasks from '~/server/src/tasks'

export default defineEventHandler(async (event) => {
    try {
        const db = await getDatabase();
        const body = await readBody(event);
        return await Tasks.editArray(db, body);
    } catch(error) {
        console.log("Failed to edit tasks");
    }    
});