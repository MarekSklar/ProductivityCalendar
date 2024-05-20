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
main{
    margin-left: 40%;
    margin-top: 25%;
    font-family: 'Roboto Mono', monospace;
    font-size: 20px;

}
    input {
        border-width: 1.5px;
        margin: 5px;
        border-radius: 5px;
    }

    button {
        border-width: 1.5px;
        padding: 5px;
        margin: 3px;
        margin-left: 15%;
        margin-top: 4%;
        border-radius: 5px;
        font-size: 18px;
        background-color:rgb(140, 202, 221);
    }

    .password{
        font-size: 15px;
        color: rgb(7, 24, 99);
       
    }

</style>