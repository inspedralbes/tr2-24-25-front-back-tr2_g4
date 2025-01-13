<template>
  <v-container
    class="d-flex align-center justify-center"
    style="height: 100vh; background-color: #99a6e9; position: relative;"
  >
    <!-- Tarjeta principal -->
    <v-card
      elevation="6"
      class="py-12 px-6"
      style="background-color: slateblue; color: white; width: 45%; text-align: center; border-radius: 16px;"
    >
      <v-card-title class="text-h5 font-weight-bold">🏆 PODIO FINAL 🏆</v-card-title>

      <!-- Primer Lugar -->
      <v-card-text class="mt-6" style="margin-top: 20px;">
        <v-card
          elevation="2"
          style="background-color: gold; color: black; padding: 12px; border-radius: 8px; display: inline-block; font-weight: bold;"
        >
          🥇 1º Lugar: {{ ganadores[0]?.nombre || 'Vacante' }}
        </v-card>
      </v-card-text>

      <!-- Segundo Lugar -->
      <v-card-text class="mt-4">
        <v-card
          elevation="2"
          style="background-color: silver; color: black; padding: 12px; border-radius: 8px; display: inline-block;"
        >
          🥈 2º Lugar: {{ ganadores[1]?.nombre || 'Vacante' }}
        </v-card>
      </v-card-text>

      <!-- Tercer Lugar -->
      <v-card-text class="mt-4">
        <v-card
          elevation="2"
          style="background-color: #cd7f32; color: black; padding: 12px; border-radius: 8px; display: inline-block;"
        >
          🥉 3º Lugar: {{ ganadores[2]?.nombre || 'Vacante' }}
        </v-card>
      </v-card-text>

      <v-divider class="my-6" style="border-color: rgba(255, 255, 255, 0.5);"></v-divider>

      <v-card-text class="text-subtitle-2">
        ¡Felicidades a todos los participantes!
      </v-card-text>
    </v-card>

    <!-- Botón de retroceso -->
    <v-btn
      icon
      class="back-button"
      style="position: absolute; bottom: 16px; right: 16px; background-color: black; color: white; border-radius: 50%;"
      @click="onBack"
    >
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>
  </v-container>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router"; // Importamos useRouter

export default {
  name: "PodioFinal",
  setup() {
    const ganadores = ref([]);
    const route = useRoute();
    const router = useRouter(); // Obtenemos el router

    onMounted(() => {
      try {
        const podioParam = route.query.podio;
        if (podioParam) {
          // Decodificamos el parámetro `podio` de la URL
          const parsedPodio = JSON.parse(decodeURIComponent(podioParam));
          ganadores.value = parsedPodio.concat(
            Array(3 - parsedPodio.length).fill({ nombre: "Vacante" })
          );
        } else {
          // Si no hay podio, rellenamos con "Vacante"
          ganadores.value = Array(3).fill({ nombre: "Vacante" });
        }
      } catch (error) {
        console.error("Error al procesar el podio:", error);
        ganadores.value = Array(3).fill({ nombre: "Vacante" });
      }
    });

    const onBack = () => {
      // Redirigir al componente AdminPreguntas
      router.push("/profesor-dashboard"); // Ruta para AdminPreguntas
    };

    return { ganadores, onBack };
  },
};
</script>


<style scoped>
.v-card {
  box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease-in-out;
}

.v-card:hover {
  transform: scale(1.02);
}

.back-button:hover {
  background-color: #333333;
}
</style>
