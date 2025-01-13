<template>
  <v-container 
    class="game-screen" 
    style="height: 100vh; display: flex; flex-direction: column; justify-content: space-between; align-items: center; background-color: #99a6e9;"
  >
    <v-spacer style="padding: 100px;"></v-spacer>

    <!-- Logo en el centro y grande -->
    <img src="/favicon.ico" alt="Logo" class="logo" />

    <!-- Texto en la parte inferior -->
    <v-row justify="center" class="mb-6">
      <v-col cols="12">
        <v-spacer style="padding: 100px;"></v-spacer>
        <h1 class="display-3 font-weight-bold text-white custom-font">
          ¡Empecemos!
        </h1>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.game-screen {
  color: white;
}

.logo {
  width: 300px; /* Tamaño más grande para el logo */
  height: auto;
}

.text-center {
  text-align: center;
}

/* Personalización de la fuente */
.custom-font {
  font-family: 'Poppins', sans-serif; /* Fuente personalizada desde Google Fonts */
}
</style>
