<script>
  import { Router, Link, Route } from 'svelte-routing';

  import AuthCard from './components/AuthCard.svelte';
  import AdminCard from './components/AdminCard.svelte';
  import CoordinatorCard from './components/CoodinatorCard.svelte';
  import NurseCard from './components/NurseCard.svelte';
  import PatientCard from './components/PatientCard.svelte';

  import { user } from './store/userStore.js';
</script>

<Router>
  <nav>
    <Link to="/">home</Link>

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

</style>