<template>
  <v-app>
    <!-- Barra superior -->
    <v-app-bar color="black" dark flat>
      <v-toolbar-title class="title-center">GMaths - Carriles de la Carrera</v-toolbar-title>
    </v-app-bar>

    <!-- Contenedor principal -->
    <v-container class="text-center" style="height: 100vh; background-color: #99A6E9; padding-top: 80px;">
      <!-- Mostrar cada carril de los jugadores -->
      <v-row dense justify="center" align="center" style="gap: 30px;">
        <v-col
          v-for="carrilData in carriles"
          :key="carrilData.carril.name"
          cols="auto"
          class="carril-container"
          style="width: 100%;"
        >
          <!-- Estructura del carril -->
          <v-card elevation="8" style="background: #0353A4; border-radius: 20px; padding: 20px;">
            <v-row align="center" no-gutters>
              <!-- Nombre del jugador -->
              <v-col cols="auto" class="text-left">
                <v-card
                  elevation="4"
                  outlined
                  style="background-color: #FFF07C; color: black; padding: 10px; border-radius: 10px;"
                >
                  <h2 style="margin: 0;">{{ carrilData.carril.name }}</h2>
                </v-card>
              </v-col>

              <!-- Carriles con casillas -->
              <v-col>
                <v-row dense justify="center" align="center">
                  <v-col
                    v-for="(casilla, index) in 40"
                    :key="index"
                    class="pa-1"
                    cols="auto"
                    style="min-width: 60px; height: 60px;"
                  >
                    <v-card
                      elevation="2"
                      outlined
                      class="d-flex justify-center align-center"
                      :color="getColor(index, carrilData.carril.position)"
                      style="height: 100%; border-radius: 12px;"
                    >
                      <!-- Mostrar el avatar si es la casilla activa -->
                      <template v-if="index === carrilData.carril.position">
                        <v-avatar size="40" color="white">
                          <span class="caballo" :style="{ transform: 'rotateY(180deg)', fontSize: '20px' }">🏇</span>
                        </v-avatar>
                      </template>

                      <!-- Mostrar bombas y multiplicadores -->
                      <template v-else>
                        <template v-if="carrilData.bombas.includes(index) || carrilData.multiplicadores.includes(index)">
                          <span v-if="carrilData.bombas.includes(index)" class="bomb-text">💣</span>
                          <span v-if="carrilData.multiplicadores.includes(index)" class="golden-text">💰</span>
                        </template>

                        <!-- Mostrar el número de casilla si no es bomba ni multiplicador -->
                        <template v-else>
                          <span style="color: white;">{{ index + 1 }}</span>
                        </template>
                      </template>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>


<script>
import { io } from "socket.io-client";

export default {
  data() {
    return {
      carriles: [], // Array para almacenar los carriles de los jugadores
    };
  },
  created() {
    // Inicializar la conexión del socket
    this.socket = io("http://localhost:3000");

    // Escuchar el evento de actualización del carril
    this.socket.on("updateCarril", (carril, nombre, avatar, bombas, multiplicadores) => {
      this.actualizarCarril(carril, nombre, avatar, bombas, multiplicadores);
    });
  },
  methods: {
    // Actualizar los carriles basados en el nombre del jugador
    actualizarCarril(carril, nombre, avatar, bombas, multiplicadores) {
      // Buscar si ya existe un carril con el nombre del jugador
      console.log("Actualización del carril para el jugador:", nombre);
      console.log("Bombas:", bombas);  // Imprime las bombas
      console.log("Multiplicadores:", multiplicadores);  
      const index = this.carriles.findIndex((c) => c.nombre === nombre);

      if (index !== -1) {
        // Si el jugador ya tiene un carril, actualiza su carril, bombas y multiplicadores
        this.carriles[index].carril = carril || {}; // Asegúrate de que carril tenga una posición válida
        this.carriles[index].bombas = bombas || [];
        this.carriles[index].multiplicadores = multiplicadores || [];
        this.carriles[index].avatar = avatar || ""; // Actualizar avatar si es necesario
      } else {
        // Si no existe, crea un nuevo carril para el jugador
        this.carriles.push({
          nombre,
          avatar,
          carril, // Asegúrate de pasar el objeto carril completo
          bombas: bombas || [],
          multiplicadores: multiplicadores || []
        });
      }
    },

    // Determinar el color de una casilla
    getColor(index, position) {
      if (index === position) return "white"; // Color de la casilla actual
      return index % 2 === 0 ? "red" : "black"; // Color alternado para las demás casillas
    },
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.disconnect(); // Desconectar el socket al destruir el componente
    }
  },
};
</script>

<style scoped>
.carril-container {
  margin-bottom: 40px;
  margin-top: 70px;
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

/* Estilos para los emoticonos de bomba y multiplicador */
.bomb-text {
  font-size: 30px;
  color: red;
}

.golden-text {
  font-size: 30px;
  color: gold;
}
</style>
