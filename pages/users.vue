<script setup lang="ts">

// session token
const sessionToken = getSessionToken();
navigateToInvalidSessionPage(sessionToken);

const profile = await fetchProfile(sessionToken);
const profiles = ref(await fetchAllProfiles());
const profileImages = ref(await fetchAllProfileImages());

const editedProfile = ref({} as ProfileEditOptions);
const deletedProfile = ref({} as Profile);
const showEdit = ref(false);
const showDelete = ref(false);

const editStatus = ref(EditUserStatus.None);

function addNewProfile() {
    editStatus.value = EditUserStatus.Add;

    editedProfile.value = {
        uuid: "",
        name: "",
        email: "",
        password: "",
        pfpPath48: "",
        pfpPath256: ""
    } as ProfileEditOptions; 
    toggleEdit();
}

function editProfile(profile: Profile) {
    editStatus.value = EditUserStatus.Edit;

    editedProfile.value = profile; 
    toggleEdit();
}

function toggleEdit() {
    showEdit.value = !showEdit.value;
}

function deleteProfile(profile: Profile) {
    deletedProfile.value = profile;
    toggleDelete();
}

function toggleDelete() {
    showDelete.value = !showDelete.value;
}

async function refetchProfiles() {
    profiles.value = await fetchAllProfiles();
    profileImages.value = await fetchAllProfileImages();
}
</script>

<template>
    <UsersEdit v-if="showEdit" :profile="profile" :editedProfile="editedProfile" :profiles="profiles" :editStatus="editStatus" @toggleEdit="toggleEdit" @refetchProfiles="refetchProfiles" />
    <UsersConfirmDelete v-if="showDelete" :deletedProfile="deletedProfile" :profiles="profiles" @toggleDelete="toggleDelete" @refetchProfiles="refetchProfiles" />
    <div class="simpleCardBox py-10">
        <div class="card background gap-4 w-5/6 max-h-[100%] h-fit px-6 py-6">
            <div class="flex w-full px-3">
                <button @click="addNewProfile()" class="flex gap-2 px-4 py-2 font-semibold bg-gray-100 hover:bg-gray-200 rounded-md">
                    <SvgAddPerson/>
                    <p>Add new user</p>
                </button>
            </div>
            <div class="card background gap-0 size-full p-3 shadow-none overflow-auto overflow-x-hidden">
                <div v-for="profile in profiles" class="flex items-center gap-3 w-full px-4 py-2 rounded-md odd:bg-gray-100">
                    <img v-if="profileImages![profile.uuid]" :src="'data:image/jpg;base64,' + profileImages![profile.uuid]" class="size-7 rounded-full object-cover">
                    <div class="flex justify-between w-full">
                        <h3>{{ profile.name }}</h3>
                        <div class="flex gap-1">
                            <SvgDelete @click="deleteProfile(profile)" class="size-6 fill-gray-500 hover:fill-red-300 cursor-pointer" />
                            <SvgMore @click="editProfile(profile)" class="size-6 fill-gray-500 hover:fill-gray-900 cursor-pointer" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>