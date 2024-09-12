<script setup lang="ts">

const emit = defineEmits(['closeEdit', 'taskEdited', 'createdTask']);
defineExpose({
    onTaskChange, onInactiveTask, hideEditor, showEditor
});

const props = defineProps({
    sessionToken: String,
    profiles: Object,
    profile: Object,
    pfps: Object
});

const tColor = ref("#977aff");
const tName = ref("");
const tStatus = ref("No status");
const tDateFrom = ref("");
const tDateTo = ref("");
const tAssignees = ref([] as string[]);
const tDescription = ref("");
const tFailed = ref("");

const uuid = ref("");
const createdBy = ref("");
let inactiveTask: InactiveTask;

const profilesActive = ref([] as Profile[]);
const profilesInactive = ref(props.profile as Profile[]);

let editedTask: Task;
let editorVisibility = ref(false);
let nameTimerRunning: boolean = false;
let editTaskTimerRunning: boolean = false;


async function onTaskChange(task: Task) {
    tColor.value = task.color;
    tName.value = task.name;
    tStatus.value = task.status;
    tDateFrom.value = `${task.fromDate.year}-${(task.fromDate.month < 10 ? '0' : '') + (task.fromDate.month).toString()}-${(task.fromDate.day < 10 ? '0' : '') + task.fromDate.day.toString()}`;
    tDateTo.value = `${task.toDate.year}-${(task.toDate.month < 10 ? '0' : '') + (task.toDate.month).toString()}-${(task.toDate.day < 10 ? '0' : '') + task.toDate.day.toString()}`;
    tAssignees.value = task.assignees!;
    tDescription.value = task.description;

    uuid.value = task.uuid;
    createdBy.value = task.createdBy;

    editedTask = task;
}

async function onInactiveTask(task: InactiveTask) {
    tColor.value = "#977aff";
    tName.value = "New";
    tStatus.value = "No status";
    tDateFrom.value = `${task.fromDate.year}-${(task.fromDate.month < 10 ? '0' : '') + (task.fromDate.month).toString()}-${(task.fromDate.day < 10 ? '0' : '') + task.fromDate.day.toString()}`;
    tDateTo.value = `${task.toDate.year}-${(task.toDate.month < 10 ? '0' : '') + (task.toDate.month).toString()}-${(task.toDate.day < 10 ? '0' : '') + task.toDate.day.toString()}`;
    tAssignees.value = [];
    tDescription.value = "";

    uuid.value = "-";
    createdBy.value = "";
    inactiveTask = task;
    editedTask = undefined;
}

async function hideEditor() {
    editorVisibility.value = false;
}

async function showEditor() {
    editorVisibility.value = true;
}

const createTask = async () => {
    if (!props.profiles || !props.profile || !props.sessionToken)
        return;

    let task: Task = await $fetch('/api/tasks/tasksCreate', {
        method: 'post',
        body: {
            color: tColor.value,
            name: tName.value,
            row: inactiveTask.row,
            status: tStatus.value,
            fromDate: inactiveTask.fromDate,
            toDate: inactiveTask.toDate,
            createdBy: props.profile.name,
            assignees: tAssignees.value,
            description: tDescription.value
        }
    });  

    return task;
};

const editName = async () => {
    if (!props.profiles || !props.profile || !props.sessionToken || nameTimerRunning)
        return;

    nameTimerRunning = true;
    setTimeout(async () => {
        nameTimerRunning = false;
        
        if(!editedTask || editedTask === undefined) {
            createTask().then(async (task) => {
                editedTask = task;
                onTaskChange(task); 
                emit("createdTask", task);              
            });
        }
        else {
            const dateFromFormat = tDateFrom.value.split('-');
            const dateToFormat = tDateTo.value.split('-');       
            
            await $fetch('/api/tasks/taskEdit', {
                method: 'post',
                body: {
                    uuid: editedTask.uuid,
                    color: tColor.value,
                    name: tName.value,
                    row: editedTask.row,
                    status: tStatus.value,
                    fromDate: { day: parseInt(dateFromFormat[2]), month: parseInt(dateFromFormat[1]), year: parseInt(dateFromFormat[0]) },
                    toDate: { day: parseInt(dateToFormat[2]), month: parseInt(dateToFormat[1]), year: parseInt(dateToFormat[0]) },
                    createdBy: editedTask.createdBy,
                    assignees: tAssignees.value,
                    description: tDescription.value
                }
            }).then((task) => emit('taskEdited', task)).catch(err => {});  
    }      
    }, 2000);
}

const editTask = async () => { // TODO: [(fix from and to date edits, can be invalid), resized tasks dont have updated time)]
    if (!props.profiles || !props.profile || !props.sessionToken || editTaskTimerRunning)
        return;

    editTaskTimerRunning = true;
    setTimeout(async () => {
        editTaskTimerRunning = false;

        if(!editedTask || editedTask === undefined) {
            createTask().then(async (task) => {
                editedTask = task;
                onTaskChange(task); 
                emit("createdTask", task);              
            });
        }
        else {
            const dateFromFormat = tDateFrom.value.split('-');
            const dateToFormat = tDateTo.value.split('-');       

            await $fetch('/api/tasks/taskEdit', {
                method: 'post',
                body: {
                    uuid: editedTask.uuid,
                    color: tColor.value,
                    name: tName.value,
                    row: editedTask.row,
                    status: tStatus.value,
                    fromDate: { day: parseInt(dateFromFormat[2]), month: parseInt(dateFromFormat[1]), year: parseInt(dateFromFormat[0]) },
                    toDate: { day: parseInt(dateToFormat[2]), month: parseInt(dateToFormat[1]), year: parseInt(dateToFormat[0]) },
                    createdBy: editedTask.createdBy,
                    assignees: tAssignees.value,
                    description: tDescription.value
                }
            }).then((task) => { emit('taskEdited', task)}).catch(err => {});
        }
    }, 50);  
};


