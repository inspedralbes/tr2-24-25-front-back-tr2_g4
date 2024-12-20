<template>
  <v-app>
    <!-- Barra superior -->
    <v-app-bar color="black" dark flat>
      <v-toolbar-title class="title-center">GMaths - Carriles de la Carrera</v-toolbar-title>
    </v-app-bar>

    <!-- Contenedor principal -->
    <v-container class="text-center" style="height: 100vh; background-color: #99a6e9; padding-top: 20px;">
      <!-- Mostrar cada carril de los jugadores -->
      <v-row dense justify="center" align="center" style="gap: 20px;">
        <v-col v-for="carrilData in carriles" :key="carrilData.name" cols="auto" class="carril-container">
          <!-- Nombre del jugador -->
          <h2 style="margin-bottom: 20px; color: white;">{{ carrilData.name }}</h2>

          <!-- Carriles con casillas -->
          <v-row dense justify="center">
            <v-col
              v-for="(casilla, index) in 40"
              :key="index"
              class="pa-1"
              cols="auto"
              style="min-width: 60px; height: 60px;"
            >
              <v-card
                outlined
                class="d-flex justify-center align-center"
                :color="getColor(index, carrilData.position)"
                style="height: 100%;"
              >
                <!-- Mostrar el avatar si es la casilla activa -->
                <template v-if="index === carrilData.position">
                  <v-avatar size="40">
                    <span class="caballo" :style="{ transform: 'rotateY(180deg)', fontSize: '20px' }">🏇</span>
                  </v-avatar>
                </template>
                <!-- Mostrar el número de casilla si no es activa -->
                <template v-else>
                  <span style="color: white;">{{ index + 1 }}</span>
                </template>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
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
    // Inicializar la conexión del socket
    this.socket = io('http://localhost:3000');

    // Escuchar el evento de actualización del carril
    this.socket.on('updateCarril', (data) => {
      this.actualizarCarril(data);
    });
  },
  methods: {
    // Actualizar los carriles basados en el nombre del jugador
    actualizarCarril(data) {
      // Buscar si ya existe un carril con el nombre del jugador
      const index = this.carriles.findIndex(c => c.name === data.name);

      if (index !== -1) {
        // Si el jugador ya tiene un carril, actualiza su posición
        this.carriles.splice(index, 1, data);
      } else {
        // Si no existe, crea un nuevo carril para el jugador
        this.carriles.push({
          name: data.name,
          position: data.position || 0, // Posición inicial en caso de que no venga definida
        });
      }
    },
    // Determinar el color de una casilla
    getColor(index, position) {
      if (index === position) return "white"; // Color de la casilla actual
      return index % 2 === 0 ? "red" : "black"; // Color alternado para las demás casillas
    },
  },
};
</script>

<style scoped>
.carril-container {
  margin-bottom: 40px;
}

.carril {
  display: flex;
  align-items: center;
}

.v-avatar {
  background-color: transparent;
}

.title-center {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
}

.v-row {
  justify-content: center;
}
</style>
