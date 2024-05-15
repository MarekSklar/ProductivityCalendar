import { z } from 'zod';
import { DatabaseConnection, sql } from "@databases/sqlite";
import { randomUUID } from 'node:crypto'

interface Tag {
    uuid: string,
    color: string,
    name: string
}

interface TagAddOptions {
    color: string,
    name: string
}

const tagAddOptionsSchema = z.object({
    color: z.string(),
    name: z.string()
});

export async function list(db: DatabaseConnection) {
    return db.query(sql`SELECT * FROM tags`);
}

export async function add(db: DatabaseConnection, options: TagAddOptions) {
    const params = tagAddOptionsSchema.parse(options);

    let tag: Tag = {
        uuid: randomUUID(),
        color: params.color,
        name: params.name
    };

    if((await db.query(sql`SELECT * FROM profiles WHERE email = ${params.name}`)).length > 0)
        return;

    db.query(sql`INSERT INTO tags (
            uuid,
            color,
            name
        ) VALUES (
            ${tag.uuid},
            ${tag.color},
            ${tag.name}            
        )
    `);

    return tag;
}