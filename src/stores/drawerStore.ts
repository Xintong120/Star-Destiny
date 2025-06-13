import { ref } from 'vue';

const isDrawerOpen = ref(false);

export function useDrawerStore() {
  const openDrawer = () => {
    isDrawerOpen.value = true;
  };

  const closeDrawer = () => {
    isDrawerOpen.value = false;
  };

  return {
    isDrawerOpen,
    openDrawer,
    closeDrawer,
  };
} 