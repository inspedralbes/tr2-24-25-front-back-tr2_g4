<template>
  <v-app>
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
          dismissible 
          style="margin-top: 20px; max-width: 600px; width: 100%;">
          {{ error }}
        </v-alert>
      </div>
    </v-container>
  </v-app>
</template>

<script>
export default {
  name: "CustomScreen",
  data() {
    return {
      codigo: '', // Código ingresado por el usuario
      error: '',  // Mensaje de error si el código no es válido
    };
  },
  methods: {
  async jugar() {
    if (!this.codigo.trim()) {
      this.error = "Por favor, ingresa un código válido.";
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/game-code?codigo=${this.codigo}`);
      const data = await response.json();

      if (data.message === "Partida encontrada.") {
        // Redirigir a la sala de espera con el código como parte de la URL
        this.error = '';
        window.location.href = `/UserPlayWaiting/${this.codigo}`;
      } else {
        // Si el código no existe, mostrar error
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

.text-center {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  height: 10%; /* Asegura que el contenedor ocupe toda la altura disponible */
  width: 100%; /* Asegura que el contenedor ocupe todo el ancho disponible */
}

.code-center {
  margin-bottom: 20px;
}
</style>
