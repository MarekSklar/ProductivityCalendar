declare global {
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
        assignees?: string[],
        description: string,
        createdBy: string,
    }
    
    interface InactiveTask {
        row: number,
        fromDate: CDate,
        toDate: CDate,
    }
    
    interface DraggedTask {
        uuid: string,
        name: string,
        status: string,
        color: string,
        left: number,
        top: number,
        width: number
    }
    
    interface TaskAddOptions {
        color: string,
        name: string,
        row: string,
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
        row: string,
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
}