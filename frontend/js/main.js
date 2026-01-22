const API_BASE_URL = '/api';

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
      
      // Create dropdown container
      const dropdownContainer = document.createElement('div');
      dropdownContainer.className = 'profile-dropdown-container';
      
      // Create profile button
      const profileButton = document.createElement('a');
      profileButton.href = '#';
      profileButton.className = 'profile-button';
      profileButton.textContent = 'Profile';
      profileButton.style.cursor = 'pointer';
      profileButton.style.color = 'white';
      profileButton.style.marginRight = '1rem';
      profileButton.addEventListener('click', function(e) {
        e.preventDefault();
        const dropdown = dropdownContainer.querySelector('.profile-dropdown');
        dropdown.classList.toggle('show');
      });
      
      // Create dropdown menu
      const dropdown = document.createElement('div');
      dropdown.className = 'profile-dropdown';
      
      const profileLink = document.createElement('a');
      profileLink.href = 'profile.html';
      profileLink.textContent = 'Profile';
      profileLink.addEventListener('click', function(e) {
        dropdown.classList.remove('show');
      });
      
      const logoutLink = document.createElement('a');
      logoutLink.href = '#';
      logoutLink.textContent = 'Logout';
      logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        dropdown.classList.remove('show');
        logout();
      });
      
      dropdown.appendChild(profileLink);
      dropdown.appendChild(logoutLink);
      
      dropdownContainer.appendChild(profileButton);
      dropdownContainer.appendChild(dropdown);
      
      loginListItem.innerHTML = '';
      loginListItem.appendChild(dropdownContainer);
      
      // Close dropdown when clicking outside
      document.addEventListener('click', function(e) {
        if (!dropdownContainer.contains(e.target)) {
          dropdown.classList.remove('show');
        }
      });
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

