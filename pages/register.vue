<script setup>

definePageMeta({
  layout: false,
});

const pName = ref("");
const pEmail = ref("");
const pPassword = ref("");
const pFailed = ref("");
const files = ref();

const profiles = await fetchAllProfiles();

const addProfile = async () => {
    if (profiles === null || pName.value === "" || pEmail.value === "" || pPassword.value === "")
        return;

    let upload;
    // set custom profile image
    if (files.value) {
        upload = await fetchUploadProfileImages(files.value);

        if (upload === undefined || upload === null || upload.length === 0) {
            pFailed.value = "Invalid format.";
            return;
        }
    } else { // set default profile image
        upload[0] = 'default';
        upload[1] = 'default';
    }
    
    const profile = await fetchRegister(
        pName.value,
        pEmail.value,
        pPassword.value,
        upload[0],
        upload[1]
    );

    if (profile === undefined) pFailed.value = "Your E-Mail is already registered.";
    else login(pEmail.value, pPassword.value, profiles); // login
};

</script>

<template>
    <div class="simpleCardBox">
        <div class="card gap-8">
            <h1 class="header text-2xl">Welcome!</h1>
            <div class="flex flex-col justify-center items-center w-full h-full">
                <div class="flex flex-col justify-between">

                    <!-- form -->
                    <form @submit.prevent class="flex flex-col gap-3">
                        <div class="input-box">
                            <label for="lname">Full name<span class="requiredAsterisk">*</span></label>
                            <input v-model="pName" type="text">
                        </div>
                        
                        <div class="input-box">
                            <label for="email">Email<span class="requiredAsterisk">*</span></label>
                            <input v-model="pEmail" type="email">
                        </div>

                        <div class="input-box">
                            <label for="password">Password<span class="requiredAsterisk">*</span></label>
                            <input v-model="pPassword" type="password">
                        </div>
                        
                        <div class="input-box">
                            <label for="image">Your image</label>
                            <input @change="files = handleInputFile($event, item)" type="file" class="file:hidden w-1/2 text-gray-700 cursor-pointer">
                        </div>

                        <!-- submit button -->
                        <div class="flex justify-center w-full">
                            <button @click="addProfile" class="primaryButton w-4/5 mt-4 px-4 py-2">Register</button>
                        </div>
                    </form>

                    <!-- fail message -->
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