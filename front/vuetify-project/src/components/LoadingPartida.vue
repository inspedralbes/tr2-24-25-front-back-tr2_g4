<template>
  <div>
    <h1>Administrar Preguntas</h1>

    <!-- Formulario para agregar o editar pregunta -->
    <div>
      <h3>{{ isEditing ? 'Editar Pregunta' : 'Nueva Pregunta' }}</h3>
      <form @submit.prevent="isEditing ? updatePregunta() : addPregunta()">
        <div>
          <label for="text_pregunta">Pregunta:</label>
          <input v-model="newPregunta.text_pregunta" id="text_pregunta" type="text" required />
        </div>
        <div>
          <label for="difficulty_level">Nivel de Dificultad:</label>
          <input v-model="newPregunta.difficulty_level" id="difficulty_level" type="number" required />
        </div>
        <div>
          <label for="respuesta_correcta">Respuesta Correcta:</label>
          <input v-model="newPregunta.respuesta_correcta" id="respuesta_correcta" type="text" required />
        </div>
        <div>
          <label for="type">Tipo:</label>
          <select v-model="newPregunta.type" id="type" required>
            <option value="multiple_choice">Opción múltiple</option>
            <option value="true_false">Verdadero/Falso</option>
            <option value="short_answer">Respuesta corta</option>
          </select>
        </div>
        <button type="submit">{{ isEditing ? 'Actualizar' : 'Crear' }} Pregunta</button>
      </form>
    </div>

    <!-- Listar preguntas -->
    <h2>Lista de Preguntas</h2>
    <table>
      <thead>
        <tr>
          <th>Pregunta</th>
          <th>Nivel de Dificultad</th>
          <th>Respuesta Correcta</th>
          <th>Tipo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="pregunta in preguntas" :key="pregunta.id">
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
      newPregunta: {
        text_pregunta: '',
        difficulty_level: 1,
        respuesta_correcta: '',
        type: 'multiple_choice',
      },
      isEditing: false,
      editingPreguntaId: null,
    };
  },
  mounted() {
    this.fetchPreguntas();
  },
  methods: {
    // Obtener todas las preguntas
    async fetchPreguntas() {
      try {
        const response = await axios.get('http://localhost:5000/api/preguntas');
        this.preguntas = response.data;
      } catch (error) {
        console.error('Error al obtener las preguntas:', error);
      }
    },
    // Crear una nueva pregunta
    async addPregunta() {
      try {
        const response = await axios.post('http://localhost:5000/api/preguntas', this.newPregunta);
        this.preguntas.push(response.data);
        this.resetForm();
      } catch (error) {
        console.error('Error al crear la pregunta:', error);
      }
    },
    // Editar una pregunta
    editPregunta(pregunta) {
      this.isEditing = true;
      this.newPregunta = { ...pregunta };
      this.editingPreguntaId = pregunta.id;
    },
    // Actualizar una pregunta existente
    async updatePregunta() {
      try {
        const response = await axios.put(
          `http://localhost:5000/api/preguntas/${this.editingPreguntaId}`,
          this.newPregunta
        );
        const index = this.preguntas.findIndex((p) => p.id === this.editingPreguntaId);
        this.preguntas[index] = response.data;
        this.resetForm();
      } catch (error) {
        console.error('Error al actualizar la pregunta:', error);
      }
    },
    // Eliminar una pregunta
    async deletePregunta(id) {
      try {
        await axios.delete(`http://localhost:5000/api/preguntas/${id}`);
        this.preguntas = this.preguntas.filter((pregunta) => pregunta.id !== id);
      } catch (error) {
        console.error('Error al eliminar la pregunta:', error);
      }
    },
    // Restablecer el formulario
    resetForm() {
      this.newPregunta = {
        text_pregunta: '',
        difficulty_level: 1,
        respuesta_correcta: '',
        type: 'multiple_choice',
      };
      this.isEditing = false;
      this.editingPreguntaId = null;
    },
  },
};
</script>

<style scoped>
table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
}

th, td {
  padding: 8px;
  text-align: left; 
  border: 1px solid #ddd;
}

button {
  padding: 5px 10px;
  margin-right: 5px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  border: none;
}

button:hover {
  background-color: #0056b3;
}

form div {
  margin-bottom: 10px;
}
</style>
