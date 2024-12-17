<template>
    
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
    
  </template>
  
  <script>
  export default {
    name: 'RulesDialog',
    props: {
      showRules: {
        type: Boolean,
        required: true
      }
    }
  };
  </script>
  
  <style scoped>
  .text-rules-color {
    background-color: #0288d1;
  }
  
  .text-rules {
    background-color: #0a4f74;
  }
  </style>
  