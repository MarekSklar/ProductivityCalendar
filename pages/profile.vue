<script setup lang="ts">

// session token
const sessionToken = getSessionToken();
navigateToInvalidSessionPage(sessionToken);

const profile = await fetchProfile(sessionToken);
const profileImage = await fetchProfileImage(profile ? profile.pfpPath256 : "");

</script>

<template>
    <div v-if="sessionToken && sessionToken !== 'null'" class="simpleCardBox">
        <div class="card background">
            <div class="flex justify-center items-center gap-6 w-full h-full">
                <img :src="'data:image/' + profileImage.format + ';base64,' + profileImage.data" class="size-36 rounded-full object-cover"/>
                <div class="flex flex-col gap-4">
                    <div class="info-box">
                        <SvgPerson class="info-icon fill-gray-600" />
                        <p class="info-text text-gray-600">{{ profile.name }}</p>
                    </div>
                    <div class="info-box">
                        <SvgRole class="info-icon fill-gray-600" />
                        <p class="info-text text-gray-600">{{ profile.role }}</p>
                    </div>
                    <div class="info-box">
                        <SvgMail class="info-icon fill-gray-60" />
                        <p class="info-text text-gray-600">{{ profile.email }}</p>
                    </div>
                </div>
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