<template>
  <div class="main-container">
    <!-- Administrar Aulas -->
    <div class="admin-section">
      <div class="form-container">
        <h1 class="custom-title">Gestión de Aulas</h1>

        <!-- Formulario para agregar o actualizar un aula -->
        <h2 class="custom-title2">{{ editMode ? 'Editar Aula' : 'Agregar Nueva Aula' }}</h2>
        <label class="custom-title4">Seleccionar Alumnos</label>

        <form @submit.prevent="saveAula">
          <input
            type="text"
            v-model="aula.nombre"
            placeholder="Nombre del aula"
            required
            style="color: black;"
            class="input-nombre-aula"
          />
          <div class="checkbox-group">
            <div v-for="user in users" :key="user.id" class="checkbox-item">
              <input
                type="checkbox"
                :value="user.nom + ' ' + user.cognom"
                v-model="aula.alumnos"
                :id="'user-' + user.id"
              />
              <label :for="'user-' + user.id">{{ user.nom }} {{ user.cognom }}</label>
            </div>
          </div>

          <v-spacer style="padding: 5px;"></v-spacer>
          <button type="submit" class="custom-title3">
            {{ editMode ? 'Actualizar Aula' : 'Crear Aula' }}
          </button>
          <button type="button" v-if="editMode" @click="cancelEdit" class="btn-cancel">Cancelar</button>
        </form>
      </div>
    </div>

    <!-- Lista de Aulas -->
    <div class="questions-section full-width">
      <div class="form-container">
        <h2 class="custom-title">Listado de Aulas</h2>
        <ul v-if="aulas.length" class="questions-list">
          <li v-for="aula in aulas" :key="aula.nombre" class="question-item">
            <div class="question-details">
              <span><strong>Nombre del Aula: </strong> {{ aula.nombre }}</span>
              <span><strong>Alumnos:</strong> {{ aula.alumnos.join(', ') }}</span>
            </div>
            <div class="actions">
              <button @click="editAula(aula)" class="btn-edit">Editar</button>
              <button @click="confirmDelete(aula)" class="btn-delete">Eliminar</button>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Modal de Confirmación de Eliminación -->
    <div v-if="showDeleteModal" class="delete-modal">
      <div class="modal-content" style="background-color:#73b0e6 ;">
        <p style="color: black;">¿Seguro que deseas eliminar el aula "{{ aulaToDelete }}"?</p>
        <button @click="deleteAula" class="btn-confirm">Sí</button>
        <button @click="cancelDelete" class="btn-cancel">No</button>
      </div>
    </div>

    <!-- Snackbar para mensajes -->
    <v-snackbar
      v-model="snackbar.show"
      :timeout="snackbar.timeout"
      :color="snackbar.color"
      class="centered-snackbar"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>


<style scoped>
/* Reutilización de los estilos */
.admin-section, .questions-section {
  background-color: #73b0e6;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;

}

.input-nombre-aula {
  background-color: #ffffff; /* Fondo blanco */
  padding: 10px; /* Espaciado interno */
  border: 1px solid #ccc; /* Borde gris claro */
  border-radius: 4px; /* Bordes redondeados */
  font-size: 16px; /* Tamaño de texto */
  margin-top: 10px; /* Separación del título */
  margin-bottom: 20px; /* Espaciado inferior */
  width: 100%; /* Ancho completo */
  box-sizing: border-box; /* Incluye padding y borde en el ancho total */
}

