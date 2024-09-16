import { z } from 'zod';
import { DatabaseConnection, sql } from '@databases/sqlite';
import { randomUUID } from 'node:crypto';

const sectionAddOptionsSchema = z.object({
    name: z.string(),
    sectionIndex: z.number()
});

const sectionEditOptionsSchema = z.object({
    uuid: z.string(),
    name: z.string(),
    sectionIndex: z.number()
});

const sectionDeleteOptionsSchema = z.object({
    uuid: z.string()
});


export async function list(db: DatabaseConnection) {
    const sectionList = await db.query(sql`SELECT * FROM sections`);
    return sectionList;
}

export async function add(db: DatabaseConnection, options: SectionAddOptions) {
    const params = sectionAddOptionsSchema.parse(options);
    const uuid = randomUUID();

    let section: Section = {
        uuid: uuid,
        name: params.name,
        sectionIndex: params.sectionIndex
    };

    await db.query(sql`INSERT INTO sections (
            uuid,
            name,
            sectionIndex
        ) VALUES (
            ${section.uuid},
            ${section.name},
            ${section.sectionIndex}
        )
    `);
    
    return section;    
}

export async function edit(db: DatabaseConnection, options: SectionEditOptions) {
    const params = sectionEditOptionsSchema.parse(options);
    
    let sectionData = await db.query(sql`SELECT * FROM sections WHERE uuid = ${params.uuid}`);
    let section: Section = sectionData.at(0);
    
    if(!section)
        return;

    await db.query(sql`UPDATE sections SET
            uuid = ${params.uuid},
            name = ${params.name},
            sectionIndex = ${params.sectionIndex}
        WHERE uuid = ${params.uuid}
    `);
        

    sectionData = await db.query(sql`SELECT * FROM sections WHERE uuid = ${params.uuid}`);
    section = sectionData.at(0);
     
    return section;
}

export async function deleteSection(db: DatabaseConnection, options: SectionDeleteOptions) {
    const params = sectionDeleteOptionsSchema.parse(options);

    try {
        await db.query(sql`DELETE FROM sections WHERE uuid = ${params.uuid}`)
        return true
    } catch(err) { console.log(err); return false; }
}
