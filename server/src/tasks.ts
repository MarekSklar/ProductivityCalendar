import { z } from 'zod';
import { DatabaseConnection, sql } from "@databases/sqlite";
import { randomUUID } from 'node:crypto';

const taskAddOptionsSchema = z.object({
    color: z.string(),
    name: z.string(),
    row: z.number(),
    status: z.string(),
    fromDate: z.any(),
    toDate: z.any(),
    assignees: z.string().array(),
    description: z.string(),
    createdBy: z.string()
});

export async function list(db: DatabaseConnection) {
    let tasks = db.query(sql`SELECT * FROM tasks`);
    (await tasks).forEach((task) => {
        const fromDates = task.fromDate.split('-');
        task.fromDate = { day: fromDates[2], month: fromDates[1], year: fromDates[0] };

        const toDates = task.toDate.split('-');
        task.toDate = { day: toDates[2], month: toDates[1], year: toDates[0] };

        task.assignees = task.assignees.split(',');
    });

    return tasks;
}

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
        assignees: params.assignees,
        description: params.description,
        createdBy: params.createdBy
    };
    
    const sqlFromDate = task.fromDate.year + "-" + task.fromDate.month + "-" + task.fromDate.day;
    const sqlToDate = task.toDate.year + "-" + task.toDate.month + "-" + task.toDate.day;

    db.query(sql`INSERT INTO tasks (
            uuid,
            color,
            name,
            row,
            status,
            fromDate,
            toDate,
            assignees,
            description,      
            createdBy
        ) VALUES (
            ${task.uuid},
            ${task.color},
            ${task.name},
            ${task.row},
            ${task.status},
            ${sqlFromDate},
            ${sqlToDate},            
            ${task.assignees?.toString()},
            ${task.description},
            ${task.createdBy}
        )
    `);

    return task;
}