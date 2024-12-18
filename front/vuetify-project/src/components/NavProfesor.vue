<template>
  <div class="layout">
    <nav>
      <ul>
        <li @click="loadComponent('AdminPreguntas')">Preguntas</li>
        <li @click="loadComponent('AdminUsuarios')">Usuarios</li>
        <li @click="loadComponent('AdminAulas')">Aulas</li>
        <li @click="loadComponent('Estadisticas')">Estadísticas</li>
      </ul>
    </nav>

    <main class="content">
      <component :is="currentComponent" />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AdminPreguntas from "@/components/AdminPreguntas.vue";
import AdminUsuarios from "@/components/AdminUsuarios.vue";
import AdminAulas from "@/components/AdminAulas.vue";
import Estadisticas from "@/components/Estadisticas.vue";

// Define el componente inicial que se va a cargar
const currentComponent = ref(AdminPreguntas);  // Componente predeterminado

// Función que cambia el componente según el nombre que se pase
const loadComponent = (componentName) => {
  switch(componentName) {
    case 'AdminPreguntas':
      currentComponent.value = AdminPreguntas;
      break;
    case 'AdminUsuarios':
      currentComponent.value = AdminUsuarios;
      break;
    case 'AdminAulas':
      currentComponent.value = AdminAulas;
      break;
    case 'Estadisticas':
      currentComponent.value = Estadisticas;
      break;
    default:
      currentComponent.value = AdminPreguntas;
  }
};
</script>

<style>
.layout {
  display: flex;
  height: 100vh;
}

nav {
  width: 200px;
  color: white;
  padding: 1rem;
}

nav ul {
  list-style: none;
  padding: 0;
}

nav li {
  margin-bottom: 1rem;
  cursor: pointer;
}

nav li:hover {
  text-decoration: underline;
}

.content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}
</style>