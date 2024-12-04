<template>
    <v-app>
      <v-container class="d-flex justify-center align-center" style="height: 100vh; background-color: #99a6e9;">
        <v-row class="d-flex justify-center align-center" no-gutters>
          <!-- Primer lugar -->
          <v-col
            cols="12" sm="4" class="d-flex justify-center align-center"
            style="position: relative; margin-bottom: 20px;"
          >
            <v-card class="elevation-24" max-width="300" style="background-color: gold;">
              <v-img
                src="https://www.example.com/trophy-gold.png" alt="Primer Lugar"
                height="200px"
              ></v-img>
              <v-card-title class="text-center font-weight-bold text-white" style="font-size: 24px;">
                1° LUGAR
              </v-card-title>
              <v-card-subtitle class="text-center text-white" style="font-size: 20px;">
                USUARIO 1
              </v-card-subtitle>
            </v-card>
            <v-avatar size="50" class="d-flex justify-center align-center" style="position: absolute; top: 15%; left: 50%; transform: translateX(-50%);">
              <v-img src="https://www.example.com/user1-avatar.png" alt="Usuario 1"></v-img>
            </v-avatar>
          </v-col>
  
          <!-- Segundo lugar -->
          <v-col
            cols="12" sm="4" class="d-flex justify-center align-center"
            style="position: relative; margin-bottom: 20px;"
          >
            <v-card class="elevation-20" max-width="300" style="background-color: silver;">
              <v-img
                src="https://www.example.com/trophy-silver.png" alt="Segundo Lugar"
                height="200px"
              ></v-img>
              <v-card-title class="text-center font-weight-bold text-white" style="font-size: 24px;">
                2° LUGAR
              </v-card-title>
              <v-card-subtitle class="text-center text-white" style="font-size: 20px;">
                USUARIO 2
              </v-card-subtitle>
            </v-card>
            <v-avatar size="50" class="d-flex justify-center align-center" style="position: absolute; top: 15%; left: 50%; transform: translateX(-50%);">
              <v-img src="https://www.example.com/user2-avatar.png" alt="Usuario 2"></v-img>
            </v-avatar>
          </v-col>
  
          <!-- Tercer lugar -->
          <v-col
            cols="12" sm="4" class="d-flex justify-center align-center"
            style="position: relative; margin-bottom: 20px;"
          >
            <v-card class="elevation-16" max-width="300" style="background-color: #cd7f32;">
              <v-img
                src="https://www.example.com/trophy-bronze.png" alt="Tercer Lugar"
                height="200px"
              ></v-img>
              <v-card-title class="text-center font-weight-bold text-white" style="font-size: 24px;">
                3° LUGAR
              </v-card-title>
              <v-card-subtitle class="text-center text-white" style="font-size: 20px;">
                USUARIO 3
              </v-card-subtitle>
            </v-card>
            <v-avatar size="50" class="d-flex justify-center align-center" style="position: absolute; top: 15%; left: 50%; transform: translateX(-50%);">
              <v-img src="https://www.example.com/user3-avatar.png" alt="Usuario 3"></v-img>
            </v-avatar>
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
  