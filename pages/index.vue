<script setup lang="ts">
const Title = "Timeline Title";

const startDragPos = ref(0);
const relativeDragPos = ref(0);
const tempDragPos = ref(0);

enum Dragging {
    None, Calendar, Task, TaskLeftResize, TaskRightResize
}

const draggingValue = ref(Dragging.None);
let currentEditedTask: Task;
let draggedTask: HTMLElement;
let differenceOfDays: number;
let clickOffsetX: number;
let clickOffsetY: number;

const datesOffset = ref(0);
const datesPos = ref(0);

const screenSize = ref({width: 1920, height: 1080});
const columnWidth = 56;

function getDifferenceOfDays(fromDate: CDate, toDate: CDate) {
    const fdate = new Date(fromDate.year, fromDate.month - 1, fromDate.day);
    const tdate = new Date(toDate.year, toDate.month - 1, toDate.day);

    return (tdate.getTime() - fdate.getTime()) / 86400000;
}

function changeDays(date: CDate, value: number) {
    const newDate = new Date(date.year, date.month - 1, date.day);
    newDate.setDate(newDate.getDate() + value);

    return { day: newDate.getDate(), month: newDate.getMonth() + 1, year: newDate.getFullYear() }
}

function taskPlacementPos(task: Task) {
    const todayDayTimestamp = Math.floor(new Date().getTime() / 86400000);
    const taskStartDayTimestamp = Math.floor(new Date(task.fromDate.year, task.fromDate.month - 1, task.fromDate.day).getTime() / 86400000) + 4;
    const taskEndDayTimestamp = Math.floor(new Date(task.toDate.year, task.toDate.month - 1, task.toDate.day).getTime() / 86400000) + 4 + 1;
    
    const taskLength = taskEndDayTimestamp - taskStartDayTimestamp;
    const timeFromToday = taskStartDayTimestamp - todayDayTimestamp;

    return {from: timeFromToday, to: timeFromToday + taskLength, taskLength};
}

// start dragging
function startCalendarDragging(event: MouseEvent) {
    if(draggingValue.value !== Dragging.None)
        return;

    draggingValue.value = Dragging.Calendar;
    startDragPos.value = event.screenX;
}

function startTaskDragging(event: MouseEvent, task: Task) {
    if(draggingValue.value !== Dragging.None)
        return;
    
    const originalTask = document.getElementById(task.uuid);
    if(!originalTask)
        return;
    
    const draggedTaskNode = originalTask.cloneNode(true) as HTMLElement;
    draggedTaskNode.id = "draggedTask";
    document.getElementById('draggingTaskHolder')!.after(draggedTaskNode);
    originalTask.classList.add("opacity-40")
    clickOffsetX = event.offsetX;
    clickOffsetY = event.offsetY;

    draggedTask = document.getElementById('draggedTask')!;
    draggedTask.classList.add('absolute', 'pointer-events-none');
    draggedTask.style.left = (event.pageX - clickOffsetX).toString() + 'px';
    draggedTask.style.top = (event.pageY - clickOffsetY).toString() + 'px';
    draggedTask.style.height = originalTask.clientHeight.toString() + 'px';
    draggedTask.style.zIndex = '1';
    draggingValue.value = Dragging.Task;
    startDragPos.value = event.pageX;
    currentEditedTask = task;
}

function startTaskLeftResizeDragging(event: MouseEvent, task: Task) {  
    if(draggingValue.value !== Dragging.None)
        return;

    draggingValue.value = Dragging.TaskLeftResize;
    startDragPos.value = event.pageX;
    currentEditedTask = task;
    differenceOfDays = getDifferenceOfDays(task.fromDate, task.toDate);
}

function startTaskRightResizeDragging(event: MouseEvent, task: Task) {
    if(draggingValue.value !== Dragging.None)
        return;

    draggingValue.value = Dragging.TaskRightResize;
    startDragPos.value = event.pageX;
    currentEditedTask = task;
    differenceOfDays = getDifferenceOfDays(task.fromDate, task.toDate);
}

