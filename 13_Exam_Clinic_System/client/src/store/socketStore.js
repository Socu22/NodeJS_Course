import { writable } from 'svelte/store';
import { io } from 'socket.io-client';
import { BASE_URL } from './urlStore.js';

// Remove trailing slash and add port if needed
const socketUrl = BASE_URL.replace(/\/$/, '').replace(/^http/, 'ws');
const socket = io(socketUrl, {
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

export default socket;