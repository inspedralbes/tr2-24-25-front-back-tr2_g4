<template>
    <div class="alumno-grafico">
      <h1>Selecciona un Alumno</h1>
  
      <div>
        <label for="alumno">Alumno:</label>
        <select id="alumno" v-model="selectedAlumno">
          <option v-for="alumno in alumnos" :key="alumno.nom" :value="alumno.nom">
            {{ alumno.nom }}
          </option>
        </select>
        <button @click="fetchGrafico">Mostrar Gráfico</button>
      </div>
  
      <div v-if="error" class="error">
        <p>{{ error }}</p>
      </div>
  
      <div v-if="grafico">
        <h2>Gráfico de {{ selectedAlumno }}</h2>
        <img :src="grafico" alt="Gráfico del alumno" />
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        alumnos: [],
        selectedAlumno: '',
        grafico: null,
        error: null,
      };
    },
        methods: {
            async fetchAlumnos() {
    try {
        const response = await fetch('http://localhost:3000/api/alumnos');
        this.alumnos = await response.json();
    } catch (err) {
        this.error = `Error al obtener la lista de alumnos: ${err.message}`;
    }
    },

    async fetchGrafico() {
    if (!this.selectedAlumno) {
        this.error = 'Por favor, selecciona un alumno';
        return;
    }

    this.error = null;
    this.grafico = null;

    try {
        const response = await fetch(`http://localhost:3000/resultados/${this.selectedAlumno}`);
        if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al obtener el gráfico');
        }
        const data = await response.json();
        this.grafico = data.imagen; // URL completa del gráfico
        console.log(this.grafico)
    } catch (err) {
        this.error = err.message;
    }
    },
},

    mounted() {
      this.fetchAlumnos();
    },
  };
  </script>
  
  <style>
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
  