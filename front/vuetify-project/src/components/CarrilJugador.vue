<template>
  <v-container class="text-center" style="height: 100vh; background-color: #99a6e9;">
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
          style="min-width: 100px; height: 100px;" 
        >
          <v-card
            outlined
            class="pa-3 d-flex justify-center align-center"
            :color="getColor(index)"
            style="height: 100%;" 
          >
            <!-- Muestra el número de la casilla o la imagen si es la casilla activa -->
            <template v-if="index === carril.position">
              <v-avatar size="60" class="d-flex justify-center align-center"> <!-- Cambiamos el tamaño del avatar para que sea consistente -->
                <img :src="carril.avatar" alt="Caballo" />
              </v-avatar>
            </template>
            <template v-else>
              <!-- Mostrar emoticono de bomba o multiplicador si corresponde -->
              <template v-if="isBomb(index)">
                <span class="bomb-text">💣</span>
              </template>
              <template v-else-if="isMultiplier(index)">
                <span class="golden-text">💰</span>
              </template>
              <!-- Si no es bomba ni multiplicador, mostrar el número -->
              <template v-else>
                <span>{{ index + 1 }}</span>
              </template>
            </template>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Dado como botón interactivo -->
    <v-row class="mt-5" align="center" justify="center">
      <v-col cols="auto">
        <div 
          class="dado" 
          :style="dadoStyle" 
          @click="lanzarDado"
          :disabled="girando"
          style="cursor: pointer;"   
        >
          <span 
            v-if="numeroDado !== null" 
            class="numero" 
            :style="numeroDadoStyle"
          >
            {{ numeroDado }}
          </span>
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
  padding-top: 20px;
  padding-bottom: 20px;
}

.carril-container::-webkit-scrollbar {
  display: none;
}

.v-col {
  height: 60px; /* Aseguramos que la casilla tenga una altura constante */
}

.v-avatar img {
  width: 100%;
}

.dado {
  margin-top: 100px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  width: 200px;
  height: 200px;
  background-color: white;
  border-radius: 10px;
  font-size: 72px;
  color: black;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.5s ease, background-color 0.3s ease;
}

.numero {
  font-size: 100px;
  font-weight: bold;
  color: white;
}

/* Estilo para los emoticonos */
.bomb-text {
  font-size: 45px;
  color: red;
}

.golden-text {
  font-size: 45px;
  color: gold;
}
</style>
