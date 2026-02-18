import { nextTick } from 'vue';
import feather from 'feather-icons';

export function useFeather() {
  const initFeather = async () => {
    // nextTick memastikan DOM sudah dirender oleh Vue
    // sebelum feather mencari elemen data-feather
    await nextTick();
    feather.replace();
  };

  return {
    initFeather
  };
}
