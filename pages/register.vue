<script setup>

definePageMeta({
  layout: false,
});

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

    if(files.value) {
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
    }
    else {
        upload[0] = 'default';
        upload[1] = 'default';
    }
    

    const profile = await $fetch('/api/profiles/profilesCreate', {
        method: 'post',
        body: {
            name: pName.value,
            email: pEmail.value,
            password: pPassword.value,
            pfpPath256: upload[0],
            pfpPath48: upload[1],
            sessionToken: "null",
        }
    });
    if(profile === undefined)
        pFailed.value = "Your E-Mail is already registered.";
    else
    {
        pFailed.value = "";

        await navigateTo('/login');
    }
};

</script>

<template>
    <div class="flex items-center justify-center w-screen h-screen bg-gray-50">
        <div class="flex flex-col items-center gap-8 px-20 py-12 rounded-xl shadow-lg bg-white">
            <h1 class="text-2xl text-gray-700 font-bold">Welcome!</h1>
            <div class="flex flex-col justify-center items-center w-full h-full">
                <div class="flex flex-col justify-between">
                    <form @submit.prevent class="flex flex-col gap-3">
                        <div class="input-box">
                            <label for="lname">Full name:</label>
                            <input v-model="pName" type="text">
                        </div>
                        
                        <div class="input-box">
                            <label for="email">Email:</label>
                            <input v-model="pEmail" type="email">
                        </div>

                        <div class="input-box">
                            <label for="password">Password:</label>
                            <input v-model="pPassword" type="password">
                        </div>
                        
                        <div class="input-box">
                            <label for="image">Your image:</label>
                            <input @change="handleFile($event, item)" type="file" class="file:hidden w-1/2 text-gray-700 cursor-pointer">
                        </div>

                        <div class="flex justify-center w-full">
                            <button @click="addProfile" class="w-4/5 mt-5 px-4 py-1 rounded-md bg-gray-400 hover:bg-gray-500 text-white">Register</button>
                        </div>
                    </form>
                    {{ pFailed }}
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.input-box {
    @apply flex items-center justify-between;
}

input {
    @apply w-1/2 ml-3 px-2 border-2 border-gray-200 rounded-md;
}
</style>