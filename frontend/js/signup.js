const API_BASE_URL = '/api';

document.addEventListener('DOMContentLoaded', function() {
  const signupForm = document.getElementById('signupForm');
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');

  if (!signupForm) return;

  signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitButton = document.getElementById('signupButton');
    if (submitButton && submitButton.disabled) return;
    
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Signing Up...';
    }
    
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';
    successMessage.style.display = 'none';
    successMessage.textContent = '';

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    let phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (phone) {
      phone = phone.replace(/\s+/g, '').replace(/[-()]/g, '');
    }

    if (password !== confirmPassword) {
      errorMessage.textContent = 'Passwords do not match!';
      errorMessage.style.display = 'block';
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Sign Up';
      }
      return;
    }

    if (password.length < 6) {
      errorMessage.textContent = 'Password must be at least 6 characters long!';
      errorMessage.style.display = 'block';
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Sign Up';
      }
      return;
    }

    try {
      const requestBody = {
        firstName,
        lastName,
        email,
        password
      };

      if (phone) requestBody.phone = phone;

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.data && data.data.token) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('userId', data.data.userId);
          localStorage.setItem('userEmail', data.data.email);
          localStorage.setItem('userName', `${data.data.firstName} ${data.data.lastName}`);
          
          successMessage.textContent = 'Account created successfully! Redirecting...';
          successMessage.style.display = 'block';

          setTimeout(() => window.location.href = 'index.html', 1000);
        } else {
          successMessage.textContent = 'Account created! Redirecting to login...';
          successMessage.style.display = 'block';
          setTimeout(() => window.location.href = 'login.html', 2000);
        }
      } else {
        let errorText = data.message || 'Registration failed. Please try again.';
        
        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          const errorMessages = data.errors.map(err => {
            const field = err.path || err.param || '';
            const msg = err.msg || err.message || 'Invalid value';
            return `${field ? field + ': ' : ''}${msg}`;
          });
          errorText = errorMessages.join(', ');
        }
        
        errorMessage.textContent = errorText;
        errorMessage.style.display = 'block';
      }
    } catch (error) {
      errorMessage.textContent = 'Network error. Please check if the server is running.';
      errorMessage.style.display = 'block';
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Sign Up';
      }
    }
  });
});
