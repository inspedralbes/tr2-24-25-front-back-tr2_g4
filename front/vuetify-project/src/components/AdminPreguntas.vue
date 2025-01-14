<template>
  <div class="main-container">

    <!-- Administrar Preguntas -->
    <div class="admin-section">
      <div class="form-container">
        <h1 class="custom-title"> Administrar Preguntas ✏️📋</h1>
   

        <h2 class="custom-title2">Agregar Nueva Pregunta</h2>
        <p class="custom-title4">Crea y Explora Preguntas:</p>
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
            placeholder="Nivel de dificultad (1-5)"
            min="1"
            max="5"
            required
          />
          <input
            v-model="newQuestion.respuesta_correcta"
            type="text"
            placeholder="Respuesta correcta"
            required
          />
          <select v-model="newQuestion.type" class="input-field" required>
            <option disabled value="">Selecciona un tipo</option>
            <option value="suma">Suma</option>
            <option value="resta">Resta</option>
            <option value="multiplicacion">Multiplicación</option>
            <option value="division">División</option>
          </select>
          <button type="submit" class="custom-title3">Agregar Pregunta</button>
        </form>
      </div>
    </div>

    <!-- Lista de Preguntas -->
    <div class="questions-section full-width">
      <div class="form-container">

        <h2 style="padding: 2%;" class="custom-title">Lista de Preguntas ✏️📜</h2>
        <h1 class="custom-title4">Explora la Lista de Preguntas para Editar o Eliminar:</h1>

        <v-text-field
          v-model="searchQuery"
          label="Buscar preguntas"
          class="mb-4"
          outlined
          clearable
        ></v-text-field>
        <v-select
          v-model="filterType"
          :items="questionTypes"
          label="Filtrar por tipo"
          class="mb-4"
          outlined
          clearable
        ></v-select>

        <div v-if="filteredQuestions.length" class="questions-list">
          <ul>
            <li v-for="question in filteredQuestions" :key="question.id" class="question-item">
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

        <div v-else class="no-results-message">
          <v-alert type="error" dismissible color="red" style="al">
            No se encontraron preguntas que coincidan con la búsqueda.
          </v-alert>
        </div>

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
              placeholder="Nivel de dificultad (1-5)"
              min="1"
              max="5"
              required
            />
            <input
              v-model="editingQuestion.respuesta_correcta"
              type="text"
              placeholder="Respuesta correcta"
              required
            />
            <select v-model="editingQuestion.type" class="input-field" required>
              <option disabled value="">Selecciona un tipo</option>
              <option value="suma">Suma</option>
              <option value="resta">Resta</option>
              <option value="multiplicacion">Multiplicación</option>
              <option value="division">División</option>
            </select>
            <div class="modal-actions">
              <button type="submit" class="btn-submit">Actualizar</button>
              <button @click="cancelEdit" class="btn-cancel">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Snackbar de Vuetify para mostrar el mensaje -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" top right>
      {{ snackbar.message }}
      <v-btn color="white" @click="snackbar.show = false">Cerrar</v-btn>
    </v-snackbar>
  </div>
</template>



<script>
const API_URL = import.meta.env.VITE_API_BACK;

