<script setup lang="ts">

// session token
const sessionToken = getSessionToken();

const profile = await fetchProfile(sessionToken);
const profileImage = await fetchProfileImage(profile ? profile.pfpPath48 : "");

const sidebarIsActive = ref(false);

function logout() {
    useCookie('sessionToken').value = null;
    navigateTo('/invalidSession');
}
</script>

<template>
    <div v-if="sessionToken && sessionToken !== 'null'">

        <!-- open sidebar -->
        <div @click="sidebarIsActive = true" class="absolute top-1/2 left-3 z-40 rounded-full bg-gray-100 cursor-pointer">
            <SvgChevronRight class="size-10 fill-gray-600" />
        </div>
        
        <!-- backdrop -->
        <div v-if="sidebarIsActive" @click="sidebarIsActive = false" class="absolute z-40 w-screen h-screen bg-black bg-opacity-20"></div>
        
        <!-- sidebar -->
        <div v-if="sidebarIsActive" class="absolute z-50 w-56 h-full bg-white">
            <div class="relative size-full p-5">
                <div class="flex flex-col justify-between h-full">

                    <!-- navigation -->
                    <div>
                        <h2 class="mb-7 font-bold text-gray-500">Productivity calendar</h2>
                        <div class="flex flex-col gap-5">
                            <NuxtLink to="/" @click="sidebarIsActive = false" class="group link-box">
                                <SvgCalendar class="icon" />
                                <p class="link-text">Calendar</p>
                            </NuxtLink>
                            <NuxtLink to="/users" @click="sidebarIsActive = false" class="group link-box">
                                <SvgGroup class="icon" />
                                <p class="link-text">Users</p>
                            </NuxtLink>
                            <div @click="toggleDark()" class="group link-box">
                                <SvgModeDark class="icon" />
                                <p class="link-text">Dark mode</p>
                            </div>
                            <NuxtLink to="/" @click="sidebarIsActive = false; logout()" class="group link-box">
                                <SvgLogout class="icon" />
                                <p class="link-text">Logout</p>
                            </NuxtLink>
                        </div>
                    </div>

                    <!-- profile -->
                    <div>
                        <NuxtLink to="/profile" @click="sidebarIsActive = false" class="group link-box">
                            <img class="size-10 rounded-full object-cover" :src="'data:image/' + profileImage.format + ';base64,' + profileImage.data">
                            <p class="link-text">{{ profile.name }}</p>
                        </NuxtLink>
                    </div>
                </div>

                <!-- close sidebar -->
                <div @click="sidebarIsActive = false" class="absolute top-1/2 -right-14 z-30 rounded-full bg-gray-50 cursor-pointer">
                    <SvgChevronRight class="size-10 rotate-180 fill-gray-500" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.link-box {
    @apply flex items-center gap-2 text-gray-600 cursor-pointer;
}

.icon {
    @apply size-5 fill-gray-400 group-hover:fill-gray-950;
}

.link-text {
    @apply font-semibold group-hover:text-gray-950;
}

</style>