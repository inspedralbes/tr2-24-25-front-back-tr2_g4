// stores/userStore.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    loggedIn: false,
    participants: JSON.parse(localStorage.getItem('participants')) || [], // Array de participantes
  }),
  actions: {
    setUser(userData) {
      this.user = userData;
      this.loggedIn = true;
      this.addParticipant(userData); // Agregar el usuario a la lista de participantes
    },
    clearUser() {
      this.user = null;
      this.loggedIn = false;
      this.removeParticipant(); // Eliminar el usuario de la lista de participantes
    },
    addParticipant(userData) {
      if (!this.participants.find(user => user.email === userData.email)) {
        this.participants.push(userData); // Añadir el nuevo usuario
        this.updateLocalStorage(); // Actualizar localStorage
      }
    },
    clearAll() {
      // Limpiar el estado por completo
      this.$reset(); // Esto restablece el estado inicial definido en la tienda
      // Limpiar completamente el localStorage
      localStorage.clear(); // Elimina todo lo almacenado en localStorage
    },
    removeParticipant() {
      this.participants = this.participants.filter(user => user.email !== this.user.email);
      this.updateLocalStorage(); // Actualizar localStorage
    },
    updateLocalStorage() {
      localStorage.setItem('participants', JSON.stringify(this.participants));
    },
  },
  persist: true,
});
