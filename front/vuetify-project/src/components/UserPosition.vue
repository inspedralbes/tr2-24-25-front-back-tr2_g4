<template>
    <v-container class="d-flex align-center justify-center" style="height: 100vh; background-color: #99a6e9; position: relative;">
      <!-- Tarjeta principal -->
      <v-card
        elevation="6"
        class="py-12 px-6"
        style="
          background-color: slateblue;     
          color: white;
          width: 45%;
          text-align: center;
          border-radius: 16px;
        "
      >
        <v-card-title class="text-h5 font-weight-bold">POSICIÓN</v-card-title>
  
        <v-card-text class="mt-6" style="margin-top: 20px;">
          <v-card
            elevation="2"
            style="background-color: #2d50a5; color: white; padding: 12px; border-radius: 8px; display: inline-block;"
          >
            2n posición
          </v-card>
        </v-card-text>
  
        <v-divider class="my-6" style="border-color: rgba(255, 255, 255, 0.5);"></v-divider>
  
        <v-card-text class="text-subtitle-2">
          <strong>Sigue así!</strong>
        </v-card-text>
      </v-card>
  
      <!-- Botón de retroceso -->
      <v-btn
        icon
        class="back-button"
        style="
          position: absolute;
          bottom: 16px;
          right: 16px;
          background-color: black;
          color: white;
          border-radius: 50%;
        "
        @click="onBack"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
    </v-container>
  </template>
  
  <script>
  export default {
    name: "SuperDesign",
    methods: {
      onBack() {
        // Acción para el botón de retroceso
        alert("Regresando...");
      },
    },
  };
  </script>
  
  <style scoped>
  .v-card {
    box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease-in-out;
  }
  
  .v-card:hover {
    transform: scale(1.02);
  }
  
  .back-button:hover {
    background-color: #333333;
  }

  </style>
  