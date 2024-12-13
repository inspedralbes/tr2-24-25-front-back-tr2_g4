// stores/userStore.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    loggedIn: false,
  }),
  actions: {
    setUser(userData) {
      this.user = userData;
      this.loggedIn = true;
    },
    clearUser() {
      this.user = null;
      this.loggedIn = false;
    },
  },
  persist: true,  // Habilita la persistencia con el plugin
});
