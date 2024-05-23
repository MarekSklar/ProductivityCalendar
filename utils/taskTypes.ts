export type CDate = {
    day: number,
    month: number,
    year: number
}

export interface TaskTimestampInterval {
    from: number,
    to: number
}

export interface Task {
    uuid: string,
    color: string,
    name: string,
    row: number,
    status: string,
    fromDate: CDate,
    toDate: CDate,
    assignees?: string[],
    description?: string,
    createdBy: string
}

export interface TaskAddOptions {
    color: string,
    name: string,
    row: string,
    fromDate: CDate,
    toDate: CDate,
    assignees?: string[],
    description: string,
    createdBy: string
}

export interface TaskEditOptions {
    uuid: string,
    color: string,
    name: string,
    row: string,
    status: string,
    fromDate: CDate,
    toDate: CDate,
    assignees?: string[],
    description: string,
    createdBy: string
}

export enum TaskStatus {
    ToDo = "📄 To-Do",
    InProgress = "🔧 In progress",
    Blocked = "🚫 Blocked",
    Closed = "❌ Closed",
    Done = "✅ Done",
    NoStatus = "  No status"
}