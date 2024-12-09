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
            USUARIO {{ index + 1 }}
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
export default {
  name: "ParticipantsScreen",
  data() {
    return {
      participants: Array(8).fill("Usuario"), // Simula 8 participantes; reemplazar con lógica dinámica
      dots: ".", // Inicia con un solo punto
      intervalId: null, // Para almacenar el ID del intervalo
    };
  },
  methods: {
    updateDots() {
      // Actualiza los puntos de forma cíclica
      if (this.dots.length < 3) {
        this.dots += ".";
      } else {
        this.dots = "."; // Reinicia cuando llega a 3 puntos
      }
    },
  },
  mounted() {
    // Inicia el ciclo de puntos cuando el componente se monta
    this.intervalId = setInterval(this.updateDots, 500); // Actualiza cada 500ms
  },
  beforeDestroy() {
    // Limpia el intervalo cuando el componente se destruye
    clearInterval(this.intervalId);
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
