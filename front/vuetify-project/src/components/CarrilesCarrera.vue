<template>
  <v-container
    class="text-center full-height"
    style="background-color: #99a6e9; overflow-y: auto;"
  >
    <v-row>
      <v-col>
        <h1>Carriles de Carreras</h1>
      </v-col>
    </v-row>

    <!-- Carriles ordenados dinámicamente -->
    <div class="carriles">
      <div
        v-for="(carril, index) in carrilesOrdenados"
        :key="index"
        class="carril"
      >
        <!-- Nombre del Carril -->
        <div class="d-flex align-center mb-2">
          <span class="ml-3 font-weight-bold">{{ carril.name }}</span>
        </div>

        <!-- Carril con 40 casillas visibles -->
        <v-row dense class="carril-row">
          <v-col
            v-for="(casilla, i) in 40"
            :key="i"
            class="pa-1"
            :cols="`auto`"
          >
            <v-card
              outlined
              class="pa-3 d-flex justify-center align-center"
              :color="getColor(carril.index, i)"
            >
              <!-- Imagen solo en la casilla activa -->
              <template v-if="carril.position === i">
                <v-avatar size="40">
                  <img :src="carril.avatar" alt="Caballo" />
                </v-avatar>
              </template>
              <template v-else>
                <!-- Casillas de multiplicador -->
                <template v-if="isMultiplier(i)">
                  <span class="golden-text">💰</span>
                </template>
                <!-- Casillas normales -->
                <template v-else>
                  <span>{{ i + 1 }}</span>
                </template>
              </template>

              <!-- Mostrar Bombas -->
              <template v-if="isBomb(i)">
                <v-icon color="red">mdi-bomb</v-icon>
              </template>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </div>

    <!-- Botones de Lanzar Dado -->
    <v-row class="mt-4">
      <v-col>
        <v-btn color="primary" @click="lanzarDado(1)">
          Lanzar Dado (Carril 2)
        </v-btn>
        <v-btn color="secondary" @click="lanzarDado(4)">
          Lanzar Dado (Carril 5)
        </v-btn>
      </v-col>
    </v-row>

    <!-- Mostrar el Número del Dado -->
    <v-row class="mt-2">
      <v-col>
        <h3>Dado: {{ dado }}</h3>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      // Datos iniciales para los carriles
      carriles: [
        { name: "Rayo Veloz", avatar: "https://cdn-icons-png.freepik.com/512/32/32689.png", position: 0 },
        { name: "Trueno Azul", avatar: "https://cdn-icons-png.freepik.com/512/32/32689.png", position: 0 },
        { name: "Tormenta Roja", avatar: "https://cdn-icons-png.freepik.com/512/32/32689.png", position: 0 },
        { name: "Viento Dorado", avatar: "https://cdn-icons-png.freepik.com/512/32/32689.png", position: 0 },
      ],
      dado: 0, // Valor del dado
      bombas: [3, 10, 15, 30], // Casillas con bombas
      multiplicadores: [5, 20, 25], // Casillas con multiplicadores
    };
  },
  computed: {
    // Ordenar los carriles por posición descendente
    carrilesOrdenados() {
      return this.carriles
        .map((carril, index) => ({
          ...carril,
          index,
          position: this.carriles[index].position,
        }))
        .sort((a, b) => b.position - a.position);
    },
  },
  methods: {
    // Verifica si una casilla tiene bomba
    isBomb(casilla) {
      return this.bombas.includes(casilla);
    },
    // Verifica si una casilla tiene multiplicador
    isMultiplier(casilla) {
      return this.multiplicadores.includes(casilla);
    },
    // Obtiene el color de una casilla
    getColor(carril, casilla) {
      // Casilla activa (roja)
      if (this.carriles[carril].position === casilla) {
        return "red lighten-3";
      }

      // Casillas de multiplicador (doradas)
      if (this.isMultiplier(casilla)) {
        return "yellow darken-3"; // Dorado
      }

      // Casillas normales (rojo o negro)
      return casilla % 2 === 0 ? "black" : "red";
    },

    // Lanza el dado y mueve al jugador en el carril indicado
    lanzarDado(carrilIndex) {
      this.dado = Math.floor(Math.random() * 6) + 1;
      const nuevaPosicion = Math.min(
        this.carriles[carrilIndex].position + this.dado,
        39
      );
      this.carriles[carrilIndex].position = nuevaPosicion;
    },
  },
};
</script>

<style scoped>
.full-height {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.carriles {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}
.carril {
  width: 100%;
  border: 1px solid #ddd;
  padding: 8px;
  margin: 10px;
}
.carril-row {
  display: flex;
  justify-content: space-between;
}
.v-col {
  height: 60px;
  flex: 1;
  max-width: 2.5%; /* Ajustar para que 40 casillas llenen el ancho */
}
.v-avatar img {
  width: 100%;
}
.golden-text {
  font-size: 1%; /* El emoji ocupará el 50% del tamaño de la casilla */
  color: gold;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300%; /* Asegura que el emoji ocupe todo el espacio vertical */
  width: 100%; /* Asegura que el emoji ocupe todo el espacio horizontal */
}

</style>
