<script setup lang="ts">

// session token
const sessionToken = getSessionToken();
navigateToInvalidSessionPage(sessionToken);

const profile = ref(await fetchProfile(sessionToken) as ProfileEditOptions);
const profileImage = ref(await fetchProfileImage(profile ? profile.value.pfpPath256 : ""));

const files = ref();

const changeProfile = async () => {  
    let upload;
    // set custom profile image
    if (files.value) {
        upload = await fetchUploadProfileImages(files.value);

        if (upload === undefined || upload === null || upload.length === 0) return;
    }

    if (!upload) return;
   
    await fetchEditProfile(
        profile.value.uuid,
        profile.value.name,
        profile.value.email,
        profile.value.password as string,
        profile.value.role,
        upload[0],
        upload[1]
    );

    refetchProfileImage();
};

async function refetchProfileImage() {
    console.log(profile ? profile.value.pfpPath256 : "");
    
    profile.value = await fetchProfile(sessionToken) as ProfileEditOptions;
    profileImage.value = (await fetchProfileImage(profile ? profile.value.pfpPath256 : ""));
}
</script>

<template>
    <div v-if="sessionToken && sessionToken !== 'null'" class="simpleCardBox">
        <div class="card background">
            <div class="flex justify-center items-center gap-6 w-full h-full">
                <div class="relative size-36 rounded-full overflow-hidden group">
                    <img :src="'data:image/' + profileImage.format + ';base64,' + profileImage.data" class="size-full rounded-full object-cover"/>
                    <input @change="files = handleInputFile($event); changeProfile()" type="file" class="absolute top-0 z-20 file:hidden m-0 p-0 size-full text-gray-700 opacity-0 cursor-pointer">
                    <div class="absolute z-10 bottom-0 flex justify-center w-full h-1/2 pt-3 bg-gray-900/70 opacity-0 group-hover:opacity-100">
                        <SvgUpload class="size-10 fill-gray-200" />
                    </div>
                </div>
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
                        <SvgMail class="info-icon fill-gray-600" />
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