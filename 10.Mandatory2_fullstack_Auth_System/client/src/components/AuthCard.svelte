<script>
  import { onMount } from 'svelte';
  import { fetchGet, fetchPost } from '../util/fetchUtil.js';

  let email = '';
  let password = '';
  let username = '';
  let user = null;
  let activeForm = 'login'; // login | signup | user
  let errorMessage = '';

  // CHECK SESSION
  onMount(async () => {
    const res = await fetchGet('users/me');

    if (res.ok) {
      user = res.data.data;
      activeForm = 'user';
    }
  });

  // SINGLE CONTROLLER 
  async function handleSubmit() {
    errorMessage = '';

    // LOGIN FLOW
    if (activeForm === 'login') {
      const res = await fetchPost('auth/login', {
        username,
        password
      });

      if (res.ok) {
        user = res.data.data;
        activeForm = 'user';

        username = '';
        password = '';
      } else {
        errorMessage = res.data.errorMessage;
      }

      return;
    }

    // SIGNUP FLOW
    if (activeForm === 'signup') {
      const res = await fetchPost('auth/signup', {
        username,
        email,
        password
      });

      if (res.ok) {
        activeForm = 'login';

        email = '';
        password = '';
        username = '';

        alert('Signup successful!');
      } else {
        errorMessage = res.data.errorMessage;
      }
    }
  }

  // LOGOUT
  async function handleLogout() {
    const res = await fetchPost('auth/logout');

    if (res.ok) {
      user = null;
      activeForm = 'login';
    } else {
      errorMessage = res.data.errorMessage;
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
      <button class="text-button" on:click={handleLogout}>Logout</button>
    </div>

  {:else}
    <div class="form-section">

      <h3>{activeForm === 'login' ? 'Login' : 'Sign Up'}</h3>

      {#if errorMessage}
        <p class="error">{errorMessage}</p>
      {/if}

      <!-- FIXED: no ternary logic anymore -->
      <form on:submit|preventDefault={handleSubmit}>

        <div class="input-group">
          <label>Username</label>
          <input bind:value={username} required />
        </div>

        {#if activeForm === 'signup'}
          <div class="input-group">
            <label>Email</label>
            <input type="email" bind:value={email} required />
          </div>
        {/if}

        <div class="input-group">
          <label>Password</label>
          <input type="password" bind:value={password} required />
        </div>

        <button class="submit-button">
          {activeForm === 'login' ? 'Login' : 'Sign Up'}
        </button>

      </form>

      <p class="switch-text">
        {#if activeForm === 'login'}
          No account?
          <button class="text-button" on:click={showSignup}>Sign up</button>
        {:else}
          Already have an account?
          <button class="text-button" on:click={showLogin}>Login</button>
        {/if}
      </p>

    </div>
  {/if}
</div>

<style>
  .auth-container {
    max-width: 320px;
    margin: 2rem auto;
    font-family: system-ui;
  }

  .form-section {
    padding: 1.5rem;
    border: 1px solid #ddd;
    border-radius: 10px;
  }

  .input-group {
    margin-bottom: 1rem;
  }

  input {
    width: 100%;
    padding: 0.5rem;
  }

  .submit-button {
    width: 100%;
    padding: 0.5rem;
    background: black;
    color: white;
    border: none;
  }

  .text-button {
    background: none;
    border: none;
    color: blue;
    cursor: pointer;
  }

  .error {
    color: red;
  }

  .user-section {
    display: flex;
    justify-content: space-between;
  }
</style>