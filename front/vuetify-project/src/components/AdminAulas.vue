<template>
  <div class="container">
    <h1 class="title">Gestión de Aulas</h1>

    <!-- Formulario para agregar o actualizar un aula -->
    <div class="form-container">
      <form @submit.prevent="saveAula">
        <div class="form-group">
          <label>Nombre del Aula:</label>
          <input type="text" v-model="aula.nombre" required class="form-input" placeholder="Nombre del aula" :class="{ 'input-editing': editMode }"/>
        </div>

        <div class="form-group">
          <label>Alumnos (separados por coma):</label>
          <input type="text" v-model="alumnosInput" placeholder="Ej: Juan, Maria, Ana" class="form-input" :class="{ 'input-editing': editMode }"/>
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
import axios from "axios";

export default {
  data() {
    return {
      aulas: [], // Lista de aulas obtenidas del servidor
      aula: {
        nombre: "",
        alumnos: [],
      },
      alumnosInput: "", // Campo de texto para editar los alumnos
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
    async saveAula() {
      try {
        const alumnosArray = this.alumnosInput.split(",").map((alumno) => alumno.trim());
        this.aula.alumnos = alumnosArray;

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
      this.alumnosInput = aula.alumnos.join(", ");
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
      this.alumnosInput = "";
      this.editMode = false;
    },
  },
  mounted() {
    this.fetchAulas();
  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Arial', sans-serif;
  background: #f4f6f9;
  padding: 20px;
  border-radius: 8px;
}
.title {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  font-size: 2rem;
}
.subtitle {
  margin-top: 20px;
  color: #333;
  font-size: 1.5rem;
}
.form-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.form-group {
  margin-bottom: 15px;
}
.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
  color: #333; /* Asegura que el texto sea visible */
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
  color: #333;
}
.card-body p {
  font-size: 1rem;
  color: #555;
}

/* Agregar estilos para inputs en modo de edición */
.input-editing {
  background-color: #f4f6f9;
  border-color: #007bff;
}
</style>
