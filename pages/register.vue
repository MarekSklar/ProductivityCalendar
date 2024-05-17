<script setup>

const pName = ref("");
const pEmail = ref("");
const pPassword = ref("");
const pFailed = ref("");
const files = ref();

const { data: profiles } = await useFetch('/api/profiles/profilesList', { method: 'post' });

function handleFile(e, item) {
  files.value = e.target.files;
}

const addProfile = async () => {
    if(profiles.value === null || pName.value === "" || pEmail.value === "" || pPassword.value === "")
        return;

    const fd = new FormData();
    Array.from(files.value).map((file, index) => {
        fd.append(index, file);
    });

    const upload = await $fetch('/api/upload', {
        method: 'post',
        body: fd,
    });

    if(upload === undefined || upload === null || upload.length === 0)
    {
        pFailed.value = "Invalid format.";
        return;
    }

    const profile = await $fetch('/api/profiles/profilesCreate', {
        method: 'post',
        body: {
            name: pName.value,
            email: pEmail.value,
            password: pPassword.value,
            pfpPath256: upload[0],
            pfpPath48: upload[1],
            pfpPath256Cwd: upload[2],
            pfpPath48Cwd: upload[3],
            sessionToken: "null",
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
            
            <label for="image">Your image:</label>
            <input type="file" id="image" @change="handleFile($event, item)"><br>
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