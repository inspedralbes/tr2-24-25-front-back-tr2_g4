<template>
  <v-container>
    <!-- Tarjeta principal con fondo #229de8 -->
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="pa-4 rounded-card" style="background-color: #229de8;">
          <!-- Título principal de la tarjeta -->
          <v-card-title class="text-center" style="color: white; font-weight: bold; margin-top: 20px; margin-bottom: 20px;font-weight: bold;   font-size: 28px;">
            Usuarios
          </v-card-title>
          <!-- Formulario de edición dentro de la tarjeta principal -->
          <v-card class="pa-4 rounded-card" style="background-color: white; box-shadow: none;">
            <v-card-subtitle style="color: black; margin-bottom: 16px; font-weight: bold">EDITAR USUARIO</v-card-subtitle>           
            <v-form @submit.prevent="updateUser">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="newUser.nom"
                    label="Nombre"
                    outlined
                    dense
                    required
                    style="color: #1E1E1E;"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="newUser.cognom"
                    label="Apellido"
                    outlined
                    dense
                    required
                    style="color: #1E1E1E;"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="newUser.email"
                    label="Correo Electrónico"
                    type="email"
                    outlined
                    dense
                    required
                    style="color: #1E1E1E;"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" class="text-right">
                  <v-btn type="submit" color="#4CAF50" class="rounded-btn" style="color: white;">Actualizar</v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card>

          <!-- Listado de usuarios dentro de la tarjeta principal -->
          <v-card class="pa-4 rounded-card mt-4" style="background-color: white; box-shadow: none;">
            <v-card-subtitle style="color: black; margin-bottom: 16px; font-weight: bold">USUARIOS REGISTRADOS</v-card-subtitle>            
            <v-divider class="my-4" style="background-color: #D1D1D1;"></v-divider>
            
            <v-row v-if="users.length">
            <v-col cols="12" md="4" v-for="user in users" :key="user.id"> <!-- Modificar el tamaño de la columna de 6 a 4 para mayor espacio -->
              <v-card class="mb-4 rounded-card" style="background-color: #229de8; padding: 20px;"> <!-- Aumenta el relleno dentro de la tarjeta -->
                <v-card-subtitle style="color: #1E1E1E; font-size: 18px;">
                  <div><strong>Nombre:</strong> {{ user.nom }} {{ user.cognom }}</div>
                  <div><strong>Email:</strong> {{ user.email }}</div>
                </v-card-subtitle>
                <v-card-actions>
                  <v-btn color="#2196F3" class="rounded-btn" style="color: black; background-color: yellow;" @click="editUser(user)">Editar</v-btn>
                  <v-btn color="#F44336" class="rounded-btn" style="color: white; background-color: red;" @click="deleteUser(user.id)">Eliminar</v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>

            <v-alert v-else type="info" class="mt-4" style="color: #1E1E1E;">No se encontraron usuarios.</v-alert>
          </v-card>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
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
.rounded-card {
  border-radius: 16px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.rounded-btn {
  border-radius: 16px;
}

.text-primary {
  color: #2196F3;
}

.v-card {
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

/* Estilos para los botones */
.v-btn {
  border-radius: 16px;
}

.v-btn:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Colores consistentes */
.v-divider {
  background-color: black;
}
</style>
