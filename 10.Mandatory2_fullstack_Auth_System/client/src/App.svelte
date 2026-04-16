<script>
  import { Router, Link, Route } from 'svelte-routing';
  import AuthCard from './components/AuthCard.svelte';
</script>

<Router>
  <nav>
    <Link to="/">Change</Link>
    <Link to="/">Change</Link>
    <Link to="/">Change</Link>
    <Link to="/">Login</Link>

  </nav>
  <div>
    <Route path="/"><AuthCard /></Route>
  </div>
</Router>

<style>
  /* Nav styling */
  nav {
    align-self: center;
    padding: 1rem;
    background: #3a3a3a;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    max-width: fit-content;
  }

  /* Link styling using :global() */
  :global(nav a) {
    text-decoration: none;
    color: #937bf3;
    font-family: 'Inter', system-ui, sans-serif;
    font-weight: 500;
    font-size: 1.1rem;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: all 0.2s ease;
  }


  :global(nav a:hover) {
    color: #b6a1f2; 
  }

  /* Active state */
  :global(nav a:active) {
    color: #c7b6f6;
  }
</style>


