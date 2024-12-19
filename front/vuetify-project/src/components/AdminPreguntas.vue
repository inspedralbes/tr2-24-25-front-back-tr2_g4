
<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="pa-4 rounded-card" style="background-color: #229de8;">
          <v-card-title class="text-center" style="color: white; font-weight: bold;   font-size: 28px;">Administrar Preguntas</v-card-title>

          <!-- Buscador de preguntas (Card blanco) -->
          <v-divider class="my-4"></v-divider>
          <v-card class="pa-4 rounded-card" style="background-color: white;">
            <v-card-subtitle style="color: black; margin-bottom: 16px; font-weight: bold">BUSCAR PREGUNTAS</v-card-subtitle>
            <v-spacer></v-spacer>
            <v-form @submit.prevent="searchQuestions">
              <v-row>
                <v-col cols="12" md="6">
                  <v-select  
                    v-model="searchCriteria.type"
                    :items="['suma', 'resta', 'multiplicacion', 'division']"
                    label="Selecciona un tipo"
                    outlined
                    dense
                    class="rounded-select"
                    style="color: black; "
                  ></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="searchCriteria.difficulty_level"
                    :items="['1', '2', '3', '4', '5']"
                    label="Selecciona un nivel de dificultad"
                    outlined
                    dense
                    class="rounded-select"
                    style="color: black;"
                  ></v-select>
                </v-col>
                <v-col cols="12" class="text-right">
                  <v-btn type="submit" color="blue" class="rounded-btn" style="color: black;">BUSCAR</v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card>

          <!-- Agregar nueva pregunta (Card blanco) -->
          <v-divider class="my-4"></v-divider>
          <v-card class="pa-4 rounded-card" style="background-color: white;">
            <v-card-subtitle style="color: black;margin-bottom: 16px; font-weight: bold">AGREGAR NUEVA PREGUNTA</v-card-subtitle>
            <v-form @submit.prevent="addQuestion">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="newQuestion.text_pregunta"
                    label="Pregunta"
                    outlined
                    dense
                    class="rounded-input"
                    required
                    style="color: black;"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="newQuestion.difficulty_level"
                    label="Nivel de dificultad (1-5)"
                    outlined
                    dense
                    type="number"
                    min="1"
                    max="5"
                    class="rounded-input"
                    required
                    style="color: black;"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="newQuestion.respuesta_correcta"
                    label="Respuesta correcta"
                    outlined
                    dense
                    class="rounded-input"
                    required
                    style="color: black;"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="newQuestion.type"
                    :items="['suma', 'resta', 'multiplicacion', 'division']"
                    label="Selecciona un tipo"
                    outlined
                    dense
                    class="rounded-select"
                    required
                    style="color: black;"
                  ></v-select>
                </v-col>
                <v-col cols="12" class="text-right">
                  <v-btn type="submit" color="green" class="rounded-btn" style="color: black;">Agregar Pregunta</v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card>

        <!-- Lista de preguntas -->
        <v-divider class="my-4"></v-divider>
        <v-card-subtitle style="color: black; margin-bottom: 16px; font-weight: bold">LISTA DE PREGUNTAS</v-card-subtitle>
        <v-row v-if="filteredQuestions.length">
          <v-col cols="12" md="6" v-for="question in filteredQuestions" :key="question.id">
            <!-- Cambiar el color de fondo a blanco -->
            <v-card class="mb-4 rounded-card" style="background-color: white;">
              <v-card-title style="color: black;">{{ question.text_pregunta }}</v-card-title>
              <v-card-subtitle>
                <div style="color: black;"><strong>Tipo:</strong> {{ question.type }}</div>
                <div style="color: black;"><strong>Dificultad:</strong> {{ question.difficulty_level }}</div>
                <div style="color: black;"><strong>Respuesta:</strong> {{ question.respuesta_correcta }}</div>
              </v-card-subtitle>
              <v-card-actions>
                <v-btn color="black" class="rounded-btn" style="color: black; background-color: yellow;" @click="editQuestion(question)">Editar</v-btn>
                <v-btn color="white" class="rounded-btn" style="color: black; background-color: red;" @click="deleteQuestion(question.id)">Eliminar</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
        <v-alert v-else type="info" class="mt-4" style="color: black;">No se encontraron preguntas.</v-alert>    </v-card>
    </v-col>
    </v-row>
  </v-container>
</template>


<script>
import axios from "axios";

export default {
  data() {
    return {
      questions: [],
      filteredQuestions: [],
      newQuestion: {
        text_pregunta: "",
        difficulty_level: "",
        respuesta_correcta: "",
        type: ""
      },
      editingQuestion: null,
      searchCriteria: {
        type: "",
        difficulty_level: ""
      }
    };
  },
  methods: {
    async fetchQuestions() {
      try {
        const response = await axios.get('http://localhost:3000/api/preguntas');
        this.questions = response.data;
        this.filteredQuestions = response.data;
      } catch (error) {
        console.error("Error al obtener las preguntas", error);
      }
    },

    async addQuestion() {
      try {
        const response = await axios.post('http://localhost:3000/api/preguntas', this.newQuestion);
        this.questions.push(response.data);
        this.filteredQuestions.push(response.data);
        this.newQuestion = { text_pregunta: "", difficulty_level: "", respuesta_correcta: "", type: "" };
      } catch (error) {
        console.error("Error al agregar la pregunta", error);
      }
    },

    editQuestion(question) {
      this.editingQuestion = { ...question };
    },

    async updateQuestion() {
      try {
        await axios.put(`http://localhost:3000/api/preguntas/${this.editingQuestion.id}`, this.editingQuestion);
        this.fetchQuestions();
        this.cancelEdit();
      } catch (error) {
        console.error("Error al actualizar la pregunta", error);
      }
    },

    async deleteQuestion(id) {
      try {
        await axios.delete(`http://localhost:3000/api/preguntas/${id}`);
        this.fetchQuestions();
      } catch (error) {
        console.error("Error al eliminar la pregunta", error);
      }
    },

    cancelEdit() {
      this.editingQuestion = null;
    },

    searchQuestions() {
      this.filteredQuestions = this.questions.filter(question => {
        return (
          (!this.searchCriteria.type || question.type === this.searchCriteria.type) &&
          (!this.searchCriteria.difficulty_level || question.difficulty_level === parseInt(this.searchCriteria.difficulty_level))
        );
      });
    }
  },
  created() {
    this.fetchQuestions();
  }
};
</script>



<style scoped>
.rounded-card {
  border-radius: 16px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.rounded-input, .rounded-select {
  border-radius: 16px;
}

.rounded-btn {
  border-radius: 16px;
}

.text-primary {
  color: #1976d2;
}

.v-card {
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

/* Aplicar estilos al select */
select.input-field {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: black;
  background-color: white;
  cursor: pointer;
  font-size: 16px;
}

select.input-field:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  color: black;
}

h1 {
  text-align: center;
  color: black;
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
  color: black;
  background-color: white;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
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
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.question-details {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  color: black;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn-edit {
  background-color: #28a745;
  color: black;
}

.btn-delete {
  background-color: #dc3545;
  color: black;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  background-color: black;
  color: white;
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
  background-color: #007bff;
  color: white;
}

.btn-cancel {
  background-color: #ccc;
  color: black;
}

.btn-submit, .btn-cancel {
  width: 48%;
}
</style>
