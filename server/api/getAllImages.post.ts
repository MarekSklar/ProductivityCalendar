import fs from 'fs';
import path from 'path';
import imageToBase64 from 'image-to-base64';

// Prozatim to funguje ze ziskavame vsechny soubory ze slozky, pokud to bude problem muzeme ulozit kazdou fotku do databaze
export default defineEventHandler(async (event) => {
    const pfps: AllPfps = {};

    const profilePicsPath = path.join(process.cwd(), 'profilePics');
    fs.readdirSync(profilePicsPath).forEach((p) => {
        const psplit = p.split('.');
        if(psplit.length != 2)
            return;

        imageToBase64(path.join(profilePicsPath, p)).then((value) => { pfps[psplit[0].split('_')[1]] = value }); // odstrani to prefix 256_ nebo 48_ od uuid
    });

    return pfps;
});