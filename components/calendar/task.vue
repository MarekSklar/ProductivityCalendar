<script setup lang="ts">

const emit = defineEmits(['startTaskExtensionDragging', 'startTaskDragging']);

const props = defineProps({
    row: Number,
    tempDragPos: Number
});

const { data: tasks } = await useFetch('/api/tasks/tasksList', { method: 'post' });
let pfpMap = new Map<string, string>();

// xdd reseni
let iMax = 0;
tasks.value?.forEach((task) => {
    task.assignees.forEach((assignee : string) => {
        iMax++
    });
});

let i = 0;
tasks.value?.forEach((task) => {
    task.assignees.forEach(async (assignee : string) => {
        if(!pfpMap.has(assignee))
        {
            const profile = await $fetch('/api/profiles/profileGetByUUID', { method: 'post', body: { uuid: assignee }});
            const pfp: string = await $fetch('/api/getImage', { method: 'post', body: { path: profile?.at(0).pfpPath48 }});
            pfpMap.set(assignee, pfp);
        }        
        i++;
        if(i === iMax)
        {
            await refreshNuxtData(); 
        }
    });
});

let draggingLeft = false;
let draggingLeftStart = 0;
function taskDragLeft(task: Task, e: MouseEvent) {
    draggingLeft = true;
    draggingLeftStart = e.screenX;
}

function taskUndragLeft(e: MouseEvent) {
    draggingLeft = false;
}

function onMouseMove(task: Task, e: MouseEvent) {
    if(draggingLeft) {
        console.log(e.screenX);
        if(draggingLeftStart - e.screenX > 5)
            task.fromDate.day -= 1;
    }
}

function taskPlacementPos(task: Task) {
    const todayDayTimestamp = Math.floor(new Date().getTime() / 86400000);
    const taskStartDayTimestamp = Math.floor(new Date(task.fromDate.year, task.fromDate.month - 1, task.fromDate.day).getTime() / 86400000) + 4;
    const taskEndDayTimestamp = Math.floor(new Date(task.toDate.year, task.toDate.month - 1, task.toDate.day).getTime() / 86400000) + 4 + 1;
    
    const taskLength = taskEndDayTimestamp - taskStartDayTimestamp;
    const timeFromToday = taskStartDayTimestamp - todayDayTimestamp;

    return {from: timeFromToday, to: timeFromToday + taskLength, taskLength};
}

</script>

<template>
    <div>
        <div v-for="task in tasks?.filter(task => task.row === row!-1)" @mousedown="emit('startTaskDragging', null)" class="absolute flex h-full left-5 rounded-md"
        :style="{ backgroundColor: task.color, left: tempDragPos! + (taskPlacementPos(task).from)*56 + 'px', width: taskPlacementPos(task).taskLength*56 + 'px' }">
            <div class="size-full">
                <div @mousedown="(event) => taskDragLeft(task, event)" @mouseup="(event) => taskUndragLeft(event)" class="absolute left-0 z-20 w-3 h-full cursor-e-resize"></div>
                <div @mousemove="(event) => onMouseMove(task, event)" class="w-full h-full absolute"></div>
                <div @mousedown="emit('startTaskExtensionDragging', null)" class="absolute right-0 z-20 w-3 h-full cursor-e-resize"></div>
                <div class="size-full p-1 pl-2">
                    <div class="relative size-full">
                        <div class="flex items-center h-full">
                            <h3 class="leading-none select-none">{{ task.name }}</h3>
                        </div>
                        <div class="absolute flex items-center h-full right-1 top-0">
                            <div class="relative size-8 select-none">
                                <img v-for="num in Math.min(task.assignees.length, 3)" :src="'data:image/jpg;base64,' + pfpMap.get(task.assignees[num-1])" class="absolute size-full rounded-full object-cover" :style="{ right: (num-1)*1.4 + 'rem', 'z-index': num+10 }" draggable="false">
                            </div>
                        </div>                
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>