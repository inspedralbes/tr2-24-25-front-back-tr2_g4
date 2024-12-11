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
              <v-avatar size="60" class="d-flex justify-center align-center">
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

    <!-- Mostrar la pregunta actual -->
    <v-row class="mt-3" align="center" justify="center" v-if="preguntaActiva">
      <v-col cols="12">
        <h2>{{ preguntaActual.text_pregunta }}</h2>
      </v-col>
    </v-row>

    <p v-if="mensajeRespuesta" class="mensaje-respuesta">{{ mensajeRespuesta }}</p>

    <div v-if="preguntaActiva" class="opciones-container">
      <div v-for="(opcion, index) in opcionesRespuesta" :key="index" class="opcion" 
        @click="verificarRespuesta(opcion)" :style="getOpcionColor(index)">
        {{ opcion }}
      </div>
    </div>


  </v-container>
</template>

<script>
import playerManager from '../services/playerManager.js';

export default {
  mixins: [playerManager],
};
</script>

<style scoped>
/* Estilo del carril con scroll horizontal */
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

/* Estilo para los elementos dentro del carril */
.v-col {
  height: 60px;
}

.v-avatar img {
  width: 100%;
}

/* Estilo para el dado (botón interactivo) */
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

/* Estilos para los emoticonos de bomba y multiplicador */
.bomb-text {
  font-size: 45px;
  color: red;
}

.golden-text {
  font-size: 45px;
  color: gold;
}

/* Estilo para el contenedor de las opciones de respuesta */
.opciones-container {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 10px;
  width: 80%;
  max-width: 500px;
}

/* Estilo para cada opción de respuesta */
.opcion {
  color: white;
  font-size: 18px;
  font-weight: bold;
  border-radius: 12px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.2);
  text-align: center;
  padding: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  padding: 20%;
}

.mensaje-respuesta {
  font-size: 24px;  
  font-weight: bold;
  color: white; 
  margin-top: 20px; 
  text-align: center; 
}
</style>
