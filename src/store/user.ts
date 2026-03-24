import { defineStore } from "pinia";

interface User {
  id: string | number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  [key: string]: any;
}

interface UserState {
  user: User | null;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    user: JSON.parse(localStorage.getItem("user") || "null") as User | null
  }),
  
  getters: {
    isAuthenticated: (state): boolean => {
      return !!state.user;
    },
    isAdmin: (state): boolean => {
      return state.user?.role === "admin";
    }
  },
  
  actions: {
    login(user: User): void {
      this.user = user;
      localStorage.setItem("user", JSON.stringify(user));
    },
    logout(): void {
      this.user = null;
      localStorage.removeItem("user");
    }
  }
});