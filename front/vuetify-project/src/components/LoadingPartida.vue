<template>
  <v-container class="game-theme">
    <v-row justify="center" class="text-center mt-6">
      <v-col cols="12">
        <h1 class="display-1 font-weight-bold text-white">¡Únete al juego!</h1>
        <v-chip color="black" class="pa-4 text-h5 font-weight-bold">
          Código: <span class="ml-2">{{ gameCode }}</span>
        </v-chip>
      </v-col>
    </v-row>

    <!-- Lista de Participantes como Chips -->
    <v-row justify="center" class="mt-10">
      <v-col cols="12">
        <h2 class="text-center text-h4 font-weight-bold mb-4">
          Participantes:
        </h2>
        <v-row class="d-flex flex-wrap" justify="center">
          <template v-for="(user, index) in users" :key="user.id">
            <v-chip closable
              class="ma-2 font-weight-bold"
              color="deep-purple lighten-3"
              text-color="white"
              @click:close="removeUser(user.userName)"
            >
              {{ user.name }}
            </v-chip>
          </template>
        </v-row>
      </v-col>
    </v-row>

    <!-- Botón para Iniciar la Partida -->
    <v-row justify="center" class="mt-8">
      <v-chip
        color="green darken-2"
        class="text-h6 font-weight-bold white--text pa-3"
        :disabled="users.length === 0"
        @click="startGame"
      >
        <v-icon left small>mdi-play</v-icon> ¡Comenzar partida!
      </v-chip>
    </v-row>
  </v-container>
</template>

<style scoped>
.game-theme {
  background: #99a6e9;
  color: white;
  min-height: 100vh;
  padding: 0 16px;
}

.v-chip {
  font-size: 1.5rem;
  border-radius: 50px;
}

.v-chip.close {
  background-color: #e53935;
  color: white;
}

.v-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
</style>

<script setup>
import { ref, onMounted } from 'vue';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useRouter } from 'vue-router';

const gameCode = ref('');
const users = ref([]);
const socket = io('http://localhost:3000');
const router = useRouter();

onMounted(async () => {
  // Obtener el código de la partida
  const response = await axios.get('http://localhost:3000/game-code');
  gameCode.value = response.data.gameCode;

  // Obtener los alumnos de la partida
  const alumnosResponse = await axios.get('http://localhost:3000/alumnos', { params: { codigo: gameCode.value } });
  users.value = alumnosResponse.data;

  // Unirse a la sala en el backend con el código de la partida
  socket.emit('join-room', { codigo: gameCode.value });

  // Escuchar actualizaciones de alumnos
  socket.on('update-alumnos', (alumnos) => {
    users.value = alumnos;
  });

  socket.on('error', (error) => {
    alert(error);
  });
});

// Función para eliminar un usuario
const removeUser = async (userName) => {
  try {
    const response = await fetch('http://localhost:3000/eliminar-name', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        codigo_partida: gameCode.value,
        nameToDelete: userName, // ID del usuario a eliminar
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Emitir evento al servidor para actualizar lista de usuarios
      socket.emit('user-removed', { codigo: gameCode.value, userId });

      // Actualizar la lista de usuarios en el cliente
      users.value = users.value.filter(user => user.id !== userId);
      alert(data.message || 'Usuario eliminado con éxito');
    } else {
      alert(data.error || 'No se pudo eliminar el usuario');
    }
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    alert('Hubo un error al intentar eliminar al usuario');
  }
};

socket.on('user-removed', ({ codigo, userId }) => {
  // Filtrar el usuario eliminado de la lista de usuarios en el cliente
  users.value = users.value.filter(user => user.id !== userId);
  alert('Usuario eliminado con éxito');
});


// Función para comenzar el juego
const startGame = () => {
  // Emitir evento a todos los jugadores conectados para que se redirijan a 'CarrilJugador'
  socket.emit('game-started', { codigo: gameCode.value });

  // Redirigir al profesor a la página de 'CarrilesCarrera' con el código de la partida
  router.push({ path: `/carrilescarrera/${gameCode.value}` });
};
</script>
