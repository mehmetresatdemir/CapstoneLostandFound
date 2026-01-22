const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', function() {
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');
  
  if (token && userName) {
    updateNavigationForLoggedInUser(userName);
  }
});

function updateNavigationForLoggedInUser(userName) {
  const nav = document.querySelector('nav ul');
  if (nav) {
    const loginLink = nav.querySelector('a[href="login.html"]');
    if (loginLink) {
      const loginListItem = loginLink.parentElement;
      const userInfo = document.createElement('span');
      userInfo.textContent = `Welcome, ${userName}`;
      userInfo.style.color = 'white';
      userInfo.style.marginRight = '1rem';
      
      const logoutLink = document.createElement('a');
      logoutLink.href = '#';
      logoutLink.textContent = 'Logout';
      logoutLink.style.cursor = 'pointer';
      logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
      });
      
      loginListItem.innerHTML = '';
      loginListItem.appendChild(userInfo);
      loginListItem.appendChild(logoutLink);
    }
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  window.location.href = 'login.html';
}

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
    
    logout();
    return false;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

