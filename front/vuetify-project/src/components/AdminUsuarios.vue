<template>
  <div class="main-container">

    <!-- Administrar Usuarios -->
    <div class="admin-section">
      <div class="form-container">
        <h1 class="custom-title">Administrar Usuarios</h1>

        <h2 class="custom-title2">Editar Usuario</h2>
        <form @submit.prevent="updateUser">
          <input v-model="newUser.nom" type="text" placeholder="Nombre" required />
          <input v-model="newUser.cognom" type="text" placeholder="Apellido" required />
          <input v-model="newUser.email" type="email" placeholder="Correo Electrónico" required />
          <button type="submit" class="custom-title3">Actualizar Usuario</button>
        </form>
      </div>
    </div>

    <!-- Mensaje de Acción (Notificación verde) -->
    <v-alert v-if="showMessage" type="success" dismissible class="alertaeliminar">
    {{ message }}
  </v-alert>



    <!-- Confirmación de Eliminación -->
    <div v-if="showConfirmation" class="confirmation-modal">
      <p>¿Estás seguro de que quieres eliminar este usuario?</p>
      <button @click="confirmDelete" class="btn-confirm">Sí</button>
      <button @click="cancelDelete" class="btn-cancel">No</button>
    </div>

    <!-- Listado de Usuarios -->
    <div class="user-list-section full-width">
      <div class="form-container">
        <div v-if="users.length" class="user-list">
          <h2 style="padding: 2%;" class="custom-title">Lista de Usuarios</h2>

          <!-- Buscador -->
          <v-text-field
            v-model="searchQuery"
            label="Buscar por Correo Electrónico"
            append-icon="mdi-magnify"
            class="search-field"
            outlined
            dense
          ></v-text-field>

          <ul>
            <li v-for="user in filteredUsers" :key="user.id" class="user-item">
              <div class="user-details">
                <span><strong>Nombre:</strong> {{ user.nom }}</span>
                <span><strong>Apellido:</strong> {{ user.cognom }}</span>
                <span><strong>Correo Electrónico:</strong> {{ user.email }}</span>
              </div>
              <div class="actions">
                <button @click="editUser(user)" class="btn-edit">Editar</button>
                <button @click="askDelete(user.id)" class="btn-delete">Eliminar</button>
              </div>
            </li>
          </ul>

          <!-- Alerta si no hay resultados -->
          <div v-if="noResults" class="no-results-message">
            <v-alert type="error" dismissible color="red">No se encontraron coincidencias con ese correo electrónico.</v-alert>
          </div>

        </div>

        <div v-if="editingUser" class="modal">
          <h2>Editar Usuario</h2>
          <form @submit.prevent="updateUser">
            <input v-model="editingUser.nom" type="text" placeholder="Nombre" required />
            <input v-model="editingUser.cognom" type="text" placeholder="Apellido" required />
            <input v-model="editingUser.email" type="email" placeholder="Correo Electrónico" required />
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

<script>
import axios from 'axios';

export default {
  data() {
    return {
      newUser: {
        id: null,
        nom: '',
        cognom: '',
        email: '',
      },
      isEditMode: false,
      users: [],
      errorMessage: '',
      showMessage: false,
      message: '',
      showConfirmation: false,
      userToDelete: null,
      searchQuery: '', // Para el filtrado de usuarios por correo electrónico
    };
  },
  computed: {
    filteredUsers() {
      const filtered = this.users.filter(user => 
        user.email.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      this.noResults = filtered.length === 0; // Establecer el estado de 'noResults'
      return filtered;
    },
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await axios.get('http://localhost:3000/api/users');
        this.users = response.data.users;
      } catch (error) {
        this.errorMessage = 'Error al cargar los usuarios.';
        alert(this.errorMessage);
      }
    },

    editUser(user) {
      this.isEditMode = true;
      this.newUser = { ...user };
    },

    async updateUser() {
      try {
        const response = await axios.put(`http://localhost:3000/api/users/${this.newUser.id}`, this.newUser);
        this.showMessageWithText(response.data.message);
        this.resetForm();
        this.fetchUsers();
      } catch (error) {
        this.errorMessage = error.response.data.message;
        alert(this.errorMessage);
      }
    },

    askDelete(id) {
      this.userToDelete = id;
      this.showConfirmation = true;
    },

    async confirmDelete() {
      if (this.userToDelete) {
        try {
          const response = await axios.delete(`http://localhost:3000/api/users/${this.userToDelete}`);
          this.showMessageWithText(response.data.message); // Muestra el mensaje
          this.fetchUsers();
        } catch (error) {
          this.errorMessage = error.response.data.message;
          alert(this.errorMessage);
        }
      }
      this.cancelDelete();
    },

    cancelDelete() {
      this.showConfirmation = false;
      this.userToDelete = null;
    },

    showMessageWithText(text) {
      this.message = text;
      this.showMessage = true;
      setTimeout(() => {
        this.showMessage = false;
      }, 3000); // El mensaje desaparece después de 3 segundos
    },

    resetForm() {
      this.newUser = { id: null, nom: '', cognom: '', email: '' };
      this.isEditMode = false;
    },
  },
  mounted() {
    this.fetchUsers();
  },
};
</script>


