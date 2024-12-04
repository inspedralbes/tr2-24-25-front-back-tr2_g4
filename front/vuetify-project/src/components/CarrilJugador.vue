<template>
    <v-container class="text-center">
      <!-- Título -->
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
  export default {
    data() {
      return {
        // Datos del carril del jugador
        carril: {
          name: "Rayo Veloz",
          avatar: "https://cdn-icons-png.freepik.com/512/32/32689.png",
          position: 0, // Empezamos en la casilla 0
        },
        dado: 0,
        numeroDado: null, // Número mostrado en el dado durante el giro
        girando: false, // Controla el estado de giro del dado
        rotacion: 0, // Ángulo de rotación del dado
        dadoStyle: {
          width: "100px",
          height: "100px",
          backgroundColor: "red",
          borderRadius: "10px",
          fontSize: "32px",
          color: "white",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.5s ease, background-color 0.3s ease",
        },
        // Definir las posiciones de las bombas y los multiplicadores
        bombas: [],
        multipliers: [],
      };
    },
    created() {
      // Generar posiciones para las bombas y multiplicadores
      this.generateUniquePositions();
    },
    methods: {
      lanzarDado() {
        if (this.girando) return;
  
        this.girando = true; // Bloquear clics
        this.numeroDado = null; // Reiniciar el dado
        this.dadoStyle.backgroundColor = "red"; // Fondo rojo al iniciar
        this.rotacion = 0;
  
        let iteraciones = 0;
        const interval = setInterval(() => {
          this.numeroDado = Math.floor(Math.random() * 6) + 1; // Número aleatorio
          this.rotacion += Math.floor(Math.random() * 180) + 90; // Rotación aleatoria
          this.dadoStyle.transform = `rotate(${this.rotacion}deg)`;
          iteraciones++;
  
          if (iteraciones === 10) {
            clearInterval(interval); // Detener el dado tras 10 giros
            this.dado = this.numeroDado; // Fijar el número final
            this.dadoStyle.backgroundColor = "green"; // Fondo verde
            this.actualizarPosicion(); // Mover al jugador
            this.girando = false; // Permitir clics
          }
        }, 500); // Giro cada 500ms para un total de 5 segundos
      },
  
      actualizarPosicion() {
        const nuevaPosicion = Math.min(this.carril.position + this.dado, 39);
        this.carril.position = nuevaPosicion;
        this.scrollCarril();
      },
  
      scrollCarril() {
        const carrilContainer = this.$refs.carrilContainer;
        const desplazamiento = this.carril.position * 60; // 60px por casilla
        if (carrilContainer) {
          carrilContainer.scrollLeft = desplazamiento;
        }
      },
  
      generateUniquePositions() {
        let availablePositions = Array.from({ length: 39 }, (_, i) => i + 1);
        this.bombas = this.getRandomPositions(availablePositions, 2);
        availablePositions = availablePositions.filter(pos => !this.bombas.includes(pos));
        this.multipliers = this.getRandomPositions(availablePositions, 2);
      },
  
      getRandomPositions(availablePositions, number) {
        const positions = [];
        for (let i = 0; i < number; i++) {
          const randomIndex = Math.floor(Math.random() * availablePositions.length);
          positions.push(availablePositions[randomIndex]);
          availablePositions.splice(randomIndex, 1);
        }
        return positions;
      },
  
      isBomb(index) {
        return this.bombas.includes(index);
      },
  
      isMultiplier(index) {
        return this.multipliers.includes(index);
      },
  
      getColor(index) {
        if (index === this.carril.position) return "red lighten-3";
        return index % 2 === 0 ? "blue lighten-4" : "grey lighten-4";
      },
    },
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
  