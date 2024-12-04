<template>
  <v-container class="text-center">
    <!-- Título -->
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
        ref="carriles" 
      >
        <!-- Nombre del Carril fuera de las casillas -->
        <div class="d-flex align-center mb-2">
          <span class="ml-3 font-weight-bold">{{ carril.name }}</span>
        </div>

        <!-- Casillas del Carril -->
        <v-row dense class="d-flex flex-nowrap carril-row">
          <v-col
            v-for="(casilla, i) in 40"
            :key="i"
            class="pa-2"
            cols="auto"
            style="min-width: 60px;"
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
                <span>{{ i + 1 }}</span>
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
        { name: "Flecha Negra", avatar: "https://cdn-icons-png.freepik.com/512/32/32689.png", position: 0 },
        { name: "Centella Blanca", avatar: "https://cdn-icons-png.freepik.com/512/32/32689.png", position: 0 },
        { name: "Llama Naranja", avatar: "https://cdn-icons-png.freepik.com/512/32/32689.png", position: 0 },
        { name: "Sombra Gris", avatar: "https://cdn-icons-png.freepik.com/512/32/32689.png", position: 0 },
        { name: "Rocío Plateado", avatar: "https://cdn-icons-png.freepik.com/512/32/32689.png", position: 0 },
        { name: "Cometa Verde", avatar: "https://cdn-icons-png.freepik.com/512/32/32689.png", position: 0 },
      ],
      dado: 0, // Valor del dado
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
    // Obtiene el color de una casilla
    getColor(carril, casilla) {
      return this.carriles[carril].position === casilla
        ? "red lighten-3" // Casilla actual
        : casilla % 2 === 0
        ? "blue lighten-4"
        : "grey lighten-4";
    },

    // Lanza el dado y mueve al jugador en el carril indicado
    lanzarDado(carrilIndex) {
      // Generar un número aleatorio del 1 al 6
      this.dado = Math.floor(Math.random() * 6) + 1;

      // Calcular la nueva posición para el carril especificado
      const nuevoPosicion = Math.min(
        this.carriles[carrilIndex].position + this.dado,
        39 // Máximo hasta la casilla 39
      );

      // Actualizar la posición del carril especificado
      this.carriles[carrilIndex].position = nuevoPosicion;

      // Desplazar el scroll automáticamente si es necesario
      this.scrollCarril(carrilIndex);
    },

    // Función para hacer scroll automático al carril
    scrollCarril(carrilIndex) {
      // Obtener el elemento del carril específico
      const carrilElement = this.$refs.carriles[carrilIndex];
      
      // Solo hacer scroll si el carril existe
      if (carrilElement) {
        const casillaAncha = 60; // Ancho de cada casilla (en px)
        const offset = this.carriles[carrilIndex].position * casillaAncha; // Calcular el desplazamiento

        // Hacer el scroll hacia la casilla activa
        carrilElement.scrollLeft = offset;
      }
    },
  },
};
</script>

<style>
/* Estilo para carriles */
.carriles {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.carril {
  overflow-x: auto; /* Scroll horizontal habilitado */
  white-space: nowrap;
  border: 1px solid #ddd;
  padding: 8px;
}

.carril-row {
  overflow: hidden;
  display: flex;
}

.v-col {
  height: 60px; /* Altura uniforme */
}

.v-avatar img {
  width: 100%; /* Asegura que la imagen no sobresalga */
}
</style>
