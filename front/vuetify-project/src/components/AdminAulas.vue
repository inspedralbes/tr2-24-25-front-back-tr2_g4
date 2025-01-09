<template>
  <div class="main-container">


    <!-- Administrar Aulas -->
    <div class="admin-section">
      <div class="form-container">
        <h1 class="custom-title">Gestión de Aulas</h1>


        <!-- Formulario para agregar o actualizar un aula -->
        <form @submit.prevent="saveAula">
          <div class="form-group">
            <input
              type="text"
              v-model="aula.nombre"
              placeholder="Nombre del aula"
              required
              class="form-input"
              :class="{ 'input-editing': editMode }"
            />
          </div>


          <div class="form-group">
            <label>Alumnos:</label>
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
          </div>


          <div class="button-group">
            <button type="submit" class="custom-title3">{{ editMode ? 'Actualizar Aula' : 'Crear Aula' }}</button>
            <button type="button" v-if="editMode" @click="cancelEdit" class="btn-cancel">Cancelar</button>
          </div>
        </form>
      </div>
    </div>


    <!-- Lista de Aulas -->
    <div class="questions-section full-width">
      <div class="form-container">


        <div v-if="aulas.length" class="questions-list">
          <h2 class="custom-title">Listado de Aulas</h2>
          <ul>
            <li v-for="aula in aulas" :key="aula.nombre" class="question-item">
              <div class="question-details">
                <span><strong>Nombre del Aula:</strong> {{ aula.nombre }}</span>
                <span><strong>Alumnos:</strong> {{ aula.alumnos.join(', ') }}</span>
              </div>
              <div class="actions">
                <button @click="editAula(aula)" class="btn-edit">Editar</button>
                <button @click="deleteAula(aula.nombre)" class="btn-delete">Eliminar</button>
              </div>
            </li>
          </ul>
        </div>


        <div v-if="editingAula" class="modal">
          <h2>Editar Aula</h2>
          <form @submit.prevent="updateAula">
            <input
              v-model="editingAula.nombre"
              type="text"
              placeholder="Nombre del aula"
              required
              class="form-input"
              :class="{ 'input-editing': editMode }"
            />
            <label>Alumnos:</label>
            <div class="checkbox-group">
              <div v-for="user in users" :key="user.id" class="checkbox-item">
                <input
                  type="checkbox"
                  :value="user.nom + ' ' + user.cognom"
                  v-model="editingAula.alumnos"
                  :id="'edit-user-' + user.id"
                />
                <label :for="'edit-user-' + user.id">{{ user.nom }} {{ user.cognom }}</label>
              </div>
            </div>
            <div class="modal-actions">
              <button type="submit" class="btn-submit">Actualizar</button>
              <button @click="cancelEdit" class="btn-cancel">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>


.main-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}


.admin-section {
  background-color: #73b0e6;
  padding: 20px;
  border-radius: 8px;
}


.custom-title {
  font-family: 'Arial Black', sans-serif;
  font-weight: bold;
  font-size: 24px;
  color: #000;
  text-align: center;
  text-transform: uppercase;
  margin-bottom: 20px;
  letter-spacing: 1px;
}


.custom-title3 {
  font-family: 'Arial Black', sans-serif;
  font-weight: bold;
  font-size: 15px;
  color: #000;
  background-color: yellow;
  margin-bottom: 20px;
  letter-spacing: 1px;
}


.questions-section {
  background-color: #73b0e6;
  padding: 20px;
  border-radius: 8px;
}


.questions-list ul {
  list-style-type: none;
  padding: 0;
}


.question-item {
  display: flex;
  justify-content: space-between;
  background-color: #ffffff;
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


.btn-submit, .btn-cancel {
  width: 48%;
}


form input, .form-group label {
  color: black;
}


.form-input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
}


form input:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}


.btn-edit {
  background-color: #28a745;
  color: black;
}


.btn-delete {
  background-color: #dc3545;
  color: black;
}


.btn-submit {
  background-color: #007bff;
  color: white;
}


.btn-cancel {
  background-color: #ccc;
  color: black;
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
    };
  },
  methods: {
    async fetchAulas() {
      try {
        const response = await axios.get("http://localhost:3000/api/aulas");
        this.aulas = response.data.aulas;
      } catch (error) {
        console.error("Error al obtener las aulas:", error);
      }
    },
    async fetchUsers() {
      try {
        const response = await axios.get("http://localhost:3000/api/users");
        this.users = response.data.users;
      } catch (error) {
        console.error("Error al obtener los usuarios:", error);
      }
    },
    async saveAula() {
      try {
        if (this.editMode) {
          // Actualizar un aula existente
          await axios.put(`http://localhost:3000/api/aulas/${this.aula.nombre}`, {
            alumnos: this.aula.alumnos,
          });
          alert("Aula actualizada correctamente.");
        } else {
          // Crear una nueva aula
          await axios.post("http://localhost:3000/api/aulas", this.aula);
          alert("Aula creada correctamente.");
        }

        this.resetForm();
        this.fetchAulas();
      } catch (error) {
        console.error("Error al guardar el aula:", error);
        alert("Hubo un error al guardar el aula.");
      }
    },
    editAula(aula) {
      this.aula = { ...aula };
      this.editMode = true;
    },
    async deleteAula(nombre) {
      try {
        if (confirm(`¿Seguro que deseas eliminar el aula "${nombre}"?`)) {
          await axios.delete(`http://localhost:3000/api/aulas/${nombre}`);
          alert("Aula eliminada correctamente.");
          this.fetchAulas();
        }
      } catch (error) {
        console.error("Error al eliminar el aula:", error);
        alert("Hubo un error al eliminar el aula.");
      }
    },
    cancelEdit() {
      this.resetForm();
    },
    resetForm() {
      this.aula = { nombre: "", alumnos: [] };
      this.editMode = false;
    },
  },
  mounted() {
    this.fetchAulas();
    this.fetchUsers(); // Obtener usuarios al cargar la página
  },
};
</script>

