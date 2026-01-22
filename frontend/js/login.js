const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');

  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      errorMessage.style.display = 'none';
      errorMessage.textContent = '';

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('userId', data.data.userId);
          localStorage.setItem('userEmail', data.data.email);
          localStorage.setItem('userName', `${data.data.firstName} ${data.data.lastName}`);
          window.location.href = 'index.html';
        } else {
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

