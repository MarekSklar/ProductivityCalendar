import fs from 'fs';
import path from 'path';
import imageToBase64 from 'image-to-base64';
import { getDatabase } from '~/server/src/database';
import * as Profiles from '~/server/src/profiles'

// Prozatim to funguje ze ziskavame vsechny soubory ze slozky, pokud to bude problem muzeme ulozit kazdou fotku do databaze
export default defineEventHandler(async (event) => {
    const pfps: AllPfps = {};

    const { databaseFilePath } = useRuntimeConfig();
    const db = getDatabase(databaseFilePath);
    const profiles = await Profiles.list(db);
    
    profiles.forEach(async (profile) => {
        pfps[profile.uuid] = await imageToBase64(profile.pfpPath48);
    });
    
    return pfps;
});