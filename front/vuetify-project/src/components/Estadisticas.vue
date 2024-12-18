<template>
  <div class="alumno-grafico">
    <h1>Selecciona un Alumno y Tipo de Pregunta</h1>

    <!-- Selección del Alumno -->
    <div>
      <label for="alumno">Alumno:</label>
      <select id="alumno" v-model="selectedAlumno">
        <option v-for="alumno in alumnos" :key="alumno.nom" :value="alumno.nom">
          {{ alumno.nom }}
        </option>
      </select>
    </div>

    <!-- Selección del Tipo de Pregunta (opcional) -->
    <div>
      <label for="tipoPregunta">Tipo de Pregunta:</label>
      <select id="tipoPregunta" v-model="selectedTipoPregunta">
        <option value="">Todos los tipos</option> <!-- Opción para todos los tipos -->
        <option v-for="tipo in tiposDePregunta" :key="tipo" :value="tipo">
          {{ tipo }}
        </option>
      </select>
    </div>

    <button @click="fetchGrafico">Mostrar Gráfico</button>

    <!-- Mensaje de Error -->
    <div v-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <!-- Mostrar Gráfico -->
    <div v-if="grafico">
      <h2>Gráfico de {{ selectedAlumno }} 
        <span v-if="selectedTipoPregunta">- {{ selectedTipoPregunta }}</span>
      </h2>
      <img :src="grafico" alt="Gráfico del alumno" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      alumnos: [], // Lista de alumnos
      tiposDePregunta: ['suma', 'resta', 'multiplicacion', 'division'], // Tipos de preguntas
      selectedAlumno: '', // Alumno seleccionado
      selectedTipoPregunta: '', // Tipo de pregunta seleccionado (vacío para mostrar todos los tipos)
      grafico: null, // URL del gráfico
      error: null, // Mensajes de error
    };
  },

  methods: {
    // Obtener la lista de alumnos desde el servidor
    async fetchAlumnos() {
      try {
        const response = await fetch('http://localhost:3000/api/alumnos');
        if (!response.ok) {
          throw new Error('Error al obtener la lista de alumnos');
        }
        this.alumnos = await response.json();
      } catch (err) {
        this.error = `Error: ${err.message}`;
      }
    },

    // Obtener el gráfico correspondiente para el alumno y el tipo de pregunta seleccionados
    async fetchGrafico() {
      if (!this.selectedAlumno) {
        this.error = 'Por favor, selecciona un alumno';
        return;
      }

      this.error = null; // Reseteamos el error
      this.grafico = null; // Reseteamos el gráfico

      try {
        let url = `http://localhost:3000/resultados/${this.selectedAlumno}`;
        
        // Si se seleccionó un tipo de pregunta, agregamos a la URL
        if (this.selectedTipoPregunta) {
          url += `/${this.selectedTipoPregunta}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.mensaje || 'Error al obtener el gráfico');
        }
        const data = await response.json();
        this.grafico = data.imagen; // Asignamos la URL del gráfico
      } catch (err) {
        this.error = `Error: ${err.message}`;
      }
    },
  },

  mounted() {
    this.fetchAlumnos(); // Cargamos los alumnos cuando el componente se monta
  },
};
</script>

<style scoped>
.alumno-grafico {
  font-family: Arial, sans-serif;
  padding: 20px;
}

.error {
  color: red;
}

img {
  max-width: 100%;
  height: auto;
  border: 1px solid #ddd;
  margin-top: 20px;
}
</style>
