import { readable } from "svelte/store";

export const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://myproductionwebsite.com';
export const BASE_URL_STORE = readable(import.meta.env.VITE_BASE_URL || 'http://myproductionwebsite.com');