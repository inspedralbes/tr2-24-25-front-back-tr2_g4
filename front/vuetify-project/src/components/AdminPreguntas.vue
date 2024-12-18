<template>
  <div class="container">
    <h1>Administrar Preguntas</h1>
    <div class="form-container">
      <h2>Agregar Nueva Pregunta</h2>
      <form @submit.prevent="addQuestion">
        <input 
          v-model="newQuestion.text_pregunta" 
          type="text" 
          placeholder="Pregunta" 
          required 
        />
        <input 
          v-model="newQuestion.difficulty_level" 
          type="number" 
          placeholder="Nivel de dificultad (1-4)" 
          min="1" max="4" 
          required 
        />
        <input 
          v-model="newQuestion.respuesta_correcta" 
          type="text" 
          placeholder="Respuesta correcta" 
          required 
        />
        <input 
          v-model="newQuestion.type" 
          type="text" 
          placeholder="Tipo (suma, resta, etc.)" 
          required 
        />
        <button type="submit" class="btn-submit">Agregar Pregunta</button>
      </form>
    </div>

    <!-- Lista de preguntas -->
    <div v-if="questions.length" class="questions-list">
      <h2>Lista de Preguntas</h2>
      <ul>
        <li v-for="question in questions" :key="question.id" class="question-item">
          <div class="question-details">
            <span><strong>Pregunta:</strong> {{ question.text_pregunta }}</span>
            <span><strong>Dificultad:</strong> {{ question.difficulty_level }}</span>
            <span><strong>Respuesta Correcta:</strong> {{ question.respuesta_correcta }}</span>
            <span><strong>Tipo:</strong> {{ question.type }}</span>
          </div>
          <div class="actions">
            <button @click="editQuestion(question)" class="btn-edit">Editar</button>
            <button @click="deleteQuestion(question.id)" class="btn-delete">Eliminar</button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Modal de edición -->
    <div v-if="editingQuestion" class="modal">
      <h2>Editar Pregunta</h2>
      <form @submit.prevent="updateQuestion">
        <input 
          v-model="editingQuestion.text_pregunta" 
          type="text" 
          placeholder="Pregunta" 
          required 
        />
        <input 
          v-model="editingQuestion.difficulty_level" 
          type="number" 
          placeholder="Nivel de dificultad (1-4)" 
          min="1" max="4" 
          required 
        />
        <input 
          v-model="editingQuestion.respuesta_correcta" 
          type="text" 
          placeholder="Respuesta correcta" 
          required 
        />
        <input 
          v-model="editingQuestion.type" 
          type="text" 
          placeholder="Tipo (suma, resta, etc.)" 
          required 
        />
        <div class="modal-actions">
          <button type="submit" class="btn-submit">Actualizar</button>
          <button @click="cancelEdit" class="btn-cancel">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      questions: [], // Lista de preguntas
      newQuestion: {
        text_pregunta: "",
        difficulty_level: "",
        respuesta_correcta: "",
        type: ""
      },
      editingQuestion: null, // Información de la pregunta que estamos editando
    };
  },
  methods: {
    // Obtener todas las preguntas desde el backend
    async fetchQuestions() {
      try {
        const response = await axios.get('http://localhost:3000/api/preguntas');
        this.questions = response.data;
      } catch (error) {
        console.error("Error al obtener las preguntas", error);
      }
    },

    // Agregar una nueva pregunta
    async addQuestion() {
      try {
        const response = await axios.post('http://localhost:3000/api/preguntas', this.newQuestion);
        this.questions.push(response.data); // Agregar la pregunta a la lista
        this.newQuestion = { text_pregunta: "", difficulty_level: "", respuesta_correcta: "", type: "" }; // Limpiar formulario
      } catch (error) {
        console.error("Error al agregar la pregunta", error);
      }
    },

    // Editar una pregunta
    editQuestion(question) {
      this.editingQuestion = { ...question }; // Copiar los datos de la pregunta seleccionada
    },

    // Actualizar una pregunta
    async updateQuestion() {
      try {
        await axios.put(`http://localhost:3000/api/preguntas/${this.editingQuestion.id}`, this.editingQuestion);
        this.fetchQuestions(); // Refrescar la lista de preguntas
        this.cancelEdit(); // Cerrar el modal
      } catch (error) {
        console.error("Error al actualizar la pregunta", error);
      }
    },

    // Eliminar una pregunta
    async deleteQuestion(id) {
      try {
        await axios.delete(`http://localhost:3000/api/preguntas/${id}`);
        this.fetchQuestions(); // Refrescar la lista de preguntas
      } catch (error) {
        console.error("Error al eliminar la pregunta", error);
      }
    },

    // Cancelar la edición de una pregunta
    cancelEdit() {
      this.editingQuestion = null;
    }
  },
  created() {
    this.fetchQuestions(); // Obtener las preguntas al cargar el componente
  }
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: white; /* Fondo blanco */
  color: black; /* Texto negro */
}

h1 {
  text-align: center;
  color: black; /* Título en negro */
}

.form-container, .questions-list {
  margin-bottom: 20px;
}

form input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: black; /* Texto negro en los campos del formulario */
  background-color: white; /* Fondo blanco en los campos */
}

button {
  padding: 10px 20px;
  background-color: #007bff; /* Fondo azul */
  color: white; /* Texto blanco */
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.questions-list ul {
  list-style-type: none;
  padding: 0;
}

.question-item {
  display: flex;
  justify-content: space-between;
  background-color: #f9f9f9; /* Fondo blanco */
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.question-details {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  color: black; /* Texto negro */
}

.actions {
  display: flex;
  gap: 10px;
}

.btn-edit {
  background-color: #28a745; /* Fondo verde */
  color: black; /* Texto negro */
}

.btn-delete {
  background-color: #dc3545; /* Fondo rojo */
  color: black; /* Texto negro */
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  background-color: black; /* Fondo negro en el modal */
  color: white; /* Texto blanco */
  border: 1px solid #ccc;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  width: 300px;
  text-align: center;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
}

.btn-submit {
  background-color: #007bff; /* Fondo azul */
  color: white; /* Texto blanco */
}

.btn-cancel {
  background-color: #ccc; /* Fondo gris */
  color: black; /* Texto negro */
}

.btn-submit, .btn-cancel {
  width: 48%;
}

</style>
