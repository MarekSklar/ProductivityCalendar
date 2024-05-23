type CDate = {
    day: number,
    month: number,
    year: number
}

interface TaskTimestampInterval {
    from: number,
    to: number
}

interface Task {
    uuid: string,
    color: string,
    name: string,
    row: number,
    status: string,
    fromDate: CDate,
    toDate: CDate,
    assignees: string[],
    description: string,
    createdBy: string
}

interface TaskAddOptions {
    color: string,
    name: string,
    row: string,
    fromDate: CDate,
    toDate: CDate,
    assignees: string[],
    description: string,
    createdBy: string
}

interface TaskEditOptions {
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