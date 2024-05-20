import { z } from 'zod';
import { DatabaseConnection, sql } from '@databases/sqlite';
import { randomUUID } from 'node:crypto';
import fs from 'fs';

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


export async function list(db: DatabaseConnection) {
    return db.query(sql`SELECT * FROM profiles`);
}

export async function add(db: DatabaseConnection, options: ProfileAddOptions) {
    const params = profileAddOptionsSchema.parse(options);

    let profile: Profile = {
        uuid: randomUUID(),
        name: params.name,
        email: params.email,
        password: params.password,
        pfpPath256: params.pfpPath256,
        pfpPath48: params.pfpPath48,
        sessionToken: params.sessionToken
    };

    if((await db.query(sql`SELECT * FROM profiles WHERE email = ${params.email}`)).length > 0)
    {
        fs.unlinkSync(params.pfpPath256);
        fs.unlinkSync(params.pfpPath48);
        return;
    }
    else
    {
        db.query(sql`INSERT INTO profiles (
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


