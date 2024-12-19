<template>
  <v-row class="d-flex flex-nowrap">
    <!-- Mostrar cada carril -->
    <v-col
      v-for="(carril, index) in carriles"
      :key="index"
      class="pa-2"
      cols="auto"
      style="min-width: 100px; height: 100px;"
    >
      <v-card
        outlined
        class="pa-3 d-flex justify-center align-center"
        :color="getColor(carril.position)"
        style="height: 100%;"
      >
        <template v-if="carril.position === carril.position">
          <v-avatar size="60" class="d-flex justify-center align-center">
            <span class="caballo" :style="{ transform: 'rotateY(180deg)', fontSize: '30px' }">🏇</span>
          </v-avatar>
        </template>

        <template v-else>
          <template v-if="isBomb(carril.position)">
            <span class="bomb-text">💣</span>
          </template>
          <template v-else-if="isMultiplier(carril.position)">
            <span class="golden-text">💰</span>
          </template>
          <template v-else>
            <span>{{ carril.position + 1 }}</span>
          </template>
        </template>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    carriles: {
      type: Array,
      required: true
    }
  },
  methods: {
    getColor(index) {
      // Define la lógica para obtener el color del carril
    },
    isBomb(index) {
      // Lógica para verificar si el carril tiene una bomba
    },
    isMultiplier(index) {
      // Lógica para verificar si el carril tiene un multiplicador
    }
  }
};
</script>

<style scoped>
/* Estilo del carril con scroll horizontal */
.v-col {
  height: 60px;
}
.v-avatar img {
  width: 100%;
}
</style>