// dragging
function moveCalendarComponents(event: MouseEvent) {
    // disable default dragging
    event.preventDefault ? event.preventDefault() : event.returnValue = false;
    
    // move calendar on drag
    if (!event.buttons) return;

    switch (draggingValue.value) {
        case Dragging.Calendar:
            tempDragPos.value = event.screenX - startDragPos.value + relativeDragPos.value;

            datesOffset.value = tempDragPos.value % columnWidth;
            datesPos.value = tempDragPos.value / columnWidth < 0 ? Math.ceil(tempDragPos.value / columnWidth) : Math.floor(tempDragPos.value / columnWidth);
            break;
        case Dragging.Task:
            draggedTask.style.left = (event.pageX - clickOffsetX).toString() + 'px';
            draggedTask.style.top = (event.pageY - clickOffsetY).toString() + 'px';
            break;
        case Dragging.TaskLeftResize:
            if(startDragPos.value - event.pageX > 49) {
                currentEditedTask.fromDate = changeDays(currentEditedTask.fromDate, -1);
                startDragPos.value = event.pageX;
                differenceOfDays = getDifferenceOfDays(currentEditedTask.fromDate, currentEditedTask.toDate);
            } 
            else if(startDragPos.value - event.pageX < -49 && differenceOfDays > 0) {
                currentEditedTask.fromDate = changeDays(currentEditedTask.fromDate, 1);
                startDragPos.value = event.pageX;
                differenceOfDays = getDifferenceOfDays(currentEditedTask.fromDate, currentEditedTask.toDate);
            }
            break;
        case Dragging.TaskRightResize:
            if(event.pageX - startDragPos.value > 49) {
                currentEditedTask.toDate = changeDays(currentEditedTask.toDate, 1);
                startDragPos.value = event.pageX;
                differenceOfDays = getDifferenceOfDays(currentEditedTask.fromDate, currentEditedTask.toDate);
            } 
            else if(event.pageX - startDragPos.value < -49 && differenceOfDays > 0) {
                currentEditedTask.toDate = changeDays(currentEditedTask.toDate, -1);
                startDragPos.value = event.pageX;
                differenceOfDays = getDifferenceOfDays(currentEditedTask.fromDate, currentEditedTask.toDate);
            }
            break;     
    }
}

// end dragging
function endDragging() {
    switch(draggingValue.value) {
        case Dragging.Calendar:
            relativeDragPos.value = tempDragPos.value;
            draggingValue.value = Dragging.None;
            break;
        case Dragging.Task:
            document.getElementById(currentEditedTask.uuid)?.classList.remove("opacity-40");
            draggedTask.remove();
            draggingValue.value = Dragging.None;
            break;
        case Dragging.TaskLeftResize:
            draggingValue.value = Dragging.None;
            $fetch('/api/tasks/tasksEdit', {
                method: 'post',
                body: { 
                    uuid: currentEditedTask.uuid,
                    color: currentEditedTask.color,
                    name: currentEditedTask.name,
                    row: currentEditedTask.row,
                    status: currentEditedTask.status,
                    fromDate: currentEditedTask.fromDate,
                    toDate: currentEditedTask.toDate,
                    assignees: currentEditedTask.assignees,
                    description: currentEditedTask.description,
                    createdBy: currentEditedTask.createdBy
                }
            });
            break;
        case Dragging.TaskRightResize:
            draggingValue.value = Dragging.None;
            $fetch('/api/tasks/tasksEdit', {
                method: 'post',
                body: { 
                    uuid: currentEditedTask.uuid,
                    color: currentEditedTask.color,
                    name: currentEditedTask.name,
                    row: currentEditedTask.row,
                    status: currentEditedTask.status,
                    fromDate: currentEditedTask.fromDate,
                    toDate: currentEditedTask.toDate,
                    assignees: currentEditedTask.assignees,
                    description: currentEditedTask.description,
                    createdBy: currentEditedTask.createdBy
                }
            });
            break;
    }    
}

function generateDate(dateNum: number) {
    const date = new Date(new Date().getTime() + dateNum * 86400000);

    const newDateNum = date.getDate();
    let day = getWeekDay(date.getDay());

    return day + " " + newDateNum;
}

onMounted(() => {
    screenSize.value = getScreenSize();
});

</script>

<template>
    <div class="flex flex-col w-full h-screen" id="draggingTaskHolder" @mousemove="moveCalendarComponents">
        <div class="py-4 shadow-md">
            <div class="px-4">
                <h1>{{ Title }}</h1>
            </div>
            <div class="relative flex justify-center w-full py-3 overflow-hidden">
                <p class="py-0.5 opacity-0">Dates</p>
                <div class="absolute z-5 flex" :style="{left: datesOffset - 5 * columnWidth + 'px'}">
                    <p v-for="date in Math.ceil(screenSize.width * 0.02 + 10)" class="w-14 py-0.5 text-center rounded-md text-gray-500 font-bold"
                    :class="{'bg-red-100': !(date - datesPos - 9), 'text-gray-900': !(date - datesPos - 9)}">
                        {{ generateDate(date - datesPos - 9) }}
                    </p>
                </div>
            </div>
        </div>
        <div class="relative flex-auto min-w-full">
            <CalendarTaskEdit />
            <div class="mt-4">
                <div @mousedown="startCalendarDragging" @mouseleave="endDragging" @mouseup="endDragging" class="grid overflow-hidden cursor-grab select-none" :class="{'cursor-grabbing': draggingValue === Dragging.Calendar}">
                    <div v-for="row in 10" class="relative h-11 mb-0.5 bg-white">
                        <CalendarTask
                            @start-task-left-resize-dragging="startTaskLeftResizeDragging" @start-task-right-resize-dragging="startTaskRightResizeDragging" @start-task-dragging="startTaskDragging"
                            :row="row" :tempDragPos="tempDragPos"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>