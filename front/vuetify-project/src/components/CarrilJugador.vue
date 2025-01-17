<template>
  <v-app>
    <!-- Barra superior -->
    <v-app-bar color="black" dark flat>
      <v-toolbar-title class="title-center">GMaths</v-toolbar-title>
    </v-app-bar>

    <!-- Contenedor principal con ajuste de padding para el contenido -->
    <v-container class="text-center" style="height: 100vh; background-color: #99a6e9; padding-top: 60px;">
      <v-row>
        <v-col>
        </v-col>
      </v-row>

      <!-- Carril con 40 casillas en la misma fila -->
      <div class="carril-container" ref="carrilContainer">
        <v-row dense class="d-flex flex-nowrap">
          <v-col
            v-for="(casilla, index) in 40"
            :key="index"
            class="pa-2"
            cols="auto"
            style="min-width: 100px; height: 100px;" 
          >
            <v-card
              outlined
              class="pa-3 d-flex justify-center align-center"
              :color="getColor(index)"
              style="height: 100%;" 
            >
              <!-- Muestra el número de la casilla o la imagen si es la casilla activa -->
              <template v-if="index === carril.position">
                <v-avatar size="60" class="d-flex justify-center align-center">
                  <span class="caballo" :style="{ transform: 'rotateY(180deg)', fontSize: '30px' }">🏇</span>
                </v-avatar>
              </template>

              <template v-else>
                <!-- Mostrar emoticono de bomba o multiplicador si corresponde -->
                <template v-if="isBomb(index)">
                  <span class="bomb-text">💣</span>
                </template>
                <template v-else-if="isMultiplier(index)">
                  <span class="golden-text">💰</span>
                </template>
                <!-- Si no es bomba ni multiplicador, mostrar el número -->
                <template v-else>
                  <span>{{ index + 1 }}</span>
                </template>
              </template>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Dado como botón interactivo -->
      <v-row class="mt-5" align="center" justify="center">
        <v-col cols="auto">
          <div 
            class="dado" 
            :style="dadoStyle" 
            @click="lanzarDado"
            :disabled="girando"
            style="cursor: pointer;"   
          >
            <!-- Mostrar los puntos en el dado cuando no está girando -->
            <template v-if="numeroDado === null">
              <div class="puntos-dado">
                <div class="punto punto-1"></div>
                <div class="punto punto-2"></div>
                <div class="punto punto-3"></div>
                <div class="punto punto-4"></div>
              </div>
            </template>
            <span 
              v-if="numeroDado !== null" 
              class="numero" 
              :style="numeroDadoStyle"
            >
              {{ numeroDado }}
            </span>
          </div>
        </v-col>
      </v-row>

      <!-- Mostrar la pregunta actual -->
      <v-row class="mt-3" align="center" justify="center" v-if="preguntaActiva">
        <v-col cols="12">
          <h2>{{ preguntaActual.text_pregunta }}</h2>
        </v-col>
      </v-row>

      <p v-if="mensajeRespuesta" class="mensaje-respuesta">{{ mensajeRespuesta }}</p>

      <div v-if="preguntaActiva" class="opciones-container">
        <div v-for="(opcion, index) in opcionesRespuesta" :key="index" class="opcion" 
          @click="verificarRespuesta(opcion)" :style="getOpcionColor(index)">
          {{ opcion }}
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
    <!-- Alert para la pausa de la partida -->
    <v-dialog
      v-model="partidaPausada"
      persistent
      max-width="400"
    >
      <v-card class="text-center">
        <v-card-title class="headline red--text">⏸️ Partida Pausada</v-card-title>
        <v-card-text>
          La partida está temporalmente pausada. Por favor, espera hasta que se reanude.
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import playerManager from '../services/playerManager.js';

export default {
  mixins: [playerManager],
  data() {
    return {
      // Propiedades existentes para el carril, dado, preguntas, etc.
      codigoPartida: this.$route.params.codigo,
      showRules: false, // Controla la visibilidad del modal de reglas
      partidaPausada: false, // Estado para saber si la partida está pausada
    };
  },
  mounted() {
    // Escucha el evento `pause-game` desde el servidor
    this.socket.on('pause-game', (data) => {
      this.partidaPausada = data.estado; // Accede al valor correcto de `estado`
      if (data.codigo === this.codigoPartida) {
        this.partidaPausada = data.estado; // Actualiza el estado de la partida
        if (this.partidaPausada) {
          console.log('La partida está pausada');
        } else {
          console.log('La partida se ha reanudado');
        }
      }
    });
  },
};
</script>



<style scoped>
.paused-alert {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  background-color: white;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  text-align: center;
}
.paused-alert h2 {
  color: red;
  font-size: 24px;
  font-weight: bold;
}
/* Estilo del carril con scroll horizontal */
.carril-container {
  overflow-x: scroll;
  white-space: nowrap;
  max-width: 100%;
  -ms-overflow-style: none;
  scrollbar-width: none;
  padding-top: 20px;
  padding-bottom: 20px;
}

.carril-container::-webkit-scrollbar {
  display: none;
}

/* Estilo para los elementos dentro del carril */
.v-col {
  height: 60px;
}

.v-avatar img {
  width: 100%;
}

/* Estilo para el dado (botón interactivo) */
.dado {
  margin-top: 100px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  width: 200px;
  height: 200px;
  background-color: white;
  border-radius: 10px;
  font-size: 72px;
  color: black;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.5s ease, background-color 0.3s ease;
}

.numero {
  font-size: 100px;
  font-weight: bold;
  color: white;
}

/* Estilos para los puntos en el dado */
.puntos-dado {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  width: 100%;
  height: 100%;
  position: relative;
}

.punto {
  width: 30px;
  height: 30px;
  background-color: black;
  border-radius: 50%;
  position: absolute;
}

.punto-1 { top: 20%; left: 20%; }
.punto-2 { top: 20%; right: 20%; }
.punto-3 { bottom: 20%; left: 20%; }
.punto-4 { bottom: 20%; right: 20%; }

/* Estilos para los emoticonos de bomba y multiplicador */
.bomb-text {
  font-size: 45px;
  color: red;
}

.golden-text {
  font-size: 45px;
  color: gold;
}

/* Estilo para el contenedor de las opciones de respuesta */
.opciones-container {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 10px;
  width: 80%;
  max-width: 500px;
}

/* Estilo para cada opción de respuesta */
.opcion {
  color: white;
  font-size: 18px;
  font-weight: bold;
  border-radius: 12px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.2);
  text-align: center;
  padding: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  padding: 20%;
}

.mensaje-respuesta {
  font-size: 24px;  
  font-weight: bold;
  color: white; 
  margin-top: 20px; 
  text-align: center; 
}

.caballo {
  color: aqua;
}

/* Centrado del título */
.title-center {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
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
</style>
