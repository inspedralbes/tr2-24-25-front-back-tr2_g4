<template>
    <v-container class="text-center"
    style="height: 100vh; background-color: #99a6e9;">
    <v-row>
      <v-col>
        <h1>Carril de Carreras</h1>
      </v-col>
    </v-row>

    <!-- Carril con 40 casillas en la misma fila -->
    <div class="carril-container" ref="carrilContainer">
      <v-row dense class="d-flex flex-nowrap">
        <v-col
          v-for="(casilla, index) in 40"
          :key="index"
          class="pa-2"
          cols="auto"
          style="min-width: 60px;"
        >
          <v-card
            outlined
            class="pa-3 d-flex justify-center align-center"
            :color="getColor(index)"
          >
            <!-- Muestra el número de la casilla o la imagen si es la casilla activa -->
            <template v-if="index === carril.position">
              <v-avatar size="40">
                <img :src="carril.avatar" alt="Caballo" />
              </v-avatar>
            </template>
            <template v-else>
              <span>{{ index + 1 }}</span>
            </template>

            <!-- Mostrar Bombas y Multiplicadores -->
            <template v-if="isBomb(index)">
              <v-icon color="red">mdi-bomb</v-icon>
            </template>
            <template v-if="isMultiplier(index)">
              <v-icon color="green">mdi-numeric-2</v-icon>
            </template>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Botón para Lanzar Dado -->
    <v-btn color="primary" @click="lanzarDado" class="mt-4" :disabled="girando">
      {{ girando ? "Girando..." : "Lanzar Dado" }}
    </v-btn>

    <!-- Mostrar el Número del Dado -->
    <v-row class="mt-2">
      <v-col>
        <div class="dado" :style="dadoStyle">
          <span v-if="numeroDado !== null" class="numero">{{ numeroDado }}</span>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// Importa el archivo CommunityManager.js
import playerManager from '../services/playerManager.js';

export default {
  mixins: [playerManager],  // Usa CommunityManager como un mixin
};
</script>
  <style scoped>
  /* Estilos para el carril con scroll horizontal */
  .carril-container {
    overflow-x: scroll;
    white-space: nowrap;
    max-width: 100%;
    -ms-overflow-style: none;
    scrollbar-width: none;
    padding-top: 10px;
    padding-bottom: 10px;
  }
  
  .carril-container::-webkit-scrollbar {
    display: none;
  }
  
  .v-col {
    height: 60px;
  }
  
  .v-avatar img {
    width: 100%;
  }
  
  .dado {
    margin: 0 auto;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  }
  
  .numero {
    font-size: 32px;
    font-weight: bold;
    color: white;
  }
  </style>
  