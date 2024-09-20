import { getDatabase } from '~/server/src/database';
import * as Profiles from '~/server/src/profiles'

export default defineEventHandler(async (event) => {
    try {
        const db = await getDatabase();
        return Profiles.list(db);
    } catch (err) { return };
});