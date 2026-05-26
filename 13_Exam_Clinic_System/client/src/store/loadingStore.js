import { writable } from 'svelte/store';

export const isLoading = writable(false);
export const errorMessage = writable('');

export function showLoading() {
  isLoading.set(true);
  errorMessage.set('');
}

export function hideLoading() {
  isLoading.set(false);
}

export function showError(message) {
  errorMessage.set(message);
  setTimeout(() => errorMessage.set(''), 5000);
}