<script setup lang="ts">

const emit = defineEmits(['closeEdit', 'taskEdited']);

const tColor = ref("#977aff");
const tName = ref("");
const tStatus = ref("No status");
const tDateFrom = ref("");
const tDateTo = ref("");
const tAssignees = ref([] as string[]);
const tDescription = ref("");
const tFailed = ref("");

const profilesActive = ref([] as Profile[]);
const profilesInactive = ref([] as Profile[]);

const props = defineProps({
    editedTask: { 
        type: Object as PropType<Task>,
        deep: true
    }
});

function onTaskChange(task: Task) {
    const fromDate = new Date(task.fromDate.year, task.fromDate.month - 1, task.fromDate.day);
    const toDate = new Date(task.toDate.year, task.toDate.month - 1, task.toDate.day);
    
    tColor.value = task.color;
    tName.value = task.name;
    tStatus.value = task.status;
    tDateFrom.value = `${fromDate.getFullYear()}-${(fromDate.getMonth() < 10 ? '0' : '') + (fromDate.getMonth()+1).toString()}-${(fromDate.getDate() < 10 ? '0' : '') + fromDate.getDate().toString()}`
    tDateTo.value = `${toDate.getFullYear()}-${(toDate.getMonth() < 10 ? '0' : '') + (toDate.getMonth()+1).toString()}-${(toDate.getDate() < 10 ? '0' : '') + toDate.getDate().toString()}`;
    tAssignees.value = task.assignees!;
    tDescription.value = task.description;
}

const editTask = async () => {
    if (!profiles.value || !profile || !sessionToken.value)
        return;

    const dateFromFormat = tDateFrom.value.split('-');
    const dateToFormat = tDateTo.value.split('-');       

    await $fetch('/api/tasks/tasksEdit', {
        method: 'post',
        body: {
            uuid: props.editedTask!.uuid,
            color: tColor.value,
            name: tName.value,
            row: props.editedTask!.row,
            status: tStatus.value,
            fromDate: { day: dateFromFormat[2], month: dateFromFormat[1], year: dateFromFormat[0] },
            toDate: { day: dateToFormat[2], month: dateToFormat[1], year: dateToFormat[0] },
            createdBy: props.editedTask!.createdBy,
            assignees: tAssignees.value,
            description: tDescription.value
        }
    }).then((task) => { emit('taskEdited', task); onTaskChange(task!); });    
};


watch(() => props.editedTask, () => {
    onTaskChange(props.editedTask!);
}, { deep: true });

const sessionToken = useCookie<string>('sessionToken');
const { data: profiles } = await useFetch('/api/profiles/profilesList', { method: 'post' });
profilesInactive.value = profiles.value as Profile[];
const { data: profileData } = await useFetch('/api/profiles/profileGet', { method: 'post', body: { sessionToken: sessionToken.value }});
const profile = profileData.value?.at(0);

/*
const createTask = async () => {
    if(!profiles.value || !profile || !sessionToken.value)
        return;

    const dateFromFormat = tDateFrom.value.split('-');
    const dateToFormat = tDateTo.value.split('-');
    
    await $fetch('/api/tasks/tasksCreate', {
        method: 'post',
        body: {
            color: tColor.value,
            name: tName.value,
            row: 0, // TODO
            status: tStatus.value,
            fromDate: { day: dateFromFormat[2], month: dateFromFormat[1], year: dateFromFormat[0] },
            toDate: { day: dateToFormat[2], month: dateToFormat[1], year: dateToFormat[0] },
            createdBy: profile.name,
            assignees: tAssignees.value,
            description: tDescription.value
        }
    });
};*/


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

const { data: pfps } = await useFetch('/api/getAllImages', { method: 'post' });
</script>

<template>
    <div class="absolute right-0 z-20 w-128 h-full p-4 pl-6 bg-white shadow-lg">
        <div class="flex justify-between">
            <div class="flex items-start pt-1 text-xs font-semibold text-gray-500">
                <span class="mr-0.5 font-bold">Created by {{ props.editedTask?.createdBy }}</span> | {{ props.editedTask?.uuid }}
            </div>
            <div @click="emit('closeEdit')">
                <SvgClose class="cursor-pointer"/>
            </div>
        </div>
        <div>
            <form @submit.prevent class="w-2/3">
                <div class="flex gap-2 mt-3 mb-8">
                    <div class="relative size-7 rounded-full" :style="{backgroundColor: tColor}">
                        <input v-model="tColor" type="color" @input="editTask" class="size-full opacity-0 cursor-pointer">
                    </div>
                    <input v-model="tName" type="text" placeholder="Enter task name..." @input="editTask" class="text-lg font-semibold text-gray-400 border-none outline-none">
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
                                                <img v-if="pfps![profile.uuid]" :src="'data:image/jpg;base64,' + pfps![profile.uuid]" class="size-7 rounded-full object-cover">
                                                <span>{{ profile.name }}</span>
                                            </div>
                                            <SvgCheck class="size-6" />
                                        </li>
                                    </ul>
                                    <div v-if="profilesActive.length > 0" class="h-0.5 my-2 mr-2 bg-gray-200"></div>
                                    <ul class="flex flex-col gap-1">
                                        <li v-if="profilesInactive.length > 0" v-for="profile in profilesInactive" @click="addProfile(profile); editTask();" class="flex items-center gap-3 text-ellipsis cursor-pointer">
                                            <img v-if="pfps![profile.uuid]" :src="'data:image/jpg;base64,' + pfps![profile.uuid]" class="size-7 rounded-full object-cover">
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