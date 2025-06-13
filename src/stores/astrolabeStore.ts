import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAstrolabeStore = defineStore('astrolabe', () => {
  const astrolabe = ref(null);
  const personName = ref('');

  function setAstrolabe(data, name) {
    astrolabe.value = data;
    personName.value = name;
  }

  function clearAstrolabe() {
    astrolabe.value = null;
    personName.value = '';
  }

  return {
    astrolabe,
    personName,
    setAstrolabe,
    clearAstrolabe,
  };
}); 