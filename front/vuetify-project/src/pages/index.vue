<template>
  <v-container class="fill-height d-flex justify-center align-center">

    <component 
      :is="currentComponent" 
      @switch-to-register="showRegisterForm" 
      @switch-to-login="showLoginForm" />
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import LoginForm from "@/components/LoginForm.vue";
import RegisterForm from "@/components/RegisterForm.vue";


const currentComponent = ref(LoginForm);

// Función para cambiar a RegisterForm
const showRegisterForm = () => {
  currentComponent.value = RegisterForm;
};

// Función para cambiar a LoginForm
const showLoginForm = () => {
  currentComponent.value = LoginForm;
};
</script>
