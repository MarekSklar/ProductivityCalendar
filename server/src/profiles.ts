import { z } from 'zod';
import { DatabaseConnection, sql } from '@databases/sqlite';
import { randomUUID } from 'node:crypto';
import fs from 'fs';
import path from 'path';

const profileAddOptionsSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
    pfpPath256: z.string(),
    pfpPath48: z.string(),
    sessionToken: z.string()
});

const profileLoginOptionsSchema = z.object({
    email: z.string(),
    password: z.string()
});

const profileGetOptionsSchema = z.object({
    sessionToken: z.string()
});

const profileGetByUUIDOptionsSchema = z.object({
    uuid: z.string()
});

export async function list(db: DatabaseConnection) {
    return db.query(sql`SELECT * FROM profiles`);
}

export async function add(db: DatabaseConnection, options: ProfileAddOptions) {
    const params = profileAddOptionsSchema.parse(options);
    const uuid = randomUUID();
    let isPfpDefault = false;

    if (params.pfpPath256 === 'default') {
        isPfpDefault = true;
        params.pfpPath256 = path.join(process.cwd(), 'profilePics/default/256.jpg');
        params.pfpPath48 = path.join(process.cwd(), 'profilePics/default/48.jpg');
    } else {
        const format = params.pfpPath256.split('.').pop();
        const path256 = path.join(process.cwd(), 'profilePics/256_' + uuid + '.' + format);
        const path48 = path.join(process.cwd(), 'profilePics/48_' + uuid + '.' + format);
        fs.renameSync(params.pfpPath256, path256);
        fs.renameSync(params.pfpPath48, path48);

        params.pfpPath256 = path256;
        params.pfpPath48 = path48;
    }

    let profile: Profile = {
        uuid: uuid,
        name: params.name,
        email: params.email,
        password: params.password,
        pfpPath256: params.pfpPath256,
        pfpPath48: params.pfpPath48,
        sessionToken: params.sessionToken
    };

    if ((await db.query(sql`SELECT * FROM profiles WHERE email = ${params.email}`)).length > 0)
    {
        if (!isPfpDefault) {
            fs.unlinkSync(params.pfpPath256);
            fs.unlinkSync(params.pfpPath48);
        }
        return;
        
    } else {
        await db.query(sql`INSERT INTO profiles (
                uuid,
                name,
                email,
                password,
                pfpPath256,
                pfpPath48,
                sessionToken
            ) VALUES (
                ${profile.uuid},
                ${profile.name},
                ${profile.email},
                ${profile.password},
                ${profile.pfpPath256},
                ${profile.pfpPath48},
                ${profile.sessionToken}
            )
        `);
        
        return profile;
    }
}

export async function login(db: DatabaseConnection, options: ProfileLoginOptions) {
    const params = profileLoginOptionsSchema.parse(options);

    const loginResult = await db.query(sql`SELECT sessionToken, password FROM profiles WHERE email = ${params.email}`);

    if(loginResult.length == 0)
        return;

    if(loginResult[0].password === params.password)
    {   
        let sessionToken = "";
        if(loginResult[0].sessionToken !== "null")
            sessionToken = loginResult[0].sessionToken;
        else
            sessionToken = randomUUID();

        await db.query(sql`UPDATE profiles SET sessionToken = ${sessionToken} WHERE email = ${params.email}`);
        return sessionToken;
    }
}

export async function get(db: DatabaseConnection, options: ProfileGetOptions) {
    try {
        const params = profileGetOptionsSchema.parse(options);

        if(!params.sessionToken)
            return;

        const result = await db.query(sql`SELECT * FROM profiles WHERE sessionToken = ${params.sessionToken}`);

        if(result.length == 0)
            return;

        if(result[0].sessionToken === params.sessionToken)    
            return result;
        
        return;
    } catch(error) {
        return;
    }
}

export async function getByUUID(db: DatabaseConnection, options: ProfileGetByUUIDOptions) {
    try {
        const params = profileGetByUUIDOptionsSchema.parse(options);

        if(!params.uuid)
            return;

        const result = await db.query(sql`SELECT * FROM profiles WHERE uuid = ${params.uuid}`);

        if(result.length == 0)
            return;

        if(result[0].uuid === params.uuid)    
            return result;
        
        return;
    } catch(error) {
        return;
    }
}


