<script setup lang="ts">

const tColor = ref("");
const tName = ref("");
const tFailed = ref("");

const { data: tags } = await useFetch('/api/tags/tagsList', { method: 'post' });

const createTag = async () => {
    if(tags.value === null)
        return;

    const createTag = await $fetch('/api/tags/tagsCreate', {
        method: 'post',
        body: {
            color: tColor.value,
            name: tName.value
        }
    });

    if(createTag === undefined)   
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

        <button @click="createTag">Create</button>
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