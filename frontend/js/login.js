// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Login form submission
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');

  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Hide previous error messages
      errorMessage.style.display = 'none';
      errorMessage.textContent = '';

      // Get form values
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        // Send login request
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            password: password
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Store token in localStorage
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('userId', data.data.userId);
          localStorage.setItem('userEmail', data.data.email);
          localStorage.setItem('userName', `${data.data.firstName} ${data.data.lastName}`);

          // Redirect to home page
          window.location.href = 'index.html';
        } else {
          // Show error message
          errorMessage.textContent = data.message || 'Login failed. Please try again.';
          errorMessage.style.display = 'block';
        }
      } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'Network error. Please check if the server is running.';
        errorMessage.style.display = 'block';
      }
    });
  }
});

