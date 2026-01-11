// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
  console.log('Main page loaded');
  
  // Check authentication status
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');
  const userEmail = localStorage.getItem('userEmail');
  
  if (token) {
    console.log('User is logged in:', userName);
    // Update navigation to show user info or logout option
    updateNavigationForLoggedInUser(userName);
  } else {
    console.log('User is not logged in');
    // Keep default navigation
  }
});

// Update navigation for logged in users
function updateNavigationForLoggedInUser(userName) {
  const nav = document.querySelector('nav ul');
  if (nav) {
    // Check if login link exists
    const loginLink = nav.querySelector('a[href="login.html"]');
    if (loginLink && userName) {
      // Replace login link with user info and logout
      const loginListItem = loginLink.parentElement;
      
      // Create user info span
      const userInfo = document.createElement('span');
      userInfo.textContent = `Welcome, ${userName}`;
      userInfo.style.color = 'white';
      userInfo.style.marginRight = '1rem';
      
      // Create logout link
      const logoutLink = document.createElement('a');
      logoutLink.href = '#';
      logoutLink.textContent = 'Logout';
      logoutLink.style.cursor = 'pointer';
      logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
      });
      
      // Replace login link
      loginListItem.innerHTML = '';
      loginListItem.appendChild(userInfo);
      loginListItem.appendChild(logoutLink);
    }
  }
}

// Logout function
function logout() {
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  
  // Redirect to login page
  window.location.href = 'login.html';
}

// Verify token with backend (optional - can be called periodically)
async function verifyToken() {
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        return true;
      }
    }
    
    // Token invalid, logout
    logout();
    return false;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

