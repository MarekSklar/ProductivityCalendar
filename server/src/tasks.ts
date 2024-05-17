import { z } from 'zod';
import { DatabaseConnection, sql } from "@databases/sqlite";
import { randomUUID } from 'node:crypto';

const Status = [
    "To-Do",
    "No status",
    "In progress",
    "Blocked",
    "Done"
]

type CDate = {
    day: number,
    month: number,
    year: number
}

interface Task {
    uuid: string,
    color: string,
    name: string,
    row: number,
    status: string,
    fromDate: CDate,
    toDate: CDate,
    createdBy: string,
    assignees?: string[],
    description?: string
}

interface TaskAddOptions {
    color: string,
    name: string,
    row: string,
    fromDate: CDate,
    toDate: CDate,
    createdBy: string,
    assignees?: string[],
    description: string
}

const taskAddOptionsSchema = z.object({
    color: z.string(),
    name: z.string(),
    row: z.number(),
    status: z.any(),
    fromDate: z.any(),
    toDate: z.any(),
    createdBy: z.string(),
    assignees: z.string().array(),
    description: z.string()
});

export async function add(db: DatabaseConnection, options: TaskAddOptions) {
    const params = taskAddOptionsSchema.parse(options);

    let task: Task = {
        uuid: randomUUID(),
        color: params.color,
        name: params.name,
        row: params.row,
        status: params.status,
        fromDate: params.fromDate,
        toDate: params.toDate,
        createdBy: params.createdBy,
        assignees: params.assignees,
        description: params.description
    };

    db.query(sql`INSERT INTO tasks (
            uuid,
            color,
            name,
            row,
            status,
            fromDate,
            toDate,
            createdBy,
            assignees,
            description         
        ) VALUES (
            ${task.uuid},
            ${task.color},
            ${task.name},
            ${task.row},
            ${task.status},
            ${task.fromDate},
            ${task.toDate},
            ${task.createdBy},
            ${task.assignees},
            ${task.description}
        )
    `);

    return task;
}