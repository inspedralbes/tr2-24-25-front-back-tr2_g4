<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { io } from 'socket.io-client';

const router = useRouter(); // Inicializamos el router
const route = useRoute(); // Accedemos a los parámetros de la URL

// Definimos las variables para almacenar el código y el podio
const gameCode = ref(route.params.codigo);  // Accedemos al 'codigo' de la URL
const podio = ref([]); // Variable para almacenar el podio

const carriles = ref([]); // Array para almacenar los carriles de los jugadores
const socket = io('http://localhost:3000');  // Inicializamos el socket

onMounted(() => {
  // Si el parámetro 'podio' está presente en la URL, lo parseamos
  if (route.query.podio) {
    try {
      podio.value = JSON.parse(route.query.podio);  // Parseamos el podio desde la query string
    } catch (error) {
      console.error('Error al parsear el podio:', error);
      podio.value = [];  // Si ocurre un error, lo dejamos vacío
    }
  }

  // Escuchamos las actualizaciones de los carriles a través del socket
  socket.on('updateCarril', (carril, nombre, avatar, bombas, multiplicadores) => {
    actualizarCarril(carril, nombre, avatar, bombas, multiplicadores);
  });
});

// Función para actualizar los carriles
const actualizarCarril = (carril, nombre, avatar, bombas, multiplicadores) => {
  const index = carriles.value.findIndex((c) => c.nombre === nombre);

  if (index !== -1) {
    // Si el carril ya existe, lo actualizamos
    carriles.value[index].carril = carril;
    carriles.value[index].bombas = bombas || [];
    carriles.value[index].multiplicadores = multiplicadores || [];
    carriles.value[index].avatar = avatar || '';
  } else {
    // Si el carril no existe, lo agregamos
    carriles.value.push({
      nombre,
      avatar,
      carril,
      bombas: bombas || [],
      multiplicadores: multiplicadores || []
    });
  }

  // Verificamos si ya hay ganadores
  verificarGanadores();
  // Ordenamos los carriles por la posición (el más avanzado se pone arriba)
  ordenaCarrilesPorPosicion();
};

// Función para ordenar los carriles por la posición
const ordenaCarrilesPorPosicion = () => {
  carriles.value.sort((a, b) => b.carril.position - a.carril.position);  // Ordenamos de mayor a menor
};

// Verificamos si algún jugador ha llegado a la meta
const verificarGanadores = () => {
  carriles.value.forEach((carrilData) => {
    if (carrilData.carril.position >= 40 && !podio.value.includes(carrilData.nombre)) {
      podio.value.push(carrilData.nombre);  // Añadimos al podio
    }
  });

  // Si ya hay 3 jugadores en el podio, redirigimos a la pantalla del podio
  if (podio.value.length >= 3) {
    mostrarPodio();
  }

  // Comprobamos si algún jugador ha llegado a la meta
  carriles.value.forEach((carrilData) => {
    if (carrilData.carril.position >= 40 && !podio.value.includes(carrilData.nombre)) {
      podio.value.push(carrilData.nombre);  // Añadimos al podio
      // Redirigimos a la página del podio
      router.push({ 
        path: '/podio',  // Redirigimos al podio
        query: { podio: JSON.stringify(podio.value) }  // Pasamos el podio como parámetro en la query string
      });
    }
  });
};

// Mostramos el podio de los 3 primeros jugadores
const mostrarPodio = () => {
  const top3 = podio.value.slice(0, 3);  // Aseguramos que solo se muestran los 3 primeros
  router.push({ 
    path: '/podio',  // Redirigimos al podio
    query: { podio: JSON.stringify(top3) }  // Pasamos el podio como parámetro en la query string
  });
};

// Función para obtener el color de cada casilla
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
/* Estilos adicionales */
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
