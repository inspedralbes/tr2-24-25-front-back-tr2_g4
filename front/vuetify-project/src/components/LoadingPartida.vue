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

    <!-- Sección de usuarios conectados -->
    <v-row justify="center" class="mt-10">
      <v-col cols="12" md="6">
        <v-card color="black" outlined>
          <h2 class="text-center mt-4 text-h4 font-weight-bold">
            Participantes:
          </h2>
          <v-list dense>
            <template v-for="(user, index) in users" :key="index">
              <v-list-item>
                <v-list-item-avatar color="deep-purple lighten-3" class="text-white text-h6">
                  <span>{{ index + 1 }}</span>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title class="text-h6">{{ user }}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-chip color="red lighten-1" class="white--text font-weight-bold" small @click="removeUser(index)">
                    <v-icon left small>mdi-delete</v-icon> Eliminar
                  </v-chip>
                </v-list-item-action>
              </v-list-item>
              <v-divider v-if="index < users.length - 1"></v-divider>
            </template>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- Botón de comenzar partida (como chip) -->
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

<script setup>
import { ref } from 'vue';

const users = ref([]);
const gameCode = ref('123456'); // Código del juego

const removeUser = (index) => {
  users.value.splice(index, 1);
};

const startGame = () => {
  alert('¡La partida ha comenzado!');
};

// Simulación de usuarios uniéndose
setInterval(() => {
  if (users.value.length < 10) {
    users.value.push(`Jugador ${users.value.length + 1}`);
  }
}, 2000);
</script>

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

.v-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
</style>
