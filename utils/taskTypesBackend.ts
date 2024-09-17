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
    sectionIndex: number,
    status: string,
    fromDate: CDate,
    toDate: CDate,
    assignees?: string[],
    description: string,
    createdBy: string,
}

interface InactiveTask {
    row: number,
    sectionIndex: number,
    fromDate: CDate,
    toDate: CDate,
}

interface DraggedTask {
    uuid: string,
    sectionIndex: number,
    name: string,
    status: string,
    color: string,
    left: number,
    top: number,
    width: number,
    clickOffsetX: number,
    clickOffsetY: number
}

interface TasksListOptions {
    sectionIndex: number
}

interface TaskAddOptions {
    color: string,
    name: string,
    row: number,
    sectionIndex: number,
    fromDate: CDate,
    toDate: CDate,
    assignees?: string[],
    description: string,
    createdBy: string
}

interface TaskEditOptions {
    uuid: string,
    color: string,
    name: string,
    row: number,
    sectionIndex: number,
    status: string,
    fromDate: CDate,
    toDate: CDate,
    assignees?: string[],
    description: string,
    createdBy: string
}

interface TasksEditOptions {
    tasks: Task[]
}

interface TaskDeleteOptions {
    uuid: string
}