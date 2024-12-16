<template>
  <div class="user-management">
    <!-- Formulario de edición -->
    <div class="form-container" v-if="isEditMode">
      <h2>Editar Usuario</h2>
      <form @submit.prevent="updateUser">
        <div class="input-group">
          <input v-model="newUser.nom" type="text" placeholder="Nombre" required />
          <input v-model="newUser.cognom" type="text" placeholder="Apellido" required />
          <input v-model="newUser.email" type="email" placeholder="Correo Electrónico" required />
        </div>
        <button class="submit-btn" type="submit">Actualizar</button>
      </form>
    </div>

    <!-- Listado de usuarios -->
    <div class="user-list-container">
      <h2>Usuarios Registrados</h2>
      <ul class="user-list">
        <li v-for="user in users" :key="user.id" class="user-item">
          <div class="user-info">
            <p>{{ user.nom }} {{ user.cognom }} - {{ user.email }}</p>
            <div class="actions">
              <button class="edit-btn" @click="editUser(user)">Editar</button>
              <button class="delete-btn" @click="deleteUser(user.id)">Eliminar</button>
            </div>
          </div>
        </li>
      </ul>
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
      isEditMode: false, // Indicador de si estamos editando un usuario
      users: [],
      errorMessage: ''
    };
  },
  methods: {
    // Función para obtener todos los usuarios registrados
    async fetchUsers() {
      try {
        const response = await axios.get('http://localhost:3000/api/users');
        this.users = response.data.users;
      } catch (error) {
        this.errorMessage = 'Error al cargar los usuarios.';
        alert(this.errorMessage);
      }
    },

    // Función para editar un usuario
    editUser(user) {
      this.isEditMode = true;
      this.newUser = { ...user }; // Cargar los datos del usuario a editar
    },

    // Función para actualizar un usuario
    async updateUser() {
      try {
        const response = await axios.put(`http://localhost:3000/api/users/${this.newUser.id}`, this.newUser);
        alert(response.data.message);
        this.resetForm();
        this.fetchUsers(); // Recargar la lista de usuarios
      } catch (error) {
        this.errorMessage = error.response.data.message;
        alert(this.errorMessage);
      }
    },

    // Función para eliminar un usuario
    async deleteUser(id) {
      try {
        const response = await axios.delete(`http://localhost:3000/api/users/${id}`);
        alert(response.data.message);
        this.fetchUsers(); // Recargar la lista de usuarios
      } catch (error) {
        this.errorMessage = error.response.data.message;
        alert(this.errorMessage);
      }
    },

    // Resetear el formulario
    resetForm() {
      this.newUser = { id: null, nom: '', cognom: '', email: '' };
      this.isEditMode = false;
    }
  },
  mounted() {
    // Cargar la lista de usuarios cuando el componente se monta
    this.fetchUsers();
  }
};
</script>

<style scoped>
.user-management {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  font-size: 1.6rem;
  margin-bottom: 20px;
  color: #333;
}

.form-container,
.user-list-container {
  margin-bottom: 40px;
  color: black;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

input {
  padding: 12px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  color: black; /* Establecer color negro en el texto de los inputs */
}

button {
  padding: 12px;
  font-size: 1.1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn {
  background-color: #4caf50;
  color: white; /* Mantener texto blanco para los botones */
}

.submit-btn:hover {
  background-color: #45a049;
}

.user-list {
  list-style-type: none;
  padding: 0;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  color: black; /* Color negro para el texto de los items de usuario */
  padding: 15px;
  margin: 5px 0;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.actions button {
  margin-left: 10px;
}

.edit-btn {
  background-color: #2196f3;
  color: white;
}

.edit-btn:hover {
  background-color: #1976d2;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.delete-btn:hover {
  background-color: #e53935;
}
</style>
