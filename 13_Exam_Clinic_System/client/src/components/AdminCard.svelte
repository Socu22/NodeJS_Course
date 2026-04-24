<script>
  import { onMount } from 'svelte';
  import { fetchGet, fetchPost } from '../util/fetchUtil.js';
  import toastr from 'toastr';
  import { user, activeFormUser } from '../store/userStore.js';

  let email = '';
  let username = '';
  let password = '';
  let role = '';

  let isLoading = false;

  // SESSION CHECK
  onMount(async () => {
    $activeFormUser = 'signup'
    
  });



  // AUTH SIGNUP
  async function handleAuthSignup() {
    isLoading = true;

    try {
      const res = await fetchPost('/users', {
        username,
        email,
        password,
        role
      });

      if (res.ok) {
        $activeFormUser = 'login';
        username = email = password = role = '';
        toastr.success('Auth Signup successful!');
      } else {
        toastr.error(res.data.errorMessage || 'Auth Signup failed');
      }
    } finally {
      isLoading = false;
    }
  }

  




</script>

<div class="auth-container">


{#if $activeFormUser === 'signup' && user && $user?.role === 'admin'}
    <!-- ADMIN SIGNUP -->
    <div class="form-section">
      <h3>Admin Sign Up</h3>

      <form on:submit|preventDefault={handleAuthSignup}>
        <div class="input-group">
          <label>Username</label>
          <input bind:value={username} required />
        </div>

        <div class="input-group">
          <label>Email</label>
          <input type="email" bind:value={email} required />
        </div>

        <div class="input-group">
          <label>Password</label>
          <input type="password" bind:value={password} required />
        </div>

        <div class="input-group">
          <label>Role</label>
          <select bind:value={role} required>
            <option value="patient" selected>Patient</option>
            <option value="coordinator" >Coordinator</option>
            <option value="nurse" >Nurse</option>
            <option value="admin" >Admin</option>
          </select>
        </div>

        <button class="submit-button" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Admin Sign Up'}
        </button>
      </form>


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
    color: #e5e5e5;
  }

  .form-section {
    padding: 2rem;
    background: #3a3a3a;
    border-radius: 12px;
  }

  h3 {
    color: #a78bfa;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
  }

  .input-group {
    margin-bottom: 1.2rem;
  }

  label {
    display: block;
    margin-bottom: 0.4rem;
    font-size: 0.9rem;
  }

  input, select {
    width: 82%;
    padding: 0.7rem;
    border-radius: 6px;
    border: 1px solid #555;
    background: #4a4a4a;
    color: #fff;
  }

  input:focus, select:focus {
    border-color: #a78bfa;
    outline: none;
  }

  .submit-button {
    width: 100%;
    padding: 0.75rem;
    background: #6b48d2;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .submit-button:disabled {
    background: #555;
    cursor: not-allowed;
  }


 
</style>