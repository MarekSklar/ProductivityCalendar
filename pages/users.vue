<script setup lang="ts">

// session token
const sessionToken = getSessionToken();
navigateToInvalidSessionPage(sessionToken);

const profiles = await fetchAllProfiles();
const profileImages = await fetchAllProfileImages();

</script>

<template>
    <div class="simpleCardBox py-10">
        <div class="card w-11/12 max-h-[100%] h-fit px-6 py-8">
            <div class="card gap-0 size-full p-3 shadow-none overflow-auto overflow-x-hidden">
                <div v-for="profile in profiles" class="flex items-center gap-3 w-full p-4 rounded-md odd:bg-gray-100">
                    <img v-if="profileImages![profile.uuid]" :src="'data:image/jpg;base64,' + profileImages![profile.uuid]" class="size-9 rounded-full object-cover">
                    <div class="flex justify-between w-full">
                        <h3>{{ profile.name }}</h3>
                        <SvgMore />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>