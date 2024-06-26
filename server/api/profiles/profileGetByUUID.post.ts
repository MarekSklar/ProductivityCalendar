import { getDatabase } from '~/server/src/database';
import * as Profiles from '~/server/src/profiles'

export default defineEventHandler(async (event) => {
    try {
        const { databaseFilePath } = useRuntimeConfig();
        const db = await getDatabase(databaseFilePath);
        const body = await readBody(event);
        return Profiles.getByUUID(db, body);
    } catch(error) {
        return;
    }
});