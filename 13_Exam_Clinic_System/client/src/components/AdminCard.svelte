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
