import connect, { DatabaseConnection, sql } from "@databases/sqlite"
import * as Profiles from '~/server/src/profiles'
import path from 'path'

let db: DatabaseConnection;
let initalized = false;
let dbPath = "";

export const getDatabase = () => {
    if(!db) {
        dbPath = path.join(process.cwd(), "database/db.sqlite");
    }
    
    db = db || connect(dbPath);

    if(!initalized) {
        db.query(sql`CREATE TABLE IF NOT EXISTS profiles (
                uuid TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                pfpPath256 TEXT NOT NULL,
                pfpPath48 TEXT NOT NULL,
                sessionToken TEXT NOT NULL
            );`            
        ).then(() => {
            db.query(sql`SELECT COUNT(*) AS count FROM profiles`).then((rows) => {
                if(rows[0].count === 0) { 
                    let profileAddOptions: ProfileAddOptions = {
                        name: "admin",
                        email: "admin@admin.com",
                        password: "admin@132!",
                        role: "admin",
                        pfpPath256: "default",
                        pfpPath48: "default",
                        sessionToken: "null"
                    }

                    Profiles.add(db, profileAddOptions);
                }
            });
        });

        db.query(sql`CREATE TABLE IF NOT EXISTS sections (
                uuid TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                sectionIndex INT NOT NULL
            );`
        );

        db.query(sql`CREATE TABLE IF NOT EXISTS tasks (
                uuid TEXT PRIMARY KEY,
                color TEXT NOT NULL,
                name TEXT NOT NULL,
                row INT NOT NULL,
                sectionIndex INT NOT NULL,
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