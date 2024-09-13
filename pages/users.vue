<script setup lang="ts">

// session token
const sessionToken = getSessionToken();
navigateToInvalidSessionPage(sessionToken);

const profiles = await fetchAllProfiles();
const profileImages = await fetchAllProfileImages();

const editedProfile = ref({} as Profile);
const showEdit = ref(false);

function addNewProfile() {
    toggleEdit();
}

function editProfile(profile: Profile) {
    editedProfile.value = profile; 
    toggleEdit();
}

function toggleEdit() {
    console.log("hehehhehehhehe");
    
    showEdit.value = !showEdit.value;
}

</script>

<template>
    <UsersEdit v-if="showEdit" :editedProfile="editedProfile" @toggleEdit="toggleEdit" />
    <div class="simpleCardBox py-10">
        <div class="card gap-4 w-5/6 max-h-[100%] h-fit px-6 py-6">
            <div class="flex w-full px-3">
                <button @click="addNewProfile()" class="flex gap-2 px-4 py-2 font-semibold bg-gray-100 rounded-md">
                    <SvgAddPerson />
                    <p>Add new user</p>
                </button>
            </div>
            <div class="card gap-0 size-full p-3 shadow-none overflow-auto overflow-x-hidden">
                <div v-for="profile in profiles" @click="editProfile(profile)" class="flex items-center gap-3 w-full px-4 py-2 rounded-md odd:bg-gray-100 cursor-pointer">
                    <img v-if="profileImages![profile.uuid]" :src="'data:image/jpg;base64,' + profileImages![profile.uuid]" class="size-7 rounded-full object-cover">
                    <div class="flex justify-between w-full">
                        <h3>{{ profile.name }}</h3>
                        <button>
                            <SvgMore class="size-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>