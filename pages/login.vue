<script setup lang="ts">

definePageMeta({
  layout: false
});

const pEmail = ref("");
const pPassword = ref("");
const pFailed = ref("");

const profiles = await fetchAllProfiles();

async function loginLocal() {
    pFailed.value = await login(pEmail.value, pPassword.value, profiles);
}
</script>

<template>
    <div class="simpleCardBox">
        <div class="card gap-8">
            <h1 class="header text-2xl">Welcome back!</h1>
            <div class="flex flex-col justify-center items-center w-full h-full">
                <div class="flex flex-col justify-between">

                    <!-- form -->
                    <form @submit.prevent class="flex flex-col gap-3">
                        <div class="input-box">
                            <label for="email">Email<span class="requiredAsterisk">*</span></label>
                            <input v-model="pEmail" type="email" class="border-2 border-gray-200 rounded-md">
                        </div>

                        <div class="input-box">
                            <label for="password">Password<span class="requiredAsterisk">*</span></label>
                            <input v-model="pPassword" type="password">
                        </div>

                        <!-- submit button -->
                        <div class="flex justify-center w-full">
                            <button @click="loginLocal()" class="primaryButton w-4/5 mt-4 px-4 py-2">Login</button>
                        </div>
                        
                    </form>

                    <!-- fail message -->
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