function removeProfile(profile: Profile) {
    profilesInactive.value.push(profile);
    profilesActive.value = profilesActive.value.filter(elmnt => elmnt.uuid !== profile.uuid);
    tAssignees.value = [];
    profilesActive.value.forEach(activeProfile => {
        tAssignees.value.push(activeProfile.uuid);
    });
    console.log(profilesActive, profilesInactive);
}

function addProfile(profile: Profile) {
    profilesActive.value.push(profile);
    profilesInactive.value = profilesInactive.value.filter(elmnt => elmnt.uuid !== profile.uuid);

    tAssignees.value.push(profile.uuid);
}

</script>

<template>
    <div v-if="editorVisibility" class="absolute right-0 z-30 w-128 h-full p-4 pl-6 bg-white shadow-lg">
        <div class="flex justify-between">
            <div class="flex items-start pt-1 text-xs font-semibold text-gray-500">
                <span v-if="createdBy === ''" class="mr-0.5 font-bold">Not saved</span> 
                <span v-else class="mr-0.5 font-bold">Created by {{ createdBy }}</span>
                | {{ uuid }}
            </div>
            <div @click="editorVisibility = false; inactiveTask = undefined; emit('closeEdit');">
                <SvgClose class="cursor-pointer"/>
            </div>
        </div>
        <div>
            <form @submit.prevent class="w-2/3">
                <div class="flex gap-2 mt-3 mb-8">
                    <div class="relative size-7 rounded-full" :style="{backgroundColor: tColor}">
                        <input v-model="tColor" type="color" @input="editTask" class="size-full opacity-0 cursor-pointer">
                    </div>
                    <input v-model="tName" type="text" placeholder="Enter task name..." @input="editName" class="text-lg font-semibold text-gray-400 border-none outline-none">
                </div>

                <div class="flex flex-col gap-4">
                    <div>
                        <label for="status">Status:</label>
                        <select v-model="tStatus" @change="editTask">
                            <option v-for="status in Object.values(TaskStatus)">{{ status }}</option>
                        </select>
                    </div>

                    <div class="flex flex-col gap-2 w-full">
                        <div class="flex justify-between gap-2">
                            <label for="dateFrom">From:</label>
                            <input v-model="tDateFrom" type="date" @input="editTask">
                        </div>
                        <div class="flex justify-between gap-2">
                            <label for="dateTo">To:</label>
                            <input v-model="tDateTo" type="date" @input="editTask">
                        </div>
                    </div>

                    <div class="flex flex-col gap-1">
                        <label>Assignees</label>
                        <div class="w-full border-2 border-gray-100 rounded-md">
                            <div class="w-full p-2 rounded-md">
                                <div class="w-full max-h-44 overflow-auto select-none custom-scrollbar">
                                    <ul :class="{ hidden: !profilesActive.length }" class="flex flex-col gap-1">
                                        <li v-for="profile in profilesActive" @click="removeProfile(profile); editTask();" class="flex justify-between items-center text-ellipsis cursor-pointer">
                                            <div class="flex items-center gap-3">
                                                <img v-if="props.pfps![profile.uuid]" :src="'data:image/jpg;base64,' + props.pfps![profile.uuid]" class="size-7 rounded-full object-cover">
                                                <span>{{ profile.name }}</span>
                                            </div>
                                            <SvgCheck class="size-6" />
                                        </li>
                                    </ul>
                                    <div v-if="profilesActive.length > 0" class="h-0.5 my-2 mr-2 bg-gray-200"></div>
                                    <ul class="flex flex-col gap-1">
                                        <li v-if="profilesInactive.length > 0" v-for="profile in profilesInactive" @click="addProfile(profile); editTask();" class="flex items-center gap-3 text-ellipsis cursor-pointer">
                                            <img v-if="props.pfps![profile.uuid]" :src="'data:image/jpg;base64,' + props.pfps![profile.uuid]" class="size-7 rounded-full object-cover">
                                            <span>{{ profile.name }}</span>
                                        </li>
                                        <p v-else>No assignees left</p>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col gap-1">
                        <label for="description">Description:</label>
                        <input v-model="tDescription" type="text" @input="editTask">
                    </div>
                </div>
            </form>

            {{ tFailed }}
        </div>
    </div>
</template>

<style scoped>
label {
    @apply font-semibold text-gray-600;
}

.custom-scrollbar::-webkit-scrollbar {
    @apply w-[0.25rem];
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-gray-300 rounded-md;
}

.custom-scrollbar::-webkit-scrollbar-track {
    @apply hidden;
}
</style>