<style scoped>
/* Estilo del buscador */
.search-field {
  margin-bottom: 20px;
  width: 100%;
}

.alertaeliminar {
  position: fixed;
  top: 50%; /* Centra el mensaje verticalmente */
  left: 57%; /* Centra el mensaje horizontalmente */
  transform: translate(-50%, -50%); /* Ajusta para un centrado perfecto */
  z-index: 1000;
  width: 25%;
}

/* Estilo para la alerta de no resultados */
.no-results-message {
  color: #dc3545;
  font-weight: bold;
  text-align: center;
  margin-top: 10px;
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
/* Resto de los estilos anteriores */
.admin-section, .user-list-section {
  margin-bottom: 40px;
}

.custom-title {
  font-family: 'Arial Black', sans-serif;
  font-weight: bold;
  font-size: 24px;
  color: #000000;
  text-align: center;
  text-transform: uppercase;
  margin-bottom: 20px;
  letter-spacing: 1px;
}

.custom-title2 {
  font-family: 'Arial Black', sans-serif;
  font-weight: bold;
  font-size: 20px;
  color: #1c4b7c;
  margin-bottom: 20px;
  letter-spacing: 1px;
}
.confirmation-modal {
  position: fixed;
  top: 50%;
  left: 56%;
  transform: translate(-50%, -50%);
  background-color: #69a1e9;
  color: #333;
  padding: 30px;
  border-radius: 8px;
  z-index: 100;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  text-align: center;
  width: 350px; /* Ajustar el ancho */
}
.custom-title3 {
  font-family: 'Arial Black', sans-serif;
  font-weight: bold;
  font-size: 15px;
  color: #000000;
  background-color: yellow;
}

input {
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

.user-list-section {
  background-color: #73b0e6;
  padding: 20px;
  border-radius: 8px;
}

.user-list ul {
  list-style-type: none;
  padding: 0;
}

.user-item {
  display: flex;
  justify-content: space-between;
  background-color: #ffffff;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.user-details {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  color: black;
}

.actions {
  display: flex;
  gap: 10px;
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

.admin-section {
  background-color: #73b0e6;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
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

.btn-edit {
  background-color: #28a745;
  color: black;
}

.btn-delete {
  background-color: #dc3545;
  color: black;
}

/* Estilo para el mensaje de acción */
.action-message {
  position: fixed;
  top: 40%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  padding: 20px;
  background-color: #28a745;
  color: white;
  font-size: 18px; /* Aumentar tamaño de fuente */
  font-weight: bold; /* Hacer el texto más visible */
  border-radius: 5px;
  z-index: 100;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  text-align: center;
  width: 250px; /* Ajustar el ancho del mensaje */
  margin-left: 100px; /* Desplazar el mensaje un poco hacia la derecha */
}


/* Botones */
.btn-confirm, .btn-cancel {
  padding: 12px 25px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  width: 45%;
  margin: 10px;
  transition: background-color 0.3s ease;
}
.modal-content {
  background-color: rgb(255, 255, 255);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* Texto de la confirmación */
.confirmation-modal p {
  font-size: 18px;
  margin-bottom: 20px;
  font-weight: bold;
  color: #333;
}
/* Botón de Confirmación (Sí) */
.btn-confirm {
  background-color: #28a745; /* Verde */
  color: white;
}
.btn-confirm:hover {
  background-color: #218838; /* Verde oscuro */
}

/* Botón de Cancelación (No) */
.btn-cancel {
  background-color: #dc3545; /* Rojo */
  color: white;
}

.btn-cancel:hover {
  background-color: #c82333; /* Rojo oscuro */
}


</style>
