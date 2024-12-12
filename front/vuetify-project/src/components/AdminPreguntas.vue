<template>
    <div class="preguntas-admin">
      <h1>Administrar Preguntas</h1>
  
      <!-- Formulario para agregar/editar preguntas -->
      <form @submit.prevent="savePregunta">
        <div>
          <label for="text_pregunta">Texto de la Pregunta:</label>
          <input v-model="form.text_pregunta" id="text_pregunta" required />
        </div>
  
        <div>
          <label for="difficulty_level">Nivel de Dificultad:</label>
          <input type="number" v-model="form.difficulty_level" id="difficulty_level" min="1" max="5" required />
        </div>
  
        <div>
          <label for="respuesta_correcta">Respuesta Correcta:</label>
          <input v-model="form.respuesta_correcta" id="respuesta_correcta" required />
        </div>
  
        <div>
          <label for="type">Tipo:</label>
          <select v-model="form.type" id="type" required>
            <option value="suma">Suma</option>
            <option value="resta">Resta</option>
            <option value="division">División</option>
            <option value="multiplicacion">Multiplicación</option>
          </select>
        </div>
  
        <button type="submit">{{ form.id ? 'Actualizar' : 'Agregar' }} Pregunta</button>
      </form>
  
      <!-- Tabla de preguntas -->
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Texto</th>
            <th>Dificultad</th>
            <th>Respuesta Correcta</th>
            <th>Tipo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pregunta in preguntas" :key="pregunta.id">
            <td>{{ pregunta.id }}</td>
            <td>{{ pregunta.text_pregunta }}</td>
            <td>{{ pregunta.difficulty_level }}</td>
            <td>{{ pregunta.respuesta_correcta }}</td>
            <td>{{ pregunta.type }}</td>
            <td>
              <button @click="editPregunta(pregunta)">Editar</button>
              <button @click="deletePregunta(pregunta.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        preguntas: [],
        form: {
          id: null,
          text_pregunta: '',
          difficulty_level: 1,
          respuesta_correcta: '',
          type: 'suma',
        },
      };
    },
    methods: {
      async fetchPreguntas() {
        try {
          const response = await axios.get('/api/preguntas');
          this.preguntas = response.data;
        } catch (error) {
          console.error('Error al obtener preguntas:', error);
        }
      },
      async savePregunta() {
        try {
          if (this.form.id) {
            // Actualizar pregunta
            await axios.put(`/api/preguntas/${this.form.id}`, this.form);
          } else {
            // Crear nueva pregunta
            await axios.post('/api/preguntas', this.form);
          }
          this.resetForm();
          this.fetchPreguntas();
        } catch (error) {
          console.error('Error al guardar la pregunta:', error);
        }
      },
      editPregunta(pregunta) {
        this.form = { ...pregunta };
      },
      async deletePregunta(id) {
        try {
          await axios.delete(`/api/preguntas/${id}`);
          this.fetchPreguntas();
        } catch (error) {
          console.error('Error al eliminar la pregunta:', error);
        }
      },
      resetForm() {
        this.form = {
          id: null,
          text_pregunta: '',
          difficulty_level: 1,
          respuesta_correcta: '',
          type: 'suma',
        };
      },
    },
    mounted() {
      this.fetchPreguntas();
    },
  };
  </script>
  
  <style>
  .preguntas-admin {
    max-width: 800px;
    margin: auto;
    padding: 1rem;
  }
  
  form {
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  table, th, td {
    border: 1px solid #ddd;
  }
  
  th, td {
    padding: 0.5rem;
    text-align: left;
  }
  
  button {
    margin-right: 0.5rem;
  }
  </style>
  