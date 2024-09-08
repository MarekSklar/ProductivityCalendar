import connect, { DatabaseConnection, sql } from "@databases/sqlite"
import fs from 'fs'

let db: DatabaseConnection;
let initalized = false;

export const getDatabase = (path: string) => {
    db = db || connect(path);

    if(!fs.existsSync(path))
    {
        fs.mkdir(`${process.cwd()}/database`, (err) => { if(err) console.error(`Failed to create database folder (${err})`)});

        if(!fs.existsSync(path))
            fs.writeFile(`${process.cwd()}/database/db.sqlite`, '', (err) => { if(err) console.error(`Failed to create sqlite database (${err})`)});
    }
        
    if(!initalized) {
        db.query(sql`CREATE TABLE IF NOT EXISTS profiles (
                uuid TEXT PRIMARY KEY,
                name TEXT NOT NULL,                
                email TEXT NOT NULL,
                password TEXT NOT NULL,
                pfpPath256 TEXT NOT NULL,
                pfpPath48 TEXT NOT NULL,
                sessionToken TEXT NOT NULL
            );`            
        );
        
        db.query(sql`CREATE TABLE IF NOT EXISTS tasks (
                uuid TEXT PRIMARY KEY,
                color TEXT NOT NULL,
                name TEXT NOT NULL,
                row INT NOT NULL,
                status TEXT NOT NULL,
                fromDate DATE,
                toDate DATE,
                assignees TEXT[],
                description TEXT,
                createdBy TEXT NOT NULL
            );`            
        );

        initalized = true;
    }

    return db;
}