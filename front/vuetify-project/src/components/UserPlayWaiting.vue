<template>
  <v-app>
    <!-- Barra superior -->
    <v-app-bar color="black" dark flat>
      <v-toolbar-title class="text-center">GMaths</v-toolbar-title>
    </v-app-bar>

    <!-- Botón flotante para silenciar el audio -->
    <v-btn class="mute-button" icon color="primary" @click="toggleMute">
      <span v-if="isMuted">🔇</span>
      <span v-else>🔊</span>
    </v-btn>

    <!-- Contenedor principal -->
    <v-container class="d-flex justify-center align-center" style="height: 100vh; background-color: #99a6e9;">
      <div style="width: 100%; max-width: 600px; display: flex; flex-direction: row;">
        <!-- Lista de participantes como Chips -->
        <div style="flex: 1; display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
          <h3 class="text-white font-weight-bold mb-4" style="width: 100%;">PARTICIPANTES:</h3>
          <v-chip class="color-chips" v-for="(user, index) in participants" :key="index" color="white" text-color="white" pill>
            {{ user.name }}
          </v-chip>
        </div>

        <!-- Mensaje centrado -->
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <h3 class="text-center text-white font-weight-bold">
            ESPERANDO PARA<br />INICIAR PARTIDA{{ dots }}
          </h3>
          <!-- Emoji de reloj más grande -->
          <div class="text-center mt-2" style="font-size: 2rem;">⏱️</div>
        </div>
      </div>
    </v-container>

    <!-- Botón flotante para abrir las reglas -->
    <v-btn class="rules-button" icon color="primary" @click="showRules = true">🧾</v-btn>

    <!-- Modal con las reglas de la partida -->
    <v-dialog v-model="showRules" max-width="600px">
      <v-card>
        <v-card-title class="text-rules">📜 Reglas de la Partida</v-card-title>
        <v-card-text class="text-rules-color">
          <p>🎯 El objetivo del juego es llegar al final del carril de 40 casillas antes que los demás jugadores. ¡Prepárate para una carrera matemática llena de sorpresas!</p>
          <ul>
            <li>🎲 Lanza el dado y avanza el número de casillas que indique.</li>
            <li>❓ Responde preguntas matemáticas para poder avanzar. Si fallas, no podrás avanzar.</li>
            <li>💣 Cuidado con las bombas (💣): si caes en una, retrocedes 2 casillas.</li>
            <li>💰 Las casillas x2 (💰) duplican el avance en tu siguiente turno.</li>
            <li>🏆 El primero en llegar a la última casilla gana la partida.</li>
          </ul>
          <p>🧠 Consejo: La rapidez y precisión en las respuestas son clave para ganar. ¡Buena suerte! 🚀</p>
        </v-card-text>
        <v-card-actions class="text-rules">
          <v-btn color="white" text @click="showRules = false">Cerrar ❌</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import { io } from 'socket.io-client';
import waitingAudio from '@/assets/PlayWaitingMusic.mp3';
import { useRouter } from 'vue-router';

const API_URL = import.meta.env.VITE_API_BACK;

export default {
  name: "GameWaitingRoom",
  data() {
    return {
      codigo: '', // Código de la partida
      participants: [], // Lista de participantes
      dots: '', // Animación de puntos
      isMuted: false, // Controla si el audio está silenciado o no
      audio: null, // Referencia al objeto de audio
      usuario: null, // Nombre completo del usuario logueado
      showRules: false, // Controla si se muestra el modal con las reglas
      socket: null, // Referencia al socket
    };
  },
  mounted() {
    // Configurar el audio
    this.setupAudio();

    // Configurar usuario y código
    const userData = JSON.parse(localStorage.getItem('user'));
    console.log(userData)
    if (!userData) {
      console.error("Usuario no encontrado en localStorage. Redirigiendo a login...");
      this.$router.push('/login');
      return;
    }
    this.usuario = userData.user.userName;
    this.codigo = this.$route.params.codigo;

    // Configurar socket
    this.setupSocket();

    // Configurar animación de puntos
    this.setupDotsAnimation();
  },
  beforeUnmount() {
    // Limpiar recursos
    if (this.socket) this.socket.disconnect();
    if (this.audio) this.audio.pause();
  },
  methods: {
    setupAudio() {
      this.audio = new Audio(waitingAudio);
      this.audio.loop = true;
      this.audio.volume = this.isMuted ? 0 : 1;
      this.audio.play().catch((err) => {
        console.warn("El audio no pudo ser reproducido automáticamente:", err);
      });
    },
    setupSocket() {
      this.socket = io(`${API_URL}`);
      this.socket.emit('join-room', { codigo: this.codigo, usuario: this.usuario });

      this.socket.on('update-alumnos', (alumnos) => {
        console.log("Recibido update-alumnos:", alumnos);
        this.participants = alumnos;
      });

      this.socket.on('new-participant', (data) => {
        if (data.codigo === this.codigo) {
          this.participants.push({ name: data.usuario });
        }
      });

      this.socket.on('game-started', (data) => {
        if (data.codigo === this.codigo) {
          this.$router.push(`/carriljugador/${this.codigo}`);
        }
      });

      this.socket.on('user-removed', ({ codigo, userName }) => {
        console.log(this.codigo, codigo, this.usuario, userName)
        if (this.codigo === codigo && this.usuario === userName) {
          console.log(`Has sido eliminado de la partida ${codigo}.`);
          this.$router.push('/alumno-dashboard');
        }
      });
    },
    setupDotsAnimation() {
      let count = 0;
      setInterval(() => {
        count = (count + 1) % 4;
        this.dots = '.'.repeat(count);
      }, 500);
    },
    toggleMute() {
      this.isMuted = !this.isMuted;
      this.audio.volume = this.isMuted ? 0 : 1;
      if (this.isMuted) {
        this.audio.pause();
      } else {
        this.audio.play().catch((err) => {
          console.warn("Error al reanudar el audio:", err);
        });
      }
    },
  },
};
</script>

<style scoped>
/* Estilos ajustados para los botones y chips */
.mute-button, .rules-button {
  position: fixed;
  bottom: 80px;
  right: 100px;
  background-color: #0288d1;
  color: white;
  font-size: 20px;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s ease, transform 0.2s ease;
}
.mute-button:hover, .rules-button:hover {
  background-color: #4fc3f7;
  transform: scale(1.1);
}
.color-chips {
  background-color: #020c11;
  color: black;
}
.text-rules-color {
  background-color: #0288d1;
}
.text-rules {
  background-color: #0a4f74;
}
</style>
