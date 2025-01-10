<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { io } from 'socket.io-client';

const router = useRouter();
const route = useRoute();

const gameCode = ref(route.params.codigo);
const podio = ref([]);
const carriles = ref([]);
const socket = io('http://localhost:3000');

// Inicializamos los ganadores como un array vacío
const ganadores = ref(Array(3).fill({ nombre: 'Vacante' }));

onMounted(() => {
  if (route.query.podio) {
    try {
      const parsedPodio = JSON.parse(route.query.podio);
      ganadores.value = parsedPodio.concat(
        Array(3 - parsedPodio.length).fill({ nombre: 'Vacante' })
      );
    } catch (error) {
      console.error('Error al parsear el podio:', error);
    }
  }

  // Escuchar actualizaciones de los carriles
  socket.on('updateCarril', (carril, nombre, avatar, bombas, multiplicadores) => {
    actualizarCarril(carril, nombre, avatar, bombas, multiplicadores);
  });
});

// Función para actualizar los carriles
const actualizarCarril = (carril, nombre, avatar, bombas, multiplicadores) => {
  const index = carriles.value.findIndex((c) => c.nombre === nombre);

  if (index !== -1) {
    carriles.value[index].carril = carril;
    carriles.value[index].bombas = bombas || [];
    carriles.value[index].multiplicadores = multiplicadores || [];
    carriles.value[index].avatar = avatar || '';
  } else {
    carriles.value.push({
      nombre,
      avatar,
      carril,
      bombas: bombas || [],
      multiplicadores: multiplicadores || []
    });
  }

  verificarGanadores();
  ordenaCarrilesPorPosicion();
};

// Función para ordenar los carriles
const ordenaCarrilesPorPosicion = () => {
  carriles.value.sort((a, b) => b.carril.position - a.carril.position);
};

// Verificar si hay ganadores y redirigir al podio
const verificarGanadores = () => {
  const jugadoresEnMeta = carriles.value.filter((carrilData) => carrilData.carril.position >= 39);

  if (jugadoresEnMeta.length === carriles.value.length || jugadoresEnMeta.length >= 3) {
    const top3 = jugadoresEnMeta.slice(0, 3).map((jugador) => ({ nombre: jugador.nombre }));
    const podioFinal = top3.concat(Array(3 - top3.length).fill({ nombre: 'Vacante' }));
    router.push({
      path: '/podio',
      query: { podio: JSON.stringify(podioFinal) },
    });
  }
};

// Obtener el color de las casillas
const getColor = (index, position) => {
  if (index === position) return 'white';
  return index % 2 === 0 ? 'red' : 'black';
};
</script>

<template>
  <v-app>
    <v-app-bar color="black" dark flat>
      <v-toolbar-title class="title-center">GMaths - Carriles de la Carrera</v-toolbar-title>
    </v-app-bar>

    <v-container class="text-center" style="height: 100vh; background-color: #99A6E9; padding-top: 80px;">
      <v-row dense justify="center" align="center" style="gap: 30px;">
        <v-col
          v-for="carrilData in carriles"
          :key="carrilData.nombre"
          cols="auto"
          class="carril-container"
          style="width: 100%;"
        >
          <v-card elevation="8" style="background: #0353A4; border-radius: 20px; padding: 20px;">
            <v-row align="center" no-gutters>
              <v-col cols="auto" class="text-left">
                <v-card
                  elevation="4"
                  outlined
                  style="background-color: #FFF07C; color: black; padding: 10px; border-radius: 10px;"
                >
                  <h2 style="margin: 0;">{{ carrilData.nombre }}</h2>
                </v-card>
              </v-col>

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
                      <template v-if="index === carrilData.carril.position">
                        <v-avatar size="40" color="white">
                          <span class="caballo" :style="{ transform: 'rotateY(180deg)', fontSize: '20px' }">🏇</span>
                        </v-avatar>
                      </template>
                      <template v-else>
                        <template v-if="carrilData.bombas.includes(index) || carrilData.multiplicadores.includes(index)">
                          <span v-if="carrilData.bombas.includes(index)" class="bomb-text">💣</span>
                          <span v-if="carrilData.multiplicadores.includes(index)" class="golden-text">💰</span>
                        </template>
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

.bomb-text {
  font-size: 30px;
  color: red;
}

.golden-text {
  font-size: 30px;
  color: gold;
}
</style>
