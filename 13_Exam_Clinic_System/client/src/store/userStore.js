// stores.js
import { writable } from "svelte/store";

// global stores for user related stuff
export const user = writable(null); // global user logged in
export const activeFormAuth = writable('login'); // user site
export const activeFormUser = writable('login'); // role site