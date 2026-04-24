// stores.js
import { writable } from "svelte/store";


export const user = writable(null);
export const activeFormAuth = writable('login');
export const activeFormUser = writable('login');