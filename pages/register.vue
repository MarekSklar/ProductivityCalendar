<script lang="ts" setup>

const pName = ref("");
const pEmail = ref("");
const pPassword = ref("");
const pFailed = ref("");

const { handleFileInput, files } = useFileStorage();

const { pending, data: profiles } = useAsyncData(async () => $fetch('/api/profiles/profilesList'));

const addProfile = async () => {
    if(profiles.value === null || pName.value === "" || pEmail.value === "" || pPassword.value === "")
        return;

    const uploadFile = await $fetch('/api/files', {
        method: 'post',
        body: {
            files: files.value
        }
    });

    const profile = await $fetch('/api/profiles/profilesCreate', {
        method: 'post',
        body: {
            name: pName.value,
            email: pEmail.value,
            password: pPassword.value,
        }
    });

    if(profile === undefined)
        pFailed.value = "Your E-Mail is already registered.";
    else
        pFailed.value = "";
};

</script>

<template>
    <main>
        <form @submit.prevent>
            <label for="lname">Name:</label>
            <input v-model="pName" type="text" id="name"><br>

            <label for="email">Email:</label>
            <input v-model="pEmail" type="email" id="email"><br>

            <label for="password">Password:</label>
            <input v-model="pPassword" type="password" id="password"><br>
            
            <label for="image" @input="handleFileInput">Your image:</label>
            <input type="file" id="image"><br>
            <button @click="addProfile">Register</button>
        </form>
        {{ pFailed }}
    </main>
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