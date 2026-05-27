import { writable } from 'svelte/store';
import { io } from 'socket.io-client';
import { BASE_URL } from './urlStore.js';

// Singleton socket used everywhere in client, so as to not have issues with their conncections
const socketUrl = BASE_URL.replace(/\/$/, '').replace(/^http/, 'ws');
const socket = io(socketUrl, {
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

export default socket;