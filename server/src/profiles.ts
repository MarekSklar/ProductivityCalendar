import { z } from 'zod';
import { DatabaseConnection, DatabaseConnectionMode, sql } from '@databases/sqlite';
import { randomUUID } from 'node:crypto';
import fs from 'fs';
import path from 'path';

const profileAddOptionsSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
    role: z.string(),
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

const profileEditOptionsSchema = z.object({
    uuid: z.string(),
    name: z.string(),
    email: z.string().email(),
    password: z.any().optional(),
    role: z.string(),
    pfpPath256: z.string(),
    pfpPath48: z.string(),
    sessionToken: z.any().optional()
});

const profileGetByUUIDOptionsSchema = z.object({
    uuid: z.string()
});

const profileDeleteOptionsSchema = z.object({
    uuid: z.string()
});


export async function list(db: DatabaseConnection) {
    const profileList = await db.query(sql`SELECT * FROM profiles`);
    return profileList;
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
        role: params.role,
        pfpPath256: params.pfpPath256,
        pfpPath48: params.pfpPath48,
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
                role,
                pfpPath256,
                pfpPath48,
                sessionToken
            ) VALUES (
                ${profile.uuid},
                ${profile.name},
                ${profile.email},
                ${params.password},
                ${profile.role},
                ${profile.pfpPath256},
                ${profile.pfpPath48},
                ${params.sessionToken}
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

        if(result[0].sessionToken === params.sessionToken) {
            return result;
        }
        
        return;
    } catch(error) {
        return;
    }
}

export async function edit(db: DatabaseConnection, options: ProfileEditOptions) {
    const params = profileEditOptionsSchema.parse(options);
    
    let profileData = await db.query(sql`SELECT * FROM profiles WHERE uuid = ${params.uuid}`);
    
    if(!profileData.at(0))
        return;

    if (params.pfpPath256 === 'default') {
        params.pfpPath256 = profileData.at(0).pfpPath256;
        params.pfpPath48 = profileData.at(0).pfpPath48;
    }

    await db.query(sql`UPDATE profiles SET
        name = ${params.name},
        email = ${params.email},
        role = ${params.role},
        pfpPath256 = ${params.pfpPath256},
        pfpPath48 = ${params.pfpPath48}
    WHERE uuid = ${params.uuid}`);

    if(params.password && params.password !== "null") {
        await db.query(sql`UPDATE profiles SET
            password = ${params.password}
        WHERE uuid = ${params.uuid}`);
    }

    if(params.sessionToken && params.sessionToken !== "null") {
        await db.query(sql`UPDATE profiles SET
            sessionToken = ${params.sessionToken}
        WHERE uuid = ${params.uuid}`);
    }

    profileData = await db.query(sql`SELECT * FROM profiles WHERE uuid = ${params.uuid}`);
    let profile: Profile = { uuid: profileData.at(0).uuis, name: profileData.at(0).name, email: profileData.at(0).email, role: profileData.at(0).role, pfpPath256: profileData.at(0).pfpPath256, pfpPath48: profileData.at(0).pfpPath48 }; 
  
    return profile;
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

export async function deleteProfile(db: DatabaseConnection, options: ProfileDeleteOptions) {
    const params = profileDeleteOptionsSchema.parse(options);

    try {
        await db.query(sql`DELETE FROM profiles WHERE uuid = ${params.uuid}`)
        return true
    } catch(err) { console.log(err); return false; }
}
