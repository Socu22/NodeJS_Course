import { writable } from 'svelte/store';

// Global store variables for activating loading screen
export const isLoading = writable(false);
export const errorMessage = writable('');


// Methods for manipulation of values
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