<template>
  <div class="container">
    <h1 class="title">Gestión de Aulas</h1>

    <!-- Formulario para agregar o actualizar un aula -->
    <div class="form-container">
      <form @submit.prevent="saveAula">
        <div class="form-group">
          <label>Nombre del Aula:</label>
          <input
            type="text"
            v-model="aula.nombre"
            required
            class="form-input"
            placeholder="Nombre del aula"
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
          <button type="submit" class="btn btn-primary">{{ editMode ? 'Actualizar Aula' : 'Crear Aula' }}</button>
          <button type="button" v-if="editMode" @click="cancelEdit" class="btn btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>

    <hr />

    <!-- Lista de aulas -->
    <h2 class="subtitle">Listado de Aulas</h2>
    <div class="card-container">
      <div class="card" v-for="(aula, index) in aulas" :key="index">
        <div class="card-header">
          <strong>{{ aula.nombre }}</strong>
        </div>
        <div class="card-body">
          <p>Alumnos: {{ aula.alumnos.join(', ') }}</p>
          <div class="button-group">
            <button @click="editAula(aula)" class="btn btn-warning">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button @click="deleteAula(aula.nombre)" class="btn btn-danger">
              <i class="fas fa-trash"></i> Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const API_URL = import.meta.env.VITE_API_BACK; 

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
        const response = await fetch(`${API_URL}./api/aulas`);
        if (!response.ok) {
          throw new Error("Error al obtener las aulas");
        }
        const data = await response.json();
        this.aulas = data.aulas;
      } catch (error) {
        console.error("Error al obtener las aulas:", error);
      }
    },
    async fetchUsers() {
      try {
        const response = await fetch(`${API_URL}./api/users`);
        if (!response.ok) {
          throw new Error("Error al obtener los usuarios");
        }
        const data = await response.json();
        this.users = data.users;
      } catch (error) {
        console.error("Error al obtener los usuarios:", error);
      }
    },
    async saveAula() {
      try {
        const method = this.editMode ? "PUT" : "POST";
        const url = this.editMode 
          ? `${API_URL}./api/aulas/${this.aula.nombre}` 
          : `${API_URL}./api/aulas`;

        const response = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.aula),
        });

        if (!response.ok) {
          throw new Error("Hubo un error al guardar el aula");
        }

        alert(this.editMode ? "Aula actualizada correctamente." : "Aula creada correctamente.");
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
          const response = await fetch(`${API_URL}./api/aulas/${nombre}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Hubo un error al eliminar el aula");
          }

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

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  font-family: "Arial", sans-serif;
  background: #f4f6f9;
  padding: 20px;
  border-radius: 8px;
  color: #000; /* Asegurar que el texto por defecto sea negro */
}
.title {
  text-align: center;
  margin-bottom: 20px;
  color: #000; /* Cambiar el color a negro */
  font-size: 2rem;
}
.subtitle {
  margin-top: 20px;
  color: #000; /* Cambiar el color a negro */
  font-size: 1.5rem;
}
.form-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  color: #000; /* Asegurar texto negro en el formulario */
}
.form-group {
  margin-bottom: 15px;
}
.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.checkbox-item {
  display: flex;
  align-items: center;
  gap: 5px;
}
.checkbox-item label {
  color: #000; /* Asegurar texto negro para etiquetas de checkbox */
}
.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
  color: #000; /* Cambiar el color del texto del input a negro */
}
.form-input:focus {
  border-color: #007bff;
  outline: none;
}
.button-group {
  display: flex;
  gap: 10px;
  justify-content: flex-start;
}
.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
}
.btn-primary {
  background-color: #007bff;
}
.btn-secondary {
  background-color: #6c757d;
}
.btn-warning {
  background-color: #ffc107;
}
.btn-danger {
  background-color: #dc3545;
}
.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}
.card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}
.card:hover {
  transform: translateY(-5px);
}
.card-header {
  background-color: #007bff;
  color: white;
  padding: 10px;
  font-size: 18px;
  text-align: center;
}
.card-body {
  padding: 15px;
  color: #000; /* Cambiar texto del cuerpo de la tarjeta a negro */
}
.card-body p {
  font-size: 1rem;
  color: #000; /* Cambiar el texto de los párrafos a negro */
}
</style>
