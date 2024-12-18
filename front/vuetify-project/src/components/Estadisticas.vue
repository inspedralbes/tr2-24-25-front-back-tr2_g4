<template>
  <div class="alumno-grafico-container">
    <!-- Cabecera -->
    <h1 class="title">Gráfico de Resultados</h1>
    <p class="subtitle">Selecciona un alumno y el tipo de pregunta para visualizar su rendimiento.</p>

    <!-- Tarjeta de selección -->
    <div class="card">
      <div class="form-group">
        <label for="alumno">Alumno:</label>
        <select id="alumno" v-model="selectedAlumno" class="select-field">
          <option value="" disabled selected>Selecciona Alumno</option> <!-- Opción por defecto -->
          <option v-for="alumno in alumnos" :key="alumno.nom" :value="alumno.nom">
            {{ alumno.nom }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="tipoPregunta">Tipo de Pregunta:</label>
        <select id="tipoPregunta" v-model="selectedTipoPregunta" class="select-field">
          <option value="">Todos los tipos</option>
          <option v-for="tipo in tiposDePregunta" :key="tipo" :value="tipo">
            {{ tipo }}
          </option>
        </select>
      </div>

      <!-- Botón -->
      <div class="button-container">
        <button @click="fetchGrafico" class="action-button">Mostrar Gráfico</button>
      </div>
    </div>

    <!-- Mensaje de Error con v-alert -->
    <v-alert v-if="error" type="error" dismissible>
      {{ error }}
    </v-alert>

    <!-- Mostrar Gráfico -->
    <div v-if="grafico" class="grafico-container card">
      <h2>
        Resultados de {{ selectedAlumno }}
        <span v-if="selectedTipoPregunta"> - {{ selectedTipoPregunta }}</span>
      </h2>
      <img :src="grafico" alt="Gráfico del alumno" class="grafico-img" />
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
        this.error = `${err.message}`;
      }
    },

    // Obtener el gráfico correspondiente
    async fetchGrafico() {
      if (!this.selectedAlumno) {
        this.error = 'Por favor, selecciona un alumno';
        return;
      }

      this.error = null;
      this.grafico = null;

      try {
        let url = `http://localhost:3000/resultados/${this.selectedAlumno}`;
        if (this.selectedTipoPregunta) {
          url += `/${this.selectedTipoPregunta}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.mensaje || 'Error al obtener el gráfico');
        }
        const data = await response.json();
        this.grafico = data.imagen;
      } catch (err) {
        this.error = `${err.message}`;
      }
    },
  },

  mounted() {
    this.fetchAlumnos();
  },
};
</script>

<style scoped>
/* Estilos Generales */
.alumno-grafico-container {
  font-family: 'Roboto', Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
  background-color: #97a5e4; /* Aquí cambiamos el color de fondo */
  border-radius: 20px; /* Bordes redondeados para el contenedor */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Sombra suave para resaltar el contenedor */
}

.title {
  font-size: 28px;
  text-align: center;
  color: #3f51b5;
  margin-bottom: 10px;
}

.subtitle {
  text-align: center;
  margin-bottom: 20px;
  font-size: 16px;
  color: #555;
}

.card {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

/* Formulario */
.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #555;
}

.select-field {
  width: 100%;
  padding: 10px;
  border: 2px solid #3f51b5; /* Color del borde */
  border-radius: 8px;
  font-size: 16px;
  color: #333;
  background-color: #f9f9f9; /* Fondo claro */
  appearance: none; /* Elimina el estilo nativo */
  -webkit-appearance: none;
  -moz-appearance: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.select-field:focus {
  outline: none;
  border-color: #303f9f;
  box-shadow: 0 0 5px rgba(63, 81, 181, 0.5); /* Sombra al enfocar */
}

.select-field option {
  padding: 10px;
  background-color: #fff; /* Fondo de opciones */
  color: #333; /* Texto de opciones */
}

.select-field option:hover {
  background-color: #e0e0e0; /* Fondo al pasar el cursor */
}

.button-container {
  text-align: center;
}

.action-button {
  background-color: #3f51b5;
  color: #fff;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.action-button:hover {
  background-color: #303f9f;
}

/* Gráfico */
.grafico-container {
  text-align: center;
  border-radius: 10px; /* Bordes redondeados */
  padding: 20px;
  background-color: #f9f9f9; /* Fondo suave */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Sombra para destacar el área */
}

.grafico-container h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 15px;
}

.grafico-img {
  max-width: 100%;
  height: auto;
  border: 1px solid #ddd;
  border-radius: 10px; /* Bordes redondeados para la imagen */
}

/* Diseño del Alert */
.v-alert {
  margin-top: 20px;
  border-radius: 10px;
  font-weight: bold;
  padding: 20px;
  color: #fff;
  background-color: #d32f2f; /* Color rojo de error */
  border: 2px solid #b71c1c;
}
</style>