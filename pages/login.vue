<script setup lang="ts">

const pEmail = ref("");
const pPassword = ref("");
const pFailed = ref("");

const { data: profiles } = await useFetch('/api/profiles/profilesList', { method: 'post' });

const login = async() => {
    if(profiles.value === null)
        return;

    const login = await $fetch(`/api/profiles/login`, {
        method: 'post',
        body: {
            email: pEmail.value,
            password: pPassword.value
        }
    });

    if(login === undefined)
    {
        pFailed.value = "Your E-Mail or password is incorrect.";
    }
    else
    {
        pFailed.value = "";
        const sessionToken = useCookie("sessionToken");
        sessionToken.value = login;
        await navigateTo('/');
    }
};

</script>

<template>
    <main>
        <form @submit.prevent>
            <label for="email">Email:</label>
            <input v-model="pEmail" type="email" id="email"><br>

            <label for="password">Password:</label>
            <input v-model="pPassword" type="password" id="password"><br>

            <button @click="login">Login</button>
        </form>
        {{  pFailed }}
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