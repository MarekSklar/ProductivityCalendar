<script setup lang="ts">

const tColor = ref("");
const tName = ref("");
const tTag = ref("");
const tFromDay = ref();
const tFromMonth = ref();
const tFromYear = ref();
const tToDay = ref();
const tToMonth = ref();
const tToYear = ref();
const tDescription = ref("");
const tFailed = ref("");

const { data: tasks } = await useFetch('/api/tags/tagsList', { method: 'post' });
const { data: profiles } = await useFetch('/api/profiles/profilesList', { method: 'post' });
const sessionToken = useCookie("sessionToken");

const createTask = async () => {
    if(tasks.value === null || profiles.value == null)
        return;

    let name = "";    
    profiles.value.forEach((profile) => {
        if(profile.sessionToken === sessionToken)
        {
            name = profile.name;
            return;
        }
    });
    
    const createTask = await $fetch('/api/tags/tasksCreate', {
        method: 'post',
        body: {
            color: tColor.value,
            name: tName.value,
            row: 0, // TODO
            status: "To-Do",
            fromDate: { day: tFromDay.value, month: tFromMonth.value, year: tFromYear.value },
            toDate: { day: tToDay.value, month: tToMonth.value, year: tToYear.value },
            createdBy: name,
            assignees: ["sfdfsd", "dfsfsd"], // TODO
            description: tDescription.value
        }
    });

    if(createTask === undefined)   
        tFailed.value = "This tag already exists.";  
    else    
        tFailed.value = "";    
};

</script>

<template>
    <form @submit.prevent>
        <label for="color">Color:</label>
        <input v-model="tColor" type="color" id="color"><br>

        <label for="name">Name:</label>
        <input v-model="tName" type="text" id="name"><br>
        
        <label for="tag">Tag:</label>
        <select name="tag", id="tag">
            <option v-for="task in tasks" :key="task.uuid">
                {{ task.name }}
            </option>
        </select><br>


        <p>From:</p><br>
        <label for="day">Day:</label>
        <input v-model="tFromDay" type="number" id="day">

        <label for="month">Month:</label>
        <input v-model="tFromMonth" type="number" id="month">

        <label for="year">Year:</label>
        <input v-model="tFromYear" type="number" id="year"><br>
        <p>To:</p><br>
        <label for="day">Day:</label>
        <input v-model="tToDay" type="number" id="day">

        <label for="month">Month:</label>
        <input v-model="tToMonth" type="number" id="month">

        <label for="year">Year:</label>
        <input v-model="tToYear" type="number" id="year"><br>


        <label for="description">Description:</label>
        <input v-model="tDescription" type="text" id="description"><br>

        <button @click="createTask">Create</button>
    </form>

    {{ tFailed }}
</template>

<style>
    input {
        border-width: 1px;
        margin: 4px;
    }

    button {
        border-width: 2px;
        padding: 1px;
        margin: 3px;
    }
</style>