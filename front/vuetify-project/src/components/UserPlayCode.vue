<template>
  <v-app>
    <!-- Barra superior -->
    <v-app-bar color="black" dark flat>
      <v-toolbar-title class="title-center">GMaths</v-toolbar-title>
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
      style="height: 100vh; background-color: #99a6e9;">
      <div class="text-center">
        <!-- Campo de entrada para el código -->
        <v-text-field 
          class="code-center"
          v-model="codigo"
          outlineded
          solo
          color="white"
          label="INGRESA EL CÓDIGO"
          style="max-width: 600px; width: 100%;"
        ></v-text-field>

        <!-- Botón de jugar -->
        <v-btn
          @click="jugar"
          color="primary"
          class="gradient-btn"
          elevation="5"
          style="background: linear-gradient(to bottom, #4fc3f7, #0288d1); color: white;"
        >
          ¡JUGAR! 
        </v-btn>

        <!-- Mensajes de error -->
        <v-alert 
          v-if="error" 
          type="error" 
          style="margin-top: 20px; max-width: 600px; width: 100%; word-wrap: break-word; padding: 35px; display: flex; justify-content: center; align-items: center; position: relative;"
        >
          <!-- Texto de error centrado -->
          <span style="flex-grow: 1; text-align: center; display: inline-block;">{{ error }}</span>
        </v-alert>
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

    <!-- Botón flotante para abrir el tutorial -->
    <v-btn
      class="video-button"
      icon
      color="primary"
      @click="showVideo = true"
    >
      🎥
    </v-btn>

    <!-- Modal con las reglas de la partida -->
    <RulesDialog :showRules="showRules" @update:showRules="showRules = $event" />

    <!-- Modal con el video tutorial -->
    <VideoTutorialDialog :showVideo="showVideo" @update:showVideo="showVideo = $event" />
  </v-app>
</template>

<script>
import RulesDialog from '@/components/RulesDialog.vue';
import VideoTutorialDialog from '@/components/VideoTutorialDialog.vue';
import waitingAudio from '@/assets/PlayCodeMusic.mp3'; // Asegúrate de que esta ruta sea correcta
import { useUserStore } from '@/stores/userStore'; // Importa el store de usuario

export default {
  name: "CustomScreen",
  components: {
    RulesDialog,
    VideoTutorialDialog,
  },
  data() {
    return {
      codigo: '', // Código ingresado por el usuario
      error: '',  // Mensaje de error si el código no es válido
      showRules: false, // Controla la visibilidad del modal de reglas
      showVideo: false, // Controla la visibilidad del modal del tutorial en video
      isMuted: false,   // Controla si el audio está silenciado o no
      audio: null,      // Referencia al objeto de audio
    };
  },
  mounted() {
    // Crear y configurar el objeto de audio
    this.audio = new Audio(waitingAudio);
    this.audio.loop = true;
    this.audio.play();
    
    // Reproducir el audio automáticamente solo si no está muteado
    if (!this.isMuted) {
        // Asegurarse de que el volumen esté al máximo
      this.audio.play().catch((err) => {
        console.warn("El audio no pudo ser reproducido automáticamente:", err);
      });
    } else {
      this.audio.volume = 0;  // Si está muteado, no reproducir
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
    },
    async jugar() {
      if (!this.codigo.trim()) {
        this.error = "Por favor, ingresa un código válido.";
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/game-code?codigo=${this.codigo}`);
        const data = await response.json();

        if (data.message === "Partida encontrada.") {
          // Obtener el correo del usuario desde Pinia
          const userStore = useUserStore();
          const email = userStore.user.email; // El correo guardado en el store
          const username = email.split('@')[0]; // Extraer la parte antes del '@' como nombre de usuario

          const updateResponse = await fetch(`http://localhost:3000/update-partida`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ codigo: this.codigo, usuario: username }),
          });

          const updateData = await updateResponse.json();
          if (updateData.success) {
            this.error = '';
            window.location.href = `/UserPlayWaiting/${this.codigo}`;
          } else {
            this.error = updateData.message;
          }
        } else {
          this.error = "El código ingresado no corresponde a ninguna partida existente.";
        }
      } catch (err) {
        console.error("Error al verificar el código:", err);
        this.error = "Hubo un problema al conectarse al servidor. Intenta de nuevo más tarde.";
      }
    },
  },
};
</script>
