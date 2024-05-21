<script setup lang="ts">

const tColor = ref("");
const tName = ref("");
const tStatus = ref("To-Do");
const tDateFrom = ref("")
const tDateTo = ref("");
const tAssignees = ref([""]);
const tDescription = ref("");
const tFailed = ref("");

const sessionToken = useCookie<string>('sessionToken');
const { data: profiles } = await useFetch('/api/profiles/profilesList', { method: 'post' });
const { data: profileData } = await useFetch('/api/profiles/profileGet', { method: 'post', body: { sessionToken: sessionToken.value }});
const profile = profileData.value?.at(0);

const createTask = async () => {
    if(!profiles.value || !profile || !sessionToken.value)
        return;

    const dateFromFormat = tDateFrom.value.split('-');
    const dateToFormat = tDateTo.value.split('-');
    const task = await $fetch('/api/tasks/tasksCreate', {
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
};

</script>
<template>
    <div class="absolute right-0 z-20 w-128 h-full p-4 pl-6 bg-white shadow-lg">
        <div class="flex justify-between">
            <div class="flex items-center">
                <form @submit.prevent>
                    <input v-model="tColor" type="color" id="color">
                    <label for="name">Name:</label>
                    <input v-model="tName" type="text" id="name"><br>

                    <label for="status">Status:</label>
                    <select v-model="tStatus" name="status" id="status">
                        <option>To-Do</option>
                        <option>No status</option>
                        <option>In progress</option>
                        <option>Blocked</option>
                        <option>Done.</option>
                    </select><br>

                    <label for="dateFrom">From:</label>
                    <input v-model="tDateFrom" type="date" id="dateFrom"><br>
                    
                    <label for="dateTo">From:</label>
                    <input v-model="tDateTo" type="date" id="dateTo"><br>

                    <br>
                    <label for="assignee">Assignee:</label>
                    <select v-model="tAssignees" name="assignee" id="assignee" multiple>
                        <option v-for="profile in profiles" :key="profile.uuid" :value="profile.uuid">
                            {{ profile.name }}
                        </option>
                    </select><br>
                    <br>

                    <label for="description">Description:</label>
                    <input v-model="tDescription" type="text" id="description"><br>

                    <button @click="createTask">Add task</button>
                </form>

                {{ tFailed }}
            </div>
            <div>
                <SvgClose class="cursor-pointer"/>
            </div>
        </div>
    </div>
</template>

<style scoped>
main{
    font-family: 'Roboto Mono', monospace;
    font-size: 20px;
    
}
    input {
        border-width: 1px;
        margin: 4px;
    }

    button {
        border-width: 1.5px;
        padding: 1px;
        margin: 3px;
        background-color: rgb(140, 202, 221);
    }
</style>