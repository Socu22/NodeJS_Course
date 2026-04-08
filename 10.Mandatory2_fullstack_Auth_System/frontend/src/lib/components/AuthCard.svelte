<script>
  import { onMount } from 'svelte';

  let email = $state('');
  let password = $state('');
  let username = $state('');
  let user = $state(null);
  let activeForm = $state('login'); // 'login', 'signup', or 'user'
  let errorMessage = $state('');

  // Check if user is already logged in on page load
  onMount(async () => {
    const response = await fetch('http://localhost:8080/auth/me', {
      credentials: 'include'
    });
    if (response.ok) {
      const result = await response.json();
      user = result.data;
      activeForm = 'user';
    }
  });

  async function handleLogin() {
    errorMessage = '';
    const response = await fetch('http://localhost:8080/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });

    const result = await response.json();

    if (response.ok) {
      user = result.data;
      activeForm = 'user';
      errorMessage = '';
    } else {
      errorMessage = result.errorMessage;
    }
  }

  async function handleSignup() {
    errorMessage = '';
    const response = await fetch('http://localhost:8080/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
      credentials: 'include'
    });

    const result = await response.json();

    if (response.ok) {
      activeForm = 'login';
      email = '';
      password = '';
      username = '';
      errorMessage = '';
      alert('Signup successful! Check your email.');
    } else {
      errorMessage = result.errorMessage;
    }
  }

  async function handleLogout() {
    errorMessage = '';
    const response = await fetch('http://localhost:8080/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });

    const result = await response.json();

    if (response.ok) {
      user = null;
      activeForm = 'login';
      errorMessage = '';
    } else {
      errorMessage = result.errorMessage;
    }
  }

  function showSignup() {
    activeForm = 'signup';
    errorMessage = '';
  }

  function showLogin() {
    activeForm = 'login';
    errorMessage = '';
  }
</script>

<div class="auth-container">
  {#if activeForm === 'user'}
    <div class="user-section">
      <p>Welcome, <strong>{user.username}</strong>!</p>
      <button type="button" class="text-button" on:click={handleLogout}>Logout</button>
    </div>
  {:else}
    <div class="form-section">
      {#if activeForm === 'login'}
        <h3>Login</h3>
      {:else}
        <h3>Sign Up</h3>
      {/if}

      {#if errorMessage}
        <p class="error">{errorMessage}</p>
      {/if}

      <form
        on:submit|preventDefault={
          activeForm === 'login' ? handleLogin : handleSignup
        }
      >
        <div class="input-group">
          <label for="username">Username</label>
          <input id="username" type="text" bind:value={username} placeholder="Username" required>
        </div>

        {#if activeForm === 'signup'}
          <div class="input-group">
            <label for="email">Email</label>
            <input id="email" type="email" bind:value={email} placeholder="you@example.com" required>
          </div>
        {/if}

        <div class="input-group">
          <label for="password">Password</label>
          <input id="password" type="password" bind:value={password} placeholder="Password" required>
        </div>

        <button type="submit" class="submit-button">
          {activeForm === 'login' ? 'Login' : 'Sign Up'}
        </button>
      </form>

      {#if activeForm === 'login'}
        <p class="switch-text">
          No account?
          <button type="button" class="text-button" on:click={showSignup}>Sign up</button>
        </p>
      {:else}
        <p class="switch-text">
          Already have an account?
          <button type="button" class="text-button" on:click={showLogin}>Login</button>
        </p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .auth-container {
    max-width: 320px;
    margin: 2rem auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }

  .user-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem;
  }

  .user-section p {
    margin: 0;
    font-size: 0.95rem;
  }

  .form-section {
    background: #fff;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
  }

  h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.1rem;
    font-weight: 500;
    color: #2d3748;
  }

  .input-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.85rem;
    color: #4a5568;
  }

  input {
    display: block;
    width: 100%;
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.25rem;
    background: #fff;
    transition: border-color 0.2s;
  }

  input:focus {
    outline: none;
    border-color: #3182ce;
  }

  .submit-button {
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.5rem;
    background: #3182ce;
    color: white;
    border: none;
    border-radius: 0.25rem;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .submit-button:hover {
    background: #2c5aa0;
  }

  .text-button {
    background: none;
    border: none;
    color: #3182ce;
    cursor: pointer;
    font-size: 0.9rem;
    text-decoration: underline;
    padding: 0;
    margin: 0;
  }

  .switch-text {
    margin-top: 1rem;
    font-size: 0.85rem;
    color: #4a5568;
    text-align: center;
  }

  .error {
    color: #e53e3e;
    font-size: 0.85rem;
    margin-bottom: 1rem;
    text-align: center;
  }
</style>