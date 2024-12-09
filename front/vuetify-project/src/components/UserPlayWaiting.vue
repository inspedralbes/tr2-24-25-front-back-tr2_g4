<template>
  <v-app>
    <!-- Barra superior -->
    <v-app-bar color="black" dark flat>
      <v-toolbar-title class="text-center">GMaths</v-toolbar-title>
    </v-app-bar>

    <!-- Contenedor principal -->
    <v-container 
      class="d-flex justify-center align-center"
      style="height: 100vh; background-color: #99a6e9;"
    >
      <div style="width: 100%; max-width: 600px; display: flex; flex-direction: row;">
        <!-- Lista de participantes como Chips -->
        <div style="flex: 1; display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
          <h3 class="text-white font-weight-bold mb-4" style="width: 100%;">PARTICIPANTES:</h3>
          <!-- Mostrar los participantes como chips -->
          <v-chip class="color-chips"
            v-for="(user, index) in participants"
            :key="index"
            color="white"
            text-color="white"
            pill
          >
            {{ user.name }}
          </v-chip>
        </div>
        
        <!-- Mensaje centrado -->
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <h3 class="text-center text-white font-weight-bold">
            ESPERANDO PARA<br />INICIAR PARTIDA{{ dots }}
          </h3>
          <!-- Emoji de reloj más grande -->
          <div class="text-center mt-2" style="font-size: 2rem;">
            ⏱️
          </div>
        </div>
      </div>
    </v-container>
  </v-app>
</template>

<script>
import { io } from 'socket.io-client';

export default {
  name: "GameWaitingRoom",
  data() {
    return {
      codigo: '', // Código de la partida
      participants: [], // Lista de participantes
      dots: '', // Animación de puntos
    };
  },
  created() {
    this.codigo = this.$route.params.codigo; // Obtener el código de la URL

    // Conectar con el servidor de Socket.io
    this.socket = io('http://localhost:3000');

    // Unirse a la sala de la partida
    this.socket.emit('join-room', { codigo: this.codigo });

    // Escuchar actualizaciones de los participantes
    this.socket.on('update-alumnos', (alumnos) => {
      this.participants = alumnos; // Actualizar la lista de participantes
    });

    // Manejar nuevos participantes
    this.socket.on('new-participant', (data) => {
      if (data.codigo === this.codigo) {
        this.participants.push({ name: data.usuario });
      }
    });

    // Animación de puntos (esto es solo una opción para el UI)
    let count = 0;
    setInterval(() => {
      count = (count + 1) % 4;
      this.dots = '.'.repeat(count);
    }, 500);
  },
  destroyed() {
    // Desconectar cuando el componente se destruya
    if (this.socket) {
      this.socket.disconnect();
    }
  },
};
</script>

<style scoped>
.text-white {
  color: white;
}

.mb-2 {
  margin-bottom: 10px;
}

.mt-2 {
  margin-top: 10px;
}

.color-chips {
  background-color: #020c11;
  color: black;
}
</style>