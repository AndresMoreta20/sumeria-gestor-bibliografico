<template>
    <div>
      <h2>Cambiar contraseña</h2>
      <form @submit.prevent="changePassword">
        <input v-model="newPassword" type="password" placeholder="Nueva contraseña" required>
        <button type="submit">Cambiar contraseña</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { getAuth, updatePassword } from "firebase/auth";
  import { doc, updateDoc } from "firebase/firestore";
  import { db } from "@/firebase";
  
  const newPassword = ref('');
  
  const changePassword = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    try {
      await updatePassword(user, newPassword.value);
      await updateDoc(doc(db, "publishers", user.uid), {
        needsPasswordChange: false
      });
      // Redirigir al usuario a la página principal o recargar la aplicación
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
    }
  };
  </script>