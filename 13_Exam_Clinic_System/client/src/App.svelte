<script>
  import { Router, Link, Route } from 'svelte-routing';

  import AuthCard from './components/AuthCard.svelte';
  import AdminCard from './components/AdminCard.svelte';
  import CoordinatorCard from './components/CoodinatorCard.svelte';
  import NurseCard from './components/NurseCard.svelte';
  import PatientCard from './components/PatientCard.svelte';
  import { user } from './store/userStore.js';
  import WaitingScreen from './components/WaitingScreen.svelte';
  import { isLoading, errorMessage } from './store/loadingStore.js';
  import toastr from 'toastr'
</script>
{#if $isLoading}
  <div class="loading-overlay">
    <div class="loading-spinner"></div>
  </div>
{/if}
<Router>
  <nav>
    <Link to="/waitingscreen">home</Link>

    {#if $user?.role === 'admin'}
      <Link to="/admin">admin</Link>
    {/if}

    {#if $user?.role === 'coordinator'}
      <Link to="/coordinator">coordinator</Link>
    {/if}

    {#if $user?.role === 'nurse'}
      <Link to="/nurse">nurse</Link>
    {/if}

    {#if $user?.role === 'patient'}
      <Link to="/patient">patient</Link>
    {/if}

    <Link to="/auth">auth</Link>
  </nav>

  <div>
    <Route path="/waitingscreen"><WaitingScreen /></Route>
    <Route path="/auth"><AuthCard /></Route>
    <Route path="/admin"><AdminCard /></Route>
    <Route path="/coordinator"><CoordinatorCard /></Route>
    <Route path="/nurse"><NurseCard /></Route>
    <Route path="/patient"><PatientCard /></Route>
    <Route path="/"><AuthCard /></Route>
  </div>
</Router>


<style>
nav {
  align-self: center;
  padding: 1rem;
  background: var(--social-bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  box-shadow: var(--shadow);
  max-width: fit-content;
}

:global(nav a) {
  text-decoration: none;
  color: var(--accent);
  font-family: var(--sans);
  font-weight: 500;
  font-size: 1.1rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

:global(nav a:hover) {
  color: var(--accent-border);
}

:global(nav a:active) {
  color: var(--accent);
}
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

</style>