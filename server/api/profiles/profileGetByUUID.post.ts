import { getDatabase } from '~/server/src/database';
import * as Profiles from '~/server/src/profiles'

export default defineEventHandler(async (event) => {
    try {
        const db = await getDatabase();
        const body = await readBody(event);
        return Profiles.getByUUID(db, body);
    } catch(error) {
        return;
    }
});