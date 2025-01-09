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


    <!-- Listado de Usuarios -->
    <div class="user-list-section full-width">
      <div class="form-container">


        <div v-if="users.length" class="user-list">
          <h2 style=" padding: 2%;" class="custom-title">Lista de Usuarios</h2>
          <ul>
            <li v-for="user in users" :key="user.id" class="user-item">
              <div class="user-details">
                <span><strong>Nombre:</strong> {{ user.nom }}</span>
                <span><strong>Apellido:</strong> {{ user.cognom }}</span>
                <span><strong>Correo Electrónico:</strong> {{ user.email }}</span>
              </div>
              <div class="actions">
                <button @click="editUser(user)" class="btn-edit">Editar</button>
                <button @click="deleteUser(user.id)" class="btn-delete">Eliminar</button>
              </div>
            </li>
          </ul>
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


<style scoped>
.admin-section, .user-list-section {
  margin-bottom: 40px; /* Agregar espacio abajo para separarlos */
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
.admin-section {
  background-color: #73b0e6; /* Fondo azul claro */
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
</style>




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

