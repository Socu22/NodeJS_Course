  <script>
    import { onMount } from 'svelte';
    import { fetchGet, fetchPost,fetchPut } from '../util/fetchUtil.js';
    import toastr from 'toastr';
    import socket from '../store/socketStore.js';
    import { user, activeFormAuth } from '../store/userStore.js';
    import { isLoading, showLoading, hideLoading, showError } from '../store/loadingStore.js'; 


    let cpr = '';
    let email = '';
    let username = '';
    let password = '';
    let newPassword = '';
    let token = '';
    let role = 'user';


    // SESSION CHECK
    onMount(async () => {
    
        const res = await fetchGet('/users/me');

        if (res.ok) {
          $user = res.data.data;
          $activeFormAuth = 'user';
        } 
     
});

    // LOGIN
    async function handleLogin() {
      

      try {
        const res = await fetchPost('/auth/login', { username, password });

        if (res.ok) {
          $user = res.data.data;
          $activeFormAuth = 'user';
          username = '';
          password = '';
          socket.connect();
          toastr.success('Login successful!');
        } else {
          toastr.error('Login failed');
          showError(res.data.errorMessage)

        }
      } finally {
        hideLoading();
      }
    }

    // UPDATE USER
    async function handleUpdateUser() {
      

      try {
        const res = await fetchPut("/users/me", {
          username,
          email
        });

        if (res.ok) {
          $user = res.data.data;
          $activeFormAuth = 'user';

          username = email = ''
          toastr.success('Update user successful!');
          handleLogout()
        } else {
          toastr.error('Update user failed');
          showError(res.data.errorMessage)

        }
      } finally {
        hideLoading();
      }
      
    }

    // SIGNUP
    async function handleSignup() {
      

      try {
        const res = await fetchPost('/auth/signup', {
          username,
          email,
          password,
          role,
          cpr
        });

        if (res.ok) {
          $activeFormAuth = 'login';
          cpr = username = email = password = '';
          role = 'user';
          toastr.success('Signup successful!');
        } else {
          toastr.error('Signup failed');
          showError(res.data.errorMessage)

        }
      }
      finally {
        hideLoading();
      }
    }

    // REQUEST RESET EMAIL
    async function handleForgotPassword() {
      

      try {
        const res = await fetchPost('/auth/forgotpassword', { email });

        if (res.ok) {
          $activeFormAuth = 'resetpassword';
          email =''
          toastr.success('Reset email sent!');
        } else {
          toastr.error('Failed to send email');
          showError(res.data.errorMessage)

        }
      } finally {
        hideLoading();
      }
    }

    // RESET PASSWORD (token + new password)
    async function handleResetPassword() {
      

      try {
        const res = await fetchPost('/auth/resetpassword', {
          newPassword,
          token
        });

        if (res.ok) {
          $activeFormAuth = 'login';
          token = newPassword = '';
          toastr.success('Password changed!');
        } else {
          toastr.error('Reset failed');
          showError(res.data.errorMessage)

        }
      } finally {
        hideLoading();
      }
    }

    // LOGOUT
   async function handleLogout() {
  try {
    const res = await fetchPost('/auth/logout');

    if (res.ok) {
      $user = null;
      $activeFormAuth = 'login';
      toastr.success('Logout successful!')
    } else {
      toastr.error('Logout failed');
      showError(err)


    }

  } finally {
    hideLoading();
  }
}

    const showLogin = () => ($activeFormAuth = 'login');
    const showSignup = () => ($activeFormAuth = 'signup');
    const showForgotPassword = () => ($activeFormAuth = 'forgotpassword');

  </script>

  <div class="auth-container">

    {#if $activeFormAuth === 'user'}

      <!-- LOGGED IN VIEW -->
    <div class="form-section">
      <div class="user-section">
        <h4>Welcome, <strong>{$user.username}, {$user.role}</strong>!</h4>
        <button class="text-button" on:click={handleLogout}>
          <h5>Logout</h5>
        </button>      
      </div>
        <h3>Update</h3>
        <form on:submit|preventDefault={handleUpdateUser}>
          <div class="input-group">
            <label>Username</label>
            <input placeholder={$user.username} bind:value={username} required />
          </div>

          <div class="input-group">
            <label>Email</label>
            <input placeholder={$user.email} type="email" bind:value={email} required />
          </div>
          
          <button class="submit-button" disabled={$isLoading}>
            {$isLoading ? 'Loading...' : 'Update'}
          </button>
        </form>

      </div>

    {:else if $activeFormAuth === 'login'}

      <!-- LOGIN -->
      <div class="form-section">
        <h3>Login</h3>

        <form on:submit|preventDefault={handleLogin}>
          <div class="input-group">
            <label>Username</label>
            <input bind:value={username} placeholder="Enter username" required />
          </div>

          <div class="input-group">
            <label>Password</label>
            <input type="password" bind:value={password} placeholder="Enter password" required />
          </div>

          <button class="submit-button" disabled={$isLoading}>
            {$isLoading ? 'Loading...' : 'Login'}
          </button>
        </form>

        <p class="switch-text">
          No account?
          <button class="text-button" on:click={showSignup}>Sign up</button>
        </p>

        <p class="switch-text">
          <button class="text-button" on:click={showForgotPassword}>
            Forgot password?
          </button>
        </p>
      </div>

    {:else if $activeFormAuth === 'signup'}

      <!-- SIGNUP -->
      <div class="form-section">
        <h3>Sign Up</h3>

        <form on:submit|preventDefault={handleSignup}>
          <div class="input-group">
            <label>CPR</label>
            <input bind:value={cpr} maxlength="10" required />
          </div>
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

          <button class="submit-button" disabled={$isLoading}>
            {$isLoading ? 'Loading...' : 'Sign Up'}
          </button>
        </form>

        <p class="switch-text">
          Already have an account?
          <button class="text-button" on:click={showLogin}>Login</button>
        </p>
      </div>

    {:else if $activeFormAuth === 'forgotpassword'}

      <!-- FORGOT PASSWORD -->
      <div class="form-section">
        <h3>Forgot Password</h3>

        <form on:submit|preventDefault={handleForgotPassword}>
          <div class="input-group">
            <label>Email</label>
            <input type="email" bind:value={email} required />
          </div>

          <button class="submit-button" disabled={$isLoading}>
            {$isLoading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <p class="switch-text">
          <button class="text-button" on:click={showLogin}>
            Back to login
          </button>
        </p>
      </div>
    {:else if $activeFormAuth === 'resetpassword'}

      <!-- RESET PASSWORD -->
      <div class="form-section">
        <h3>Reset Password</h3>
        <form on:submit|preventDefault={handleResetPassword}>
          <div class="input-group">
            <input bind:value={token} placeholder="Reset token" required />
            <input type="password" bind:value={newPassword} placeholder="New password" required />
          </div>

          <button class="submit-button" disabled={$isLoading}>
            {$isLoading ? 'Changing password...' : 'Change password'}
          </button>
        </form>

        <p class="switch-text">
          <button class="text-button" on:click={showLogin}>
            Back to login
          </button>
        </p>

        

      </div>
    {/if}
    
  </div>

  