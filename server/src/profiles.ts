import { z } from 'zod';
import { randomUUID } from 'node:crypto'
import { DatabaseConnection, sql } from '@databases/sqlite';

interface Profile {
    uuid: string,
    name: string,
    email: string
    password: string
}

interface ProfileAddOptions {
    name: string,
    email: string,
    password: string
}

interface ProfileLoginOptions {
    email: string,
    password: string
}

const profileAddOptionsSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string()
});

const profileLoginOptionsSchema = z.object({
    email: z.string(),
    password: z.string()
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
    };

    if((await db.query(sql`SELECT * FROM profiles WHERE email = ${params.email}`)).length > 0)
        return;

    db.query(sql`INSERT INTO profiles (
            uuid,
            name,
            email,
            password
        ) VALUES (
            ${profile.uuid},
            ${profile.name},
            ${profile.email},
            ${profile.password}
        )
    `);

    return profile;
}

export async function login(db: DatabaseConnection, options: ProfileLoginOptions) {
    const params = profileLoginOptionsSchema.parse(options);

    const loginResult = await db.query(sql`SELECT password FROM profiles WHERE email = ${params.email}`);

    if(loginResult.length == 0)
        return false;

    if(loginResult[0].password === params.password)
        return true;
}