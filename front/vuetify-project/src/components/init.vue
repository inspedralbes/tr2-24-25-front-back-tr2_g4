<template>
  <v-container
    class="game-screen"
    style="height: 100vh; display: flex; justify-content: center; align-items: center; background-color: #99a6e9; border-radius: 24px; overflow: hidden;"
  >
    <!-- Card centralizado y redondeado -->
    <v-card
      class="elevation-4"
      style="width: 90%; max-width: 600px; padding: 32px; border-radius: 20px; background-color: #ffffff;"
    >
      <!-- Contenido dentro del Card -->
      <v-row justify="center">
        <v-col cols="12" class="text-center">
          <!-- Logo en el centro -->
          <img src="/favicon.ico" alt="Logo" class="logo mb-4" />
        </v-col>
        <v-col cols="12" class="text-center">
          <!-- Texto principal -->
          <h1 class="display-3 font-weight-bold primary--text">🔥 ¡Empecemos! 🚀</h1>
        </v-col>
        <v-col cols="12" class="text-center">
          <!-- Subtítulo -->
          <h2
  style="
    color: black;
    font-family: 'Poppins', sans-serif;
    font-size: 1.5rem;
    font-weight: 600;
    text-align: center;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
    margin-top: 1rem;
    margin-bottom: 1rem;
  "
>
📚 Aprende matemáticas mientras juegas una emocionante carrera de dados 🎲
</h2>


        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<style scoped>
.game-screen {
  color: white;
  border-radius: 24px; /* Redondea las esquinas del fondo */
  overflow: hidden; /* Asegura que el contenido no sobresalga */
}

.logo {
  width: 120px; /* Tamaño ajustado del logo */
  height: auto;
}

.primary--text {
  color: #1976D2; /* Azul primario de Vuetify */
  font-family: 'Poppins', sans-serif;
  text-shadow: 2px 2px 3px rgba(0, 0, 0, 0.2);

}

.subtitle-1 {
  font-family: 'Poppins', sans-serif; /* Fuente personalizada */
  font-size: 1.2rem;
}
</style>
