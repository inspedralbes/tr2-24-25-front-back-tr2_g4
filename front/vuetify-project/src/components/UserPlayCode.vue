<template>
  <v-app>
    <!-- Barra superior -->
    <v-app-bar color="black" dark flat>
      <v-toolbar-title class="title-center">GMaths</v-toolbar-title>
    </v-app-bar>

    <!-- Contenedor principal -->
    <v-container 
      class="d-flex justify-center align-center" 
      style="height: 100vh; background-color: #99a6e9;">
    <div class="text-center">
  <!-- Campo de entrada para el código -->
  <v-text-field 
    class="code-center"
    v-model="codigo"
    outlined
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

    <!-- Modal con el video tutorial -->
    <v-dialog
      v-model="showVideo"
      max-width="800px"
    >
      <v-card>
        <v-card-title class="text-video">🎥 Tutorial del Juego</v-card-title>
        <v-card-text>
          <iframe 
            width="100%" 
            height="400" 
            src="https://www.youtube.com/embed/ZldSOzmye4Q" 
            frameborder="0" 
            allowfullscreen
          ></iframe>
        </v-card-text>
        <v-card-actions>
          <v-btn color="white" text @click="showVideo = false">Cerrar ❌</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
export default {
  name: "CustomScreen",
  data() {
    return {
      codigo: '', // Código ingresado por el usuario
      error: '',  // Mensaje de error si el código no es válido
      showRules: false, // Controla la visibilidad del modal de reglas
      showVideo: false, // Controla la visibilidad del modal del tutorial en video
    };
  },
  methods: {
    async jugar() {
      if (!this.codigo.trim()) {
        this.error = "Por favor, ingresa un código válido.";
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/game-code?codigo=${this.codigo}`);
        const data = await response.json();

        if (data.message === "Partida encontrada.") {
          const usuario = 'UserDEF6'; // Esto debe ser asignado dinámicamente según el usuario actual
          const updateResponse = await fetch(`http://localhost:3000/update-partida`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ codigo: this.codigo, usuario }),
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

<style scoped>
.gradient-btn {
  width: 200px;
  height: 40px;
  margin-top: 20px;
}

.title-center {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  height: 200%;
  width: 100%;
}

.text-center {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  height: 10%;
  width: 100%;
}

.code-center {
  margin-bottom: 20px;
}

/* Botón flotante: Reglas */
.rules-button {
  position: fixed;
  bottom: 80px; /* Ajustado para el nuevo botón */
  right: 100px;
  background-color: #0288d1;
  color: white;
  font-size: 20px; /* Reducción del tamaño del texto */
  width: 70px; /* Reducción del tamaño del botón */
  height: 70px; /* Reducción del tamaño del botón */
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

/* Botón flotante: Tutorial */
.video-button {
  position: fixed;
  bottom: 20px; /* Ajustado para estar más cerca del botón de reglas */
  right: 100px;
  background-color: #0288d1;
  color: white;
  font-size: 20px; /* Reducción del tamaño del texto */
  width: 70px; /* Reducción del tamaño del botón */
  height: 70px; /* Reducción del tamaño del botón */
  border-radius: 50%;
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.video-button:hover {
  background-color: #4fc3f7;
  transform: scale(1.1);
}

</style>
