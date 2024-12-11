<template>
  <v-app>
    <!-- Barra superior -->
    <v-app-bar color="black" dark flat>
      <v-toolbar-title class="text-center">GMaths</v-toolbar-title>
    </v-app-bar>

    <!-- Botón flotante para silenciar el audio -->
    <v-btn
      class="mute-button"
      icon
      color="primary"
      @click="toggleMute"
    >
      <span v-if="isMuted">🔇</span>
      <span v-else>🔊</span>
    </v-btn>

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

    <!-- Botón flotante para abrir las reglas -->
    <v-btn
      class="rules-button"
      icon
      color="primary"
      @click="showRules = true"
    >
      🧾
    </v-btn>

    <!-- Modal con las reglas de la partida -->
    <v-dialog
      v-model="showRules"
      max-width="600px"
    >
      <v-card>
        <v-card-title class="text-rules">📜 Reglas de la Partida</v-card-title>
        <v-card-text class="text-rules-color">
          <p>
            🎯 El objetivo del juego es llegar al final del carril de 40 casillas antes que los demás jugadores. ¡Prepárate para una carrera matemática llena de sorpresas!
          </p>
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
import waitingAudio from '@/assets/PlayWaitingMusic.mp3'; // Asegúrate de que esta ruta sea correcta

export default {
  name: "GameWaitingRoom",
  data() {
    return {
      codigo: '', // Código de la partida
      participants: [], // Lista de participantes
      dots: '', // Animación de puntos
      isMuted: false,   // Controla si el audio está silenciado o no
      audio: null,      // Referencia al objeto de audio
      showRules: false, // Controla la visibilidad del modal de reglas
    };
  },
  mounted() {
    // Crear y configurar el objeto de audio
    this.audio = new Audio(waitingAudio);
    this.audio.loop = true;
    this.audio.volume = 1;
    this.audio.play().catch((err) => {
      console.warn("El audio no pudo ser reproducido automáticamente:", err);
    });
    this.audio.volume = 1;
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

    // Animación de puntos
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
  methods: {
    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.isMuted) {
        this.audio.pause();
        this.audio.volume = 0;
      } else {
        this.audio.volume = 1;
        this.audio.play().catch((err) => {
          console.warn("Error al reanudar el audio:", err);
        });
      }
    }
  }
};
</script>

<style scoped>
/* Botón flotante: Mute */
.mute-button {
  position: fixed;
  top: 100px;
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

.mute-button:hover {
  background-color: #4fc3f7;
  transform: scale(1.1);
}

/* Botón flotante: Reglas */
.rules-button {
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

.rules-button:hover {
  background-color: #4fc3f7;
  transform: scale(1.1);
}

.text-rules-color {
  background-color: #0288d1;
}

.text-rules {

  background-color: #0a4f74;
}

/* Estilo para chips */
.color-chips {
  background-color: #020c11;
  color: black;
}
</style>
