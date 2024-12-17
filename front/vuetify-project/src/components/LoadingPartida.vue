<template>
  <div id="app">
    <h1>Gestión de Usuarios</h1>

    <!-- Listar usuarios -->
    <section>
      <h2>Lista de Usuarios</h2>
      <button @click="fetchUsers">Cargar Usuarios</button>
      <ul v-if="users.length">
        <li v-for="user in users" :key="user.id">
          {{ user.nom }} {{ user.cognom }} - {{ user.email }}
          <button @click="editUser(user)">Editar</button>
          <button @click="deleteUser(user.id)">Eliminar</button>
        </li>
      </ul>
      <p v-else>No hay usuarios disponibles.</p>
    </section>

    <!-- Crear o editar usuario -->
    <section>
      <h2>{{ isEditing ? 'Editar Usuario' : 'Crear Usuario' }}</h2>
      <form @submit.prevent="isEditing ? updateUser() : createUser()">
        <input v-model="form.nom" placeholder="Nombre" required />
        <input v-model="form.cognom" placeholder="Apellido" required />
        <input v-model="form.email" type="email" placeholder="Email" required />
        <input v-model="form.password" type="password" placeholder="Contraseña" required />
        <label>
          Profesor:
          <input v-model="form.profesor" type="checkbox" />
        </label>
        <button type="submit">{{ isEditing ? 'Actualizar' : 'Crear' }}</button>
        <button type="button" v-if="isEditing" @click="cancelEdit">Cancelar</button>
      </form>
    </section>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      users: [],
      form: {
        id: null,
        nom: '',
        cognom: '',
        email: '',
        password: '',
        profesor: false,
      },
      isEditing: false,
    };
  },
  methods: {
    // Obtener todos los usuarios
    async fetchUsers() {
      try {
        const response = await axios.get('/api/users');
        if (response.data.success) {
          this.users = response.data.users;
        } else {
          alert('Error al cargar usuarios.');
        }
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
      }
    },
    // Crear un nuevo usuario
    async createUser() {
      try {
        const response = await axios.post('/api/users', this.form);
        if (response.data.success) {
          alert(response.data.message);
          this.fetchUsers();
          this.resetForm();
        } else {
          alert('Error al crear usuario.');
        }
      } catch (error) {
        console.error('Error al crear usuario:', error);
      }
    },
    // Editar un usuario
    editUser(user) {
      this.isEditing = true;
      this.form = { ...user };
    },
    // Actualizar un usuario existente
    async updateUser() {
      try {
        const response = await axios.put(`/api/users/${this.form.id}`, this.form);
        if (response.data.success) {
          alert(response.data.message);
          this.fetchUsers();
          this.resetForm();
        } else {
          alert('Error al actualizar usuario.');
        }
      } catch (error) {
        console.error('Error al actualizar usuario:', error);
      }
    },
    // Eliminar un usuario
    async deleteUser(id) {
      if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
      try {
        const response = await axios.delete(`/api/users/${id}`);
        if (response.data.success) {
          alert(response.data.message);
          this.fetchUsers();
        } else {
          alert('Error al eliminar usuario.');
        }
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      }
    },
    // Cancelar edición
    cancelEdit() {
      this.resetForm();
    },
    // Resetear formulario
    resetForm() {
      this.form = {
        id: null,
        nom: '',
        cognom: '',
        email: '',
        password: '',
        profesor: false,
      };
      this.isEditing = false;
    },
  },
  mounted() {
    this.fetchUsers();
  },
};
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  margin: 20px;
}
form {
  margin-top: 20px;
}
form input {
  display: block;
  margin: 5px 0;
}
form button {
  margin-right: 10px;
}
</style>
