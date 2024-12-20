<template>
  <v-app>
    <!-- Barra superior -->
    <v-app-bar color="black" dark flat>
      <v-toolbar-title class="title-center">GMaths - Carriles de la Carrera</v-toolbar-title>
    </v-app-bar>

    <!-- Contenedor principal con ajuste de padding para el contenido -->
    <v-container class="text-center" style="height: 100vh; background-color: #99a6e9; padding-top: 60px;">
      <v-row>
        <v-col>
        </v-col>
      </v-row>

      <!-- Mostrar cada carril de los jugadores -->
      <div v-for="carrilData in carriles" :key="carrilData.name" class="carril-container">
        <h2>{{ carrilData.name }}</h2>
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
              :color="getColor(index, carrilData.position)"
              style="height: 100%;" 
            >
              <!-- Muestra el número de la casilla o la imagen si es la casilla activa -->
              <template v-if="index === carrilData.position">
                <v-avatar size="60" class="d-flex justify-center align-center">
                  <span class="caballo" :style="{ transform: 'rotateY(180deg)', fontSize: '30px' }">🏇</span>
                </v-avatar>
              </template>
              <template v-else>
                <span>{{ index + 1 }}</span>
              </template>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </v-app>
</template>

<script>
import { io } from 'socket.io-client';

export default {
  data() {
    return {
      carriles: [], // Array para almacenar los carriles de los jugadores
    };
  },
  created() {
    this.socket = io('http://localhost:3000');
    this.socket.on('updateCarril', (data) => {
      this.actualizarCarril(data);
    });
  },
  methods: {
    actualizarCarril(data) {
      const index = this.carriles.findIndex(c => c.nombre === data.nombre);
      if (index !== -1) {
        this.carriles.splice(index, 1, data); // Actualiza el carril existente
      } else {
        this.carriles.push(data); // Añade un nuevo carril si no existe
      }
    },
    getColor(index, position) {
      if (index === position) return "white"; // Color de la casilla actual
      return index % 2 === 0 ? "red" : "black"; // Color alternado para las demás casillas
    },
  },
};
</script>

<style scoped>
.carriles-carrera {
  padding: 20px;
}

.carril-container {
  margin-bottom: 20px;
}

.carril {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
}

.info {
  display: flex;
  flex-direction: column;
}

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

/* Centrado del título */
.title-center {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
}
</style>