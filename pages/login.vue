<script setup lang="ts">

definePageMeta({
  layout: false
});

const pEmail = ref("");
const pPassword = ref("");
const pFailed = ref("");

const { data: profiles } = await useFetch('/api/profiles/profilesList', { method: 'post' });

const login = async() => {
    if (profiles.value === null)
        return;

    const login = await $fetch(`/api/profiles/login`, {
        method: 'post',
        body: {
            email: pEmail.value,
            password: pPassword.value
        }
    });

    if (login === undefined) {
        pFailed.value = "Your E-Mail or password is incorrect.";
    }
    else {
        pFailed.value = "";
        const sessionToken = useCookie("sessionToken");
        sessionToken.value = login;
        await navigateTo('/');
    }
};

</script>

<template>
    <div class="flex items-center justify-center w-screen h-screen bg-gray-50">
        <div class="flex flex-col items-center gap-8 px-20 py-12 rounded-xl shadow-lg bg-white">
            <h1 class="text-2xl text-gray-700 font-bold">Welcome back!</h1>
            <div class="flex flex-col justify-center items-center w-full h-full">
                <div class="flex flex-col justify-between">
                    <form @submit.prevent class="flex flex-col gap-3">
                        <div class="input-box">
                            <label for="email">Email<span class="ml-1 font-semibold text-red-300">*</span></label>
                            <input v-model="pEmail" type="email" class="border-2 border-gray-200 rounded-md">
                        </div>

                        <div class="input-box">
                            <label for="password">Password<span class="ml-1 font-semibold text-red-300">*</span></label>
                            <input v-model="pPassword" type="password">
                        </div>

                        <div class="flex justify-center w-full">
                            <button @click="login" class="w-4/5 mt-5 px-4 py-1 rounded-md bg-gray-400 hover:bg-gray-500 text-white">Login</button>
                        </div>
                        
                    </form>
                    {{ pFailed }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.input-box {
    @apply flex items-center justify-between;
}

input {
    @apply ml-3 px-2 border-2 border-gray-200 rounded-md;
}

</style>