<template>
  <v-container>
    <v-row no-gutters>
      <v-col>
        <v-chip>
          Código: <span>123456</span>
        </v-chip>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="4">
        <v-card outlined>
          <h2>
            Usuarios conectados
          </h2>
          <v-list>
            <template v-for="(user, index) in users" :key="index">
              <v-list-item>
                <v-list-item-avatar>
                  <span>{{ index + 1 }}</span>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ user }}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon color="error" @click="removeUser(index)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
              <v-divider v-if="index < users.length - 1"></v-divider>
            </template>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <v-row justify="end" class="mt-4">
      <v-btn
        color="success"
        large
        :disabled="users.length === 0"
        @click="startGame"
      >
        Comenzar Partida
      </v-btn>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';

const users = ref(['Usuario 1', 'Usuario 2', 'Usuario 3', 'Usuario 4']);

const removeUser = (index) => {
  users.value.splice(index, 1);
};

const startGame = () => {
  alert('¡La partida ha comenzado!');
};
</script>
