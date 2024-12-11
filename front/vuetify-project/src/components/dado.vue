<template>
    <v-container class="d-flex justify-center align-center" style="height: 100vh;">
      <!-- Título -->
      <v-row class="text-center">
        <v-col>
          <h1>Lanzar Dado</h1>
        </v-col>
      </v-row>
  
      <!-- Dado GIF -->
      <v-row class="mt-4">
        <v-col class="d-flex justify-center">
          <!-- Mostrar el GIF de lanzamiento del dado -->
          <v-img
            v-if="lanzando"
            :src="gifUrl"
            alt="Dado girando"
            class="gif-enorme"
          ></v-img>
  
          <!-- Mostrar el número del dado -->
          <v-btn
            v-if="!lanzando"
            class="mt-4"
            color="primary"
            @click="lanzarDado"
          >
            Lanzar Dado
          </v-btn>
  
          <v-row class="mt-2">
            <v-col>
              <h3 v-if="!lanzando">Número del Dado: {{ dado }}</h3>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  export default {
    data() {
      return {
        dado: null, // Número del dado
        lanzando: false, // Estado del dado (si está lanzando)
        gifUrl: 'https://cdn.pixabay.com/animation/2022/11/09/13/33/13-33-02-34_512.gif', // URL del GIF
      };
    },
    methods: {
      // Función para lanzar el dado
      lanzarDado() {
        this.lanzando = true; // Activa el estado de lanzando
  
        // Simulamos el tiempo de animación del dado (2 segundos)
        setTimeout(() => {
          // Generamos un número aleatorio entre 1 y 6
          this.dado = Math.floor(Math.random() * 6) + 1;
          this.lanzando = false; // Desactiva el estado de lanzando
        }, 1000); // Espera 2 segundos antes de mostrar el resultado
      },
    },
  };
  </script>
  
  <style scoped>
  /* Asegura que el contenido se vea centrado vertical y horizontalmente */
  .v-container {
    height: 100vh; /* Hace que el contenedor ocupe todo el alto de la pantalla */
  }
  
  .v-img.gif-enorme {
    max-width: 90vw; /* Limita el tamaño máximo a un 90% del ancho de la ventana */
    max-height: 80vh; /* Limita el tamaño máximo a un 80% de la altura de la ventana */
    width: auto;
    height: auto;
  }
  
  .v-btn {
    margin-top: 20px;
  }
  </style>
  