export default {
  data() {
    return {
      questions: [], // Lista de preguntas
      searchQuery: "", // Texto del buscador
      filterType: null, // Tipo seleccionado para filtrar
      questionTypes: ["suma", "resta", "multiplicacion", "division"], // Tipos disponibles
      newQuestion: {
        text_pregunta: "",
        difficulty_level: "",
        respuesta_correcta: "",
        type: ""
      },
      editingQuestion: null, // Información de la pregunta que estamos editando
      snackbar: {
        show: false,
        message: '',
        color: 'success' // Por defecto, el mensaje será verde (éxito)
      }
    };
  },
  computed: {
  filteredQuestions() {
    return this.questions.filter((question) => {
      // Verificamos si 'text_pregunta' existe y no es undefined
      const matchesSearch = question.text_pregunta && question.text_pregunta.toLowerCase
        ? question.text_pregunta.toLowerCase().includes(this.searchQuery.toLowerCase())
        : false;

      // Verificamos si el tipo de la pregunta coincide con el filtro
      const matchesType = !this.filterType || question.type === this.filterType;
      
      return matchesSearch && matchesType;
    });
  }

  },
  methods: {
    // Obtener todas las preguntas desde el backend
    async fetchQuestions() {
      try {
        const response = await fetch(`${API_URL}./api/preguntas`);
        if (!response.ok) {
          throw new Error("Error al obtener las preguntas");
        }
        this.questions = await response.json();
      } catch (error) {
        console.error("Error al obtener las preguntas", error);
      }
    },
    methods: {
    resetFilters() {
      this.searchQuery = '';
      this.filterType = null;
    },
  },
    // Agregar una nueva pregunta
    async addQuestion() {
      try {
        const response = await fetch(`${API_URL}./api/preguntas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(this.newQuestion)
        });
        if (!response.ok) {
          throw new Error("Error al agregar la pregunta");
        }
        const newQuestion = await response.json();
        this.questions.push(newQuestion); // Agregar la pregunta a la lista
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
        const response = await fetch(`${API_URL}./api/preguntas/${this.editingQuestion.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(this.editingQuestion)
        });
        if (!response.ok) {
          throw new Error("Error al actualizar la pregunta");
        }
        this.fetchQuestions(); // Refrescar la lista de preguntas
        this.snackbar.message = 'Pregunta actualizada con éxito';
        this.snackbar.color = 'success'; // Color verde
        this.snackbar.show = true; // Mostrar el mensaje
        this.cancelEdit(); // Cerrar el modal
      } catch (error) {
        this.snackbar.message = 'Error al actualizar la pregunta';
        this.snackbar.color = 'error'; // Color rojo
        this.snackbar.show = true; // Mostrar el mensaje
        console.error("Error al actualizar la pregunta", error);
      }
    },

    // Eliminar una pregunta
    async deleteQuestion(id) {
      try {
        const response = await fetch(`${API_URL}./api/preguntas/${id}`, {
          method: "DELETE"
        });
        if (!response.ok) {
          throw new Error("Error al eliminar la pregunta");
        }
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
.no-results-message {
  color: #dc3545;
  font-weight: bold;
  text-align: center;
  margin-top: 10px;
}
.p {
  font-size: 18px;
  color: #ff0000; /* Rojo para resaltar */
  text-align: center;
  margin-top: 20px;
}

.v-alert {
  margin-top: 20px;
  border-radius: 10px;
  font-weight: bold;
  padding: 20px;
  color: #fff;
  background-color: #d32f2f; /* Color rojo de error */
  border: 2px solid #b71c1c;
}
/* Estilo del div de "Administrar Preguntas" */
.admin-section {
  background-color: #73b0e6; /* Fondo azul claro */
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}


.custom-title {
  font-family: 'Arial Black', sans-serif; /* Cambia a una fuente más destacada */
  font-weight: bold;
  font-size: 24px; /* Tamaño de texto más grande */
  color: #000000; /* Azul para darle un toque moderno */
  text-align: center; /* Centrar el título */
  text-transform: uppercase; /* Convertir el texto a mayúsculas */
  margin-bottom: 20px; /* Espacio debajo del título */
  letter-spacing: 1px; /* Espaciado entre letras */
}
.custom-title4 {
  font-family: 'Arial Black', sans-serif; /* Cambia a una fuente más destacada */
  font-weight: bold;
  font-size: 15px; /* Tamaño de texto más grande */
  color: #1c4b7c; /* Azul para darle un toque moderno */
  margin-bottom: 20px; /* Espacio debajo del título */
  letter-spacing: 1px; /* Espaciado entre letras */
  text-align: left; /* Alinea el texto a la izquierda */

}

.custom-title2 {
  font-family: 'Arial Black', sans-serif; /* Cambia a una fuente más destacada */
  font-weight: bold;
  font-size: 20px; /* Tamaño de texto más grande */
  color: #1c4b7c; /* Azul para darle un toque moderno */
  margin-bottom: 20px; /* Espacio debajo del título */
  letter-spacing: 1px; /* Espaciado entre letras */
}



.custom-title3 {
  font-family: 'Arial Black', sans-serif; /* Cambia a una fuente más destacada */
  font-weight: bold;
  font-size: 15px; /* Tamaño de texto más grande */
  color: #000000; /* Azul para darle un toque moderno */
  margin-bottom: 20px; /* Espacio debajo del título */
  letter-spacing: 1px; /* Espaciado entre letras */
  background-color: yellow;
}
/* Aplicar estilos al select */
select.input-field {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: black; /* Texto negro */
  background-color: white; /* Fondo blanco */
  cursor: pointer;
  font-size: 16px; /* Tamaño del texto */
}


select.input-field:focus {
  border-color: #007bff; /* Color azul al enfocar */
  outline: none;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); /* Sombra azul al enfocar */
}


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
  background-color: #ffffff; /* Fondo blanco */
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
.main-container {
  display: flex;
  flex-direction: column;
  gap: 20px; /* Espacio entre secciones */
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
  background-color: #539ae6; /* Fondo negro en el modal */
  color: white; /* Texto blanco */
  border: 1px solid #ccc;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  width: 300px;
  text-align: center;
  margin-left: 100px; /* Desplazar el diseño a la derecha */

}


/* Estilo para los botones de actualizar y cancelar en el modal */
.modal-actions {
  display: flex;
  justify-content: space-between;
  
}

/* Botón de actualización verde */
.btn-submit {
  background-color: #28a745; /* Fondo verde */
  color: white; /* Texto blanco */
  border: none; /* Sin borde */
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

/* Botón de cancelar rojo */
.btn-cancel {
  background-color: #dc3545; /* Fondo rojo */
  color: white; /* Texto blanco */
  border: none; /* Sin borde */
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

/* Estilo para los botones al pasar el mouse */
.btn-submit:hover {
  background-color: #218838; /* Color verde más oscuro */
}

.btn-cancel:hover {
  background-color: #c82333; /* Color rojo más oscuro */
}
.questions-section {
  background-color: #73b0e6; /* Fondo azul claro */
  padding: 20px;
  border-radius: 8px;
}
.btn-submit, .btn-cancel {
  width: 48%;
}
/* Estilos del dialog de Vuetify */
.v-dialog__content {
  padding: 20px;
}

.v-card {
  background-color: #4caf50; /* Color verde para el fondo */
  color: white;
}

.v-card-title {
  font-size: 24px;
  font-weight: bold;
}
</style>

