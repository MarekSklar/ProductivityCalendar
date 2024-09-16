import { boolean, z } from 'zod';
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

const taskEditOptionsSchema = z.object({
    uuid: z.string(),
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

const tasksEditOptionsSchema = z.object({
    tasks: z.any() // nevim jak to udelat pro objekt
});

const taskDeleteOptionsSchema = z.object({
    uuid: z.string()
});

export async function list(db: DatabaseConnection) {
    let tasks = db.query(sql`SELECT * FROM tasks`);
    (await tasks).forEach((task) => {
        const fromDates = task.fromDate.split('-');
        task.fromDate = { day: parseInt(fromDates[2]), month: parseInt(fromDates[1]), year: parseInt(fromDates[0]) };

        const toDates = task.toDate.split('-');
        task.toDate = { day: parseInt(toDates[2]), month: parseInt(toDates[1]), year: parseInt(toDates[0]) };
        
        task.assignees = task.assignees.split(',');
        task.active = true;
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
    
    const sqlFromDate = task.fromDate.year + "-" + (task.fromDate.month < 10 ? "0" + task.fromDate.month : task.fromDate.month) + "-" + (task.fromDate.day < 10 ? "0" + task.fromDate.day : task.fromDate.day);
    const sqlToDate = task.toDate.year + "-" + (task.toDate.month < 10 ? "0" + task.toDate.month : task.toDate.month) + "-" + (task.toDate.day < 10 ? "0" + task.toDate.day : task.toDate.day); 

    await db.query(sql`INSERT INTO tasks (
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

export async function edit(db: DatabaseConnection, options: TaskEditOptions) {
    const params = taskEditOptionsSchema.parse(options);
    
    let taskData = await db.query(sql`SELECT * FROM tasks WHERE uuid = ${params.uuid}`);
    let task: Task = taskData.at(0);
    
    if(!task)
        return;

    const sqlFromDate = params.fromDate.year + "-" + (params.fromDate.month < 10 ? "0" + params.fromDate.month : params.fromDate.month) + "-" + (params.fromDate.day < 10 ? "0" + params.fromDate.day : params.fromDate.day);
    const sqlToDate = params.toDate.year + "-" + (params.toDate.moFlognth < 10 ? "0" + params.toDate.month : params.toDate.month) + "-" + (params.toDate.day < 10 ? "0" + params.toDate.day : params.toDate.day); 

    await db.query(sql`UPDATE tasks SET
        uuid = ${params.uuid},
        color = ${params.color},
        name = ${params.name},
        row = ${params.row},
        status = ${params.status},
        fromDate = ${sqlFromDate},
        toDate = ${sqlToDate},            
        assignees = ${params.assignees?.toString()},
        description = ${params.description},
        createdBy = ${params.createdBy}
        WHERE uuid = ${params.uuid}
    `);
        

    taskData = await db.query(sql`SELECT * FROM tasks WHERE uuid = ${params.uuid}`);
    task = taskData.at(0);
     
    const fromDates = taskData.at(0).fromDate.split('-');
    task.fromDate = { day: parseInt(fromDates[2]), month: parseInt(fromDates[1]), year: parseInt(fromDates[0]) };

    const toDates = taskData.at(0).toDate.split('-');
    task.toDate = { day: parseInt(toDates[2]), month: parseInt(toDates[1]), year: parseInt(toDates[0]) };
    
    task.assignees = taskData.at(0).assignees.split(',');
    return task;
}

export async function editArray(db: DatabaseConnection, options: TasksEditOptions) {
    const params = tasksEditOptionsSchema.parse(options);
    
    params.tasks!.forEach(async (task: Task) => {
        let taskData = await db.query(sql`SELECT * FROM tasks WHERE uuid = ${task.uuid}`);
        if(!task)
            return;

        const sqlFromDate = task.fromDate.year + "-" + (task.fromDate.month < 10 ? "0" + task.fromDate.month : task.fromDate.month) + "-" + (task.fromDate.day < 10 ? "0" + task.fromDate.day : task.fromDate.day);
        const sqlToDate = task.toDate.year + "-" + (task.toDate.month < 10 ? "0" + task.toDate.month : task.toDate.month) + "-" + (task.toDate.day < 10 ? "0" + task.toDate.day : task.toDate.day); 

        await db.query(sql`UPDATE tasks SET
            uuid = ${task.uuid},
            color = ${task.color},
            name = ${task.name},
            row = ${task.row},
            status = ${task.status},
            fromDate = ${sqlFromDate},
            toDate = ${sqlToDate},            
            assignees = ${task.assignees?.toString()},
            description = ${task.description},
            createdBy = ${task.createdBy}
            WHERE uuid = ${task.uuid}
        `);

        taskData = await db.query(sql`SELECT * FROM tasks WHERE uuid = ${task.uuid}`);
        task = taskData.at(0);

        const fromDates = taskData.at(0).fromDate.split('-');
        task.fromDate = { day: parseInt(fromDates[2]), month: parseInt(fromDates[1]), year: parseInt(fromDates[0]) };

        const toDates = taskData.at(0).toDate.split('-');
        task.toDate = { day: parseInt(toDates[2]), month: parseInt(toDates[1]), year: parseInt(toDates[0]) };

        task.assignees = taskData.at(0).assignees.split(',');
    });

    return params.tasks!;
}

export async function deleteTask(db: DatabaseConnection, options: TaskDeleteOptions) {
    const params = taskDeleteOptionsSchema.parse(options);

    try {
        await db.query(sql`DELETE FROM tasks WHERE uuid=${params.uuid}`)
        return true
    } catch(err) { console.log(err); return false; }
}
