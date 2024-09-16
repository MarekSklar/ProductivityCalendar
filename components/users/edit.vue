<script lang="ts" setup>

const emit = defineEmits(['toggleEdit']);

const props = defineProps({
  editedProfile: Object,
  profiles: Object
});

const pName = ref(props.editedProfile?.name ? props.editedProfile?.name : "");
const pEmail = ref(props.editedProfile?.email ? props.editedProfile?.email : "") as globalThis.Ref<string, string>;
const pPassword = ref(props.editedProfile?.password ? props.editedProfile?.password : "");
const pRole = ref(false); // TODO in profile is no admin role
const files = ref();
const pFailed = ref("");

const addProfile = async () => {
  const firstEmailPart = pEmail.value.split("@")[0];
  const SecondEmailPart = pEmail.value.split("@")[1]?.split(".")[0] === undefined ? "" : pEmail.value.split("@")[1]?.split(".")[0];
  const ThirdEmailPart = pEmail.value.split("@")[1]?.split(".")[1] === undefined ? "" : pEmail.value.split("@")[1]?.split(".")[1];

  if (props.profiles === null) {pFailed.value = "Something went wrong..."; return}
  else if (pName.value === "") {pFailed.value = "Name is required."; return}
  else if (pEmail.value.split('').filter(char => char === "@").length !== 1 || pEmail.value.split('').filter(char => char === ".").length !== 1 || firstEmailPart?.length < 1 || SecondEmailPart?.length < 1 || ThirdEmailPart?.length < 1) {pFailed.value = "Enter E-mail in the right format."; return}
  else if (pEmail.value === "") {pFailed.value = "E-mail is required."; return}
  else if (pPassword.value === "") {pFailed.value = "Password is required."; return}
  

  let upload;
  // set custom profile image
  if (files.value) {
    upload = await fetchUploadProfileImages(files.value);

    if (upload === undefined || upload === null || upload.length === 0) {
      pFailed.value = "Invalid format.";
      return;
    }
  } else { // set default profile image       
    upload = [];
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
};
</script>

<template>
  <div @click="emit('toggleEdit')" class="absolute w-screen h-screen bg-black bg-opacity-20"></div>
  <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
    <div class="card bg-white">
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
          <input @change="files = handleInputFile($event)" type="file" class="file:hidden w-1/2 text-gray-700 cursor-pointer">
        </div>

        <div class="input-box">
          <label for="adimRole">Admin role</label>
          <label class="w-1/2 inline-flex items-center cursor-pointer">
            <input v-model="pRole" type="checkbox" class="sr-only peer">
            <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:size-5 after:transition-all peer-checked:bg-red-400"></div>
          </label>
        </div>

        <!-- fail message -->
        <p class="text-center text-red-600">{{ pFailed }}</p>

        <!-- submit button -->
        <div class="flex justify-center w-full">
          <button @click="addProfile" class="primaryButton w-4/5 mt-4 px-4 py-2">Save changes</button>
        </div>
      </form>
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