/* Snackbar centrado y desplazado ligeramente hacia la derecha */
.centered-snackbar {
  position: fixed;
  top: 50%; /* Centrado verticalmente */
  left: 55%; /* Desplazado un poco hacia la derecha */
  transform: translate(-50%, -50%); /* Ajusta el centro exactamente */
  z-index: 9999;
  font-size: 24px; /* Aumentar tamaño del texto para hacerlo más grande */
  text-align: center;
  padding: 30px; /* Aumentar el padding para hacerlo más grande */
  border-radius: 12px; /* Bordes redondeados más pronunciados */
  width: 400px; /* Ancho más grande para que el contenido se vea mejor */
  max-width: 90%; /* Evita que se desborde en pantallas pequeñas */
  box-sizing: border-box; /* Incluye padding y bordes en el cálculo del tamaño */
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
.custom-title, .custom-title2, .custom-title3 {
  font-family: 'Arial Black', sans-serif;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.custom-title {
  font-size: 24px;
  color: #000;
  text-align: center;
  margin-bottom: 20px;
}
.custom-title2 {
  font-family: 'Arial Black', sans-serif; /* Cambia a una fuente más destacada */
  font-weight: bold;
  font-size: 20px; /* Tamaño de texto más grande */
  color: #1c4b7c; /* Azul para darle un toque moderno */
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
}

.custom-title3 {
  font-size: 15px;
  color: #000;
  background-color: yellow;
}

.questions-list {
  list-style: none;
  padding: 0;
}
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px; /* Espaciado entre cada fila de checkbox */
}

.checkbox-item {
  display: flex;
  align-items: center; /* Alinea verticalmente el checkbox y el texto */
  gap: 10px; /* Espaciado entre el checkbox y el texto */
}

.checkbox-item input[type="checkbox"] {
  width: 20px; /* Tamaño del checkbox */
  height: 20px;
  cursor: pointer; /* Cambia el cursor al pasar sobre el checkbox */
  appearance: checkbox; /* Mantiene la apariencia estándar del checkbox */
}

.checkbox-item input[type="checkbox"]:checked {
  background-color: green; /* Fondo verde cuando está marcado */
  border-color: green; /* Cambia el borde a verde */
}

.checkbox-item label {
  font-size: 16px; /* Ajusta el tamaño del texto */
  color: #333; /* Color del texto */
  cursor: pointer; /* Hace clickeable el texto */
}


.question-item {
  display: flex;
  justify-content: space-between;
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.question-details {
  max-width: 70%;
  color: black;
  display: flex; /* Asegura que los elementos se alineen */
  flex-direction: column; /* Apila los elementos verticalmente */
  gap: 8px; /* Espaciado entre los elementos de texto */
}

.actions {
  display: flex;
  gap: 10px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  opacity: 0.9;
}

.btn-edit {
  background-color: #28a745;
  color: black;
}

.btn-delete {
  background-color: #dc3545;
  color: black;
}

.btn-cancel {
  background-color: #ccc;
  color: black;
}
.delete-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Fondo oscuro */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000; /* Asegúrate de que se superponga al contenido */
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.modal-content p {
  font-size: 18px;
  margin-bottom: 20px;
}

.modal-content button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px;
}

.btn-confirm {
  background-color: #28a745; /* Verde */
  color: white;
}

.btn-cancel {
  background-color: #dc3545; /* Rojo */
  color: white;
}

</style>


<script>
import axios from "axios";

export default {
  data() {
    return {
      aulas: [], // Lista de aulas obtenidas del servidor
      users: [], // Lista de usuarios obtenidos del servidor
      aula: {
        nombre: "",
        alumnos: [],
      },
      editMode: false, // Indica si estamos en modo edición
      showDeleteModal: false, // Para mostrar el modal de confirmación
      aulaToDelete: null, // Nombre del aula a eliminar
      snackbar: {
        show: false,
        text: "",
        color: "success",
        timeout: 3000,
      },
    };
  },
  methods: {
    async fetchAulas() {
      try {
        const response = await axios.get("http://localhost:3000/api/aulas");
        this.aulas = response.data.aulas;
      } catch (error) {
        this.showSnackbar("Error al obtener las aulas.", "error");
      }
    },
    async fetchUsers() {
      try {
        const response = await axios.get("http://localhost:3000/api/users");
        this.users = response.data.users;
      } catch (error) {
        this.showSnackbar("Error al obtener los usuarios.", "error");
      }
    },
    async saveAula() {
      try {
        if (this.editMode) {
          await axios.put(`http://localhost:3000/api/aulas/${this.aula.nombre}`, {
            alumnos: this.aula.alumnos,
          });
          this.showSnackbar("Aula actualizada correctamente.");
        } else {
          await axios.post("http://localhost:3000/api/aulas", this.aula);
          this.showSnackbar("Aula creada correctamente.");
        }

        this.resetForm();
        this.fetchAulas();
      } catch (error) {
        this.showSnackbar("Hubo un error al guardar el aula.", "error");
      }
    },
    editAula(aula) {
      this.aula = { ...aula };
      this.editMode = true;
    },
    confirmDelete(aula) {
      this.aulaToDelete = aula.nombre; // Guarda el nombre del aula a eliminar
      this.showDeleteModal = true; // Muestra el modal
    },
    cancelDelete() {
      this.showDeleteModal = false; // Cierra el modal sin eliminar
      this.aulaToDelete = null;
    },
    async deleteAula() {
      try {
        await axios.delete(`http://localhost:3000/api/aulas/${this.aulaToDelete}`);
        this.showSnackbar("Aula eliminada correctamente.");
        this.fetchAulas();
      } catch (error) {
        this.showSnackbar("Hubo un error al eliminar el aula.", "error");
      }
      this.showDeleteModal = false; // Cierra el modal después de eliminar
      this.aulaToDelete = null;
    },
    cancelEdit() {
      this.resetForm();
    },
    resetForm() {
      this.aula = { nombre: "", alumnos: [] };
      this.editMode = false;
    },
    showSnackbar(message, color = "success") {
      this.snackbar.text = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
  mounted() {
    this.fetchAulas();
    this.fetchUsers(); // Obtener usuarios al cargar la página
  },
};

</script>
