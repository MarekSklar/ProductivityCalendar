<script setup lang="ts">

const tColor = ref("");
const tName = ref("");
const tTag = ref("");
const tDay = ref("");
const tMonth = ref("");
const tYear = ref("");
const tDescription = ref("");
const tFailed = ref("");

const { pending, data: tags } = useAsyncData(async () => $fetch('/api/tags/tagsList'));

const createTask = async () => {

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
            <option v-for="tag in tags" :key="tag.uuid">
                {{ tag.name }}
            </option>
        </select><br>

        <label for="day">Day:</label>
        <input v-model="tDay" type="number" id="day">

        <label for="month">Month:</label>
        <input v-model="tMonth" type="number" id="month"><br>

        <label for="year">Year:</label>
        <input v-model="tYear" type="number" id="year"><br>

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