  <script>
    import { onMount } from 'svelte';
    import { fetchGet, fetchPost,fetchPut } from '../util/fetchUtil.js';
    import toastr from 'toastr';
    import { user, activeFormAuth } from '../store/userStore.js';

    let email = '';
    let username = '';
    let password = '';
    let newPassword = '';
    let token = '';
    let role = 'user';

    let isLoading = false;

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
      isLoading = true;

      try {
        const res = await fetchPost('/auth/login', { username, password });

        if (res.ok) {
          $user = res.data.data;
          $activeFormAuth = 'user';
          username = '';
          password = '';
          toastr.success('Login successful!');
        } else {
          toastr.error(res.data.errorMessage || 'Login failed');
        }
      } finally {
        isLoading = false;
      }
    }

    // UPDATE USER
    async function handleUpdateUser() {
      isLoading = true;

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
          toastr.error(res.data.errorMessage || 'Update user failed');
        }
      }catch(error){
        console.log(error);
        
      } finally {
        isLoading = false;
      }
      
    }

    // SIGNUP
    async function handleSignup() {
      isLoading = true;

      try {
        const res = await fetchPost('/auth/signup', {
          username,
          email,
          password,
          role
        });

        if (res.ok) {
          $activeFormAuth = 'login';
          username = email = password = '';
          role = 'user';
          toastr.success('Signup successful!');
        } else {
          toastr.error(res.data.errorMessage || 'Signup failed');
        }
      }catch(error){
        console.log(error);
        
      } finally {
        isLoading = false;
      }
    }

    // REQUEST RESET EMAIL
    async function handleForgotPassword() {
      isLoading = true;

      try {
        const res = await fetchPost('/auth/forgotpassword', { email });

        if (res.ok) {
          $activeFormAuth = 'resetpassword';
          email =''
          toastr.success('Reset email sent!');
        } else {
          toastr.error(res.data.errorMessage || 'Failed to send email');
        }
      } finally {
        isLoading = false;
      }
    }

    // RESET PASSWORD (token + new password)
    async function handleResetPassword() {
      isLoading = true;

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
          toastr.error(res.data.errorMessage || 'Reset failed');
        }
      } finally {
        isLoading = false;
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
    }

  } catch (err) {
    console.log(err);
    toastr.error('Network error during logout');
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
          
          <button class="submit-button" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Update'}
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

          <button class="submit-button" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Login'}
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

          <button class="submit-button" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Sign Up'}
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

          <button class="submit-button" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send reset link'}
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

          <button class="submit-button" disabled={isLoading}>
            {isLoading ? 'Changing password...' : 'Change password'}
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

  <style>
    .auth-container {
      max-width: 360px;
      margin: 3rem auto;
      font-family: 'Inter', system-ui, sans-serif;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      border-radius: 12px;
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
    h4{
      color: #a78bfa;
      margin-bottom: 1.5rem;
      font-size: 0.8rem;
    }
    .user-section h4 {
      overflow: auto;
    }
      h5{
      color: #a78bfa;
      margin-bottom: 1.5rem;
      font-size: 0.8rem;
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


    .text-button {
      background: none;
      border: none;
      color: #a78bfa;
      cursor: pointer;
    }



    .switch-text {
      margin-top: 1rem;
      text-align: center;
      font-size: 0.85rem;
      color: #aaa;
    }

    .user-section {
      display: flex;
      justify-content: space-between;
      background-color: #3a3a3a;
      border-radius: 12px;

    }
    .user-section p {
      font-size: inherit/2;
    }
  </style>