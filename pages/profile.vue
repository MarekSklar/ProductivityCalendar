<script setup lang="ts">

// session token
const sessionToken = getSessionToken();
navigateToInvalidSessionPage(sessionToken);

const profile = await fetchProfile(sessionToken);
const profileImage = await fetchProfileImage(profile ? profile.pfpPath256 : "");

</script>

<template>
    <div v-if="sessionToken && sessionToken !== 'null'" class="simpleCardBox">
        <div class="card">
            <div class="flex justify-center items-center gap-6 w-full h-full">
                <img :src="'data:image/' + profileImage.format + ';base64,' + profileImage.data" class="size-36 rounded-full object-cover"/>
                <div class="flex flex-col gap-4">
                    <div class="info-box">
                        <SvgPerson class="info-icon fill-gray-600 dark:fill-gray-100" />
                        <p class="info-text text-gray-600 dark:text-gray-100">{{ profile.name }}</p>
                    </div>
                    <div class="info-box">
                        <SvgRole class="info-icon fill-gray-600 dark:fill-gray-100" />
                        <p class="info-text text-gray-600 dark:text-gray-100"> Admin </p>
                    </div>
                    <div class="info-box">
                        <SvgMail class="info-icon fill-gray-600 dark:fill-gray-100" />
                        <p class="info-text text-gray-600 dark:text-gray-100">{{ profile.email }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else>
        <div>
            <h2>You are not logged in.</h2>
            <div class="p-4 bg-gray-500 text-white">
                <NuxtLink to="/login">Login</NuxtLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.info-box {
    @apply flex items-center gap-4;
}

.info-icon {
    @apply size-7;
}

.info-text {
    @apply text-lg font-semibold;
}

</style>