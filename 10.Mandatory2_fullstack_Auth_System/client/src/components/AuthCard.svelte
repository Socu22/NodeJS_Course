<script>
  import { onMount } from 'svelte';
  import { fetchGet, fetchPost } from '../util/fetchUtil.js';
  import toastr from 'toastr';
  import { user, activeForm } from '../store/userStore.js';

  let email = '';
  let password = '';
  let username = '';
  let role = '';
  let errorMessage = '';
  let isLoading = false;

  // CHECK SESSION
  onMount(async () => {
    const res = await fetchGet('/users/me');
    if (res.ok) {
      $user = res.data.data;
      $activeForm = 'user';
    }
  });

  // SINGLE CONTROLLER
  async function handleSubmit() {
    isLoading = true;
    errorMessage = '';

    try {
      // LOGIN FLOW
      if ($activeForm === 'login') {
        const res = await fetchPost('/auth/login', { username, password });
        if (res.ok) {
          $user = res.data.data;
          $activeForm = 'user';
          username = '';
          password = '';
          toastr.success('Login successful!');
        } else {
          toastr.error(res.data.errorMessage || 'Login failed');
        }
      }

      // SIGNUP FLOW
      if ($activeForm === 'signup') {
        const res = await fetchPost('/auth/signup', { username, email, password, role });
        if (res.ok) {
          $activeForm = 'login';
          email = '';
          password = '';
          username = '';
          role = '';
          toastr.success('Signup successful!');
        } else {
          toastr.error(res.data.errorMessage || 'Signup failed');
        }
      }
    } catch (err) {
      toastr.error('An unexpected error occurred');
    } finally {
      isLoading = false;
    }
  }

  // LOGOUT
  async function handleLogout() {
    const res = await fetchPost('/auth/logout');
    if (res.ok) {
      $user = null;
      $activeForm = 'login';
      toastr.success('Logged out successfully');
    } else {
      toastr.error(res.data.errorMessage || 'Logout failed');
    }
  }

  function showSignup() {
    $activeForm = 'signup';
    errorMessage = '';
  }

  function showLogin() {
    $activeForm = 'login';
    errorMessage = '';
  }
</script>

<div class="auth-container">
  {#if $activeForm === 'user'}
    <div class="user-section">
      <p>Welcome, <strong>{$user.username}</strong>!</p>
      <button class="text-button" on:click={handleLogout}>Logout</button>
    </div>
  {:else}
    <div class="form-section">
      <h3>{$activeForm === 'login' ? 'Login' : 'Sign Up'}</h3>

      <form on:submit|preventDefault={handleSubmit}>
        <div class="input-group">
          <label>Username</label>
          <input bind:value={username} placeholder="Enter username" required />
        </div>

        {#if $activeForm === 'signup'}
          <div class="input-group">
            <label>Email</label>
            <input type="email" bind:value={email} placeholder="Enter email" required />
          </div>
          <div class="input-group">
            <label>Role</label>
            <input bind:value={role} placeholder="Enter role" required />
          </div>
        {/if}

        <div class="input-group">
          <label>Password</label>
          <input type="password" bind:value={password} placeholder="Enter password" required />
        </div>

        <button class="submit-button" disabled={isLoading}>
          {isLoading ? 'Loading...' : $activeForm === 'login' ? 'Login' : 'Sign Up'}
        </button>
      </form>

      <p class="switch-text">
        {#if $activeForm === 'login'}
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
    max-width: 360px;
    margin: 3rem auto;
    font-family: 'Inter', system-ui, sans-serif;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    background: #2d2d2d;
    padding: 0;
    color: #e5e5e5;
  }

  .form-section {
    padding: 2rem;
    border-radius: 12px;
    background: #3a3a3a;
  }

  .input-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #e5e5e5;
    font-size: 0.9rem;
  }

  .auth-container .form-section h3 {
    color: #a78bfa;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
  }

  input {
    width: 86%;
    padding: 0.75rem;
    border: 1px solid #555;
    border-radius: 6px;
    font-size: 1rem;
    background: #4a4a4a;
    color: #e5e5e5;
    transition: border-color 0.2s ease;
  }

  input:focus {
    outline: none;
    border-color: #a78bfa;
    box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.3);
  }

  .submit-button {
    width: 100%;
    padding: 0.75rem;
    background: #6b48d2;
    color: #e5e5e5;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .submit-button:hover:not(:disabled) {
    background: #7351d9;
  }

  .submit-button:disabled {
    background: #555;
    color: #aaa;
    cursor: not-allowed;
  }

  .text-button {
    background: none;
    border: none;
    color: #a78bfa;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .text-button:hover {
    color: #937bf3;
    text-decoration: underline;
  }


  .user-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    background: #3a3a3a;
    border-radius: 0 0 12px 12px;
  }

  .switch-text {
    margin-top: 1rem;
    font-size: 0.875rem;
    color: #aaa;
    text-align: center;
  }
</style>