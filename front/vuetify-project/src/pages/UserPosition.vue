<template>
    <v-container class="d-flex align-center justify-center" style="height: 100vh; background-color: #99a6e9;">
      <v-card
        elevation="6"
        class="py-12 px-6"
        style="background-color: #4a6fb3; color: white; max-width: 500px; text-align: center; border-radius: 16px;"
      >
        <v-card-title class="text-h5 font-weight-bold">POSICIÓN</v-card-title>
  
        <v-card-text class="text-subtitle-1 mt-4">
          2n posición
        </v-card-text>
  
        <v-divider class="my-4" style="border-color: rgba(255, 255, 255, 0.5);"></v-divider>
  
        <v-card-text class="text-subtitle-2">
          <strong>Sigue así!</strong>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script>
  export default {
    name: "PosicionTab",
  };
  </script>
  
  <style scoped>
  .v-card {
    box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease-in-out;
  }
  
  .v-card:hover {
    transform: scale(1.03);
  }
  </style>
  