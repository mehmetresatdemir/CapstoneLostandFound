// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Signup form submission
document.addEventListener('DOMContentLoaded', function() {
  console.log('Signup page loaded');
  const signupForm = document.getElementById('signupForm');
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');

  console.log('Form element:', signupForm);
  console.log('Error message element:', errorMessage);
  console.log('Success message element:', successMessage);

  // Also add click listener to button as backup
  const signupButton = document.getElementById('signupButton') || document.querySelector('.signup-btn');
  if (signupButton) {
    console.log('Signup button found:', signupButton);
    signupButton.addEventListener('click', function(e) {
      console.log('Button clicked!');
      e.preventDefault();
      e.stopPropagation();
      // Manually trigger form submission
      if (signupForm) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        signupForm.dispatchEvent(submitEvent);
      }
    });
  } else {
    console.error('Signup button not found!');
  }

  if (signupForm) {
    console.log('Adding submit event listener');
    signupForm.addEventListener('submit', async function(e) {
      console.log('Form submitted!');
      e.preventDefault();
      
      // Prevent double submission
      const submitButton = document.getElementById('signupButton');
      if (submitButton && submitButton.disabled) {
        console.log('Form already submitting, ignoring...');
        return;
      }
      
      // Disable button to prevent double submission
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Signing Up...';
      }
      
      // Hide previous messages
      errorMessage.style.display = 'none';
      errorMessage.textContent = '';
      successMessage.style.display = 'none';
      successMessage.textContent = '';

      // Get form values
      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const email = document.getElementById('email').value.trim();
      let phone = document.getElementById('phone').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      // Clean phone number - remove spaces, dashes, and parentheses
      if (phone) {
        phone = phone.replace(/\s+/g, '').replace(/[-()]/g, '');
      }

      console.log('Form values:', { firstName, lastName, email, phone, passwordLength: password.length });

      // Client-side validation
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
        // Prepare request body
        const requestBody = {
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: password
        };

        // Add phone if provided
        if (phone) {
          requestBody.phone = phone;
        }

        console.log('Sending request to:', `${API_BASE_URL}/auth/register`);
        console.log('Request body:', requestBody);

        // Send signup request
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        let data;
        try {
          const responseText = await response.text();
          console.log('Response text:', responseText);
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          throw new Error('Invalid response from server');
        }
        
        console.log('Response data:', data);
        if (data.errors) {
          console.log('Errors array:', data.errors);
        }

        if (response.ok && data.success) {
          // Store token and user data
          if (data.data && data.data.token) {
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('userId', data.data.userId);
            localStorage.setItem('userEmail', data.data.email);
            localStorage.setItem('userName', `${data.data.firstName} ${data.data.lastName}`);
            
            // Show success message
            successMessage.textContent = 'Account created successfully! Redirecting to home page...';
            successMessage.style.display = 'block';

            // Redirect to home page after 1 second (user is already logged in)
            setTimeout(() => {
              window.location.href = 'index.html';
            }, 1000);
          } else {
            // If no token, redirect to login
            successMessage.textContent = 'Account created successfully! Redirecting to login...';
            successMessage.style.display = 'block';
            setTimeout(() => {
              window.location.href = 'login.html';
            }, 2000);
          }
        } else {
          // Show error message
          let errorText = data.message || 'Registration failed. Please try again.';
          
          // Handle validation errors
          if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
            const errorMessages = data.errors.map(err => {
              const field = err.path || err.param || '';
              const msg = err.msg || err.message || 'Invalid value';
              return `${field ? field + ': ' : ''}${msg}`;
            });
            errorText = errorMessages.join(', ');
            console.log('Validation errors:', errorMessages);
          }
          
          errorMessage.textContent = errorText;
          errorMessage.style.display = 'block';
        }
      } catch (error) {
        console.error('Signup error:', error);
        errorMessage.textContent = 'Network error. Please check if the server is running. Error: ' + error.message;
        errorMessage.style.display = 'block';
      } finally {
        // Re-enable button
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Sign Up';
        }
      }
    });
  } else {
    console.error('Signup form not found!');
  }
});
