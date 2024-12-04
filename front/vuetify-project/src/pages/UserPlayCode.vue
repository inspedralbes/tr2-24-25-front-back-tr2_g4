<template>
  <v-app>
    <v-container 
      class="d-flex justify-center align-center" 
      style="height: 100vh; background-color: #99a6e9;">
      <div class="text-center">
        <!-- Campo de entrada para el código -->
        <v-text-field :class="code-center"
          v-model="codigo"
          outlined
          solo
          color="white"
          label="INGRESA EL CÓDIGO"
          d-flex
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
      </div>
    </v-container>
  </v-app>
</template>

<script>
export default {
  name: "CustomScreen",
  data() {
    return {
      codigo: '',
    };
  },
  methods: {
    jugar() {
      // Aquí puedes agregar la lógica para lo que sucede cuando se presiona "JUGAR"
      console.log("Código ingresado:", this.codigo);
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
