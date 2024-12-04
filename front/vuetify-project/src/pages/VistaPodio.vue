<template>
    <v-app>
      <v-container class="d-flex justify-center align-center" style="height: 100vh; background-color: #99a6e9;">
        <v-row class="d-flex justify-center align-items-end" no-gutters>
          <!-- Primer lugar (en el centro y más alto) -->
        
  
          <!-- Segundo lugar (a la izquierda y más bajo) -->
          <v-col
            cols="12" sm="4" class="d-flex justify-center align-center"
            style="position: relative; margin-bottom: 20px; padding-bottom: 0;"
          >
            <v-card class="elevation-20" max-width="300" style="background-color: silver; height: 400px;">
              <v-card-title class="text-center font-weight-bold text-white" style="font-size: 24px;">
                2° LUGAR
              </v-card-title>
              <v-card-subtitle class="text-center text-white" style="font-size: 20px;">
                USUARIO 2
              </v-card-subtitle>
            </v-card>
          </v-col>
  
          <v-col
            cols="12" sm="4" class="d-flex justify-center align-center"
            style="position: relative; margin-bottom: 20px; padding-bottom: 0;"
          >
            <v-card class="elevation-24" max-width="300" style="background-color: gold; height: 500px;">
              <v-card-title class="text-center font-weight-bold text-white" style="font-size: 24px;">
                1° LUGAR
              </v-card-title>
              <v-card-subtitle class="text-center text-white" style="font-size: 20px;">
                USUARIO 1
              </v-card-subtitle>
            </v-card>
          </v-col>

          <!-- Tercer lugar (a la derecha y el más bajo) -->
          <v-col
            cols="12" sm="4" class="d-flex justify-center align-center"
            style="position: relative; margin-bottom: 20px; padding-bottom: 0;"
          >
            <v-card class="elevation-16" max-width="300" style="background-color: #cd7f32; height: 300px;">
              <v-card-title class="text-center font-weight-bold text-white" style="font-size: 24px;">
                3° LUGAR
              </v-card-title>
              <v-card-subtitle class="text-center text-white" style="font-size: 20px;">
                USUARIO 3
              </v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-app>
  </template>
  
  <script>
  export default {
    name: "Podium",
  };
  </script>
  
  <style scoped>
  .v-card {
    position: relative;
  }
  
  .v-avatar {
    border: 5px solid white;
  }
  </style>
  