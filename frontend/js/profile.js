document.addEventListener('DOMContentLoaded', async function() {
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');

  if (!token) {
    alert('Please login to view your profile.');
    window.location.href = 'login.html';
    return;
  }

  if (userName) {
    updateNavigationForLoggedInUser(userName);
  }
  await loadProfile();
  initializeProfileForm();
  initializeChangePassword();
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
  localStorage.removeItem('userPhone');
  localStorage.removeItem('userFirstName');
  localStorage.removeItem('userLastName');
  window.location.href = 'login.html';
}

async function loadProfile() {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Profile data:', data); // Debug log
    if (response.ok && data.success) {
      const firstNameInput = document.getElementById('firstName');
      const lastNameInput = document.getElementById('lastName');
      const emailInput = document.getElementById('email');
      const phoneInput = document.getElementById('phone');
      
      if (firstNameInput) firstNameInput.value = data.data.firstName || '';
      if (lastNameInput) lastNameInput.value = data.data.lastName || '';
      if (emailInput) emailInput.value = data.data.email || '';
      if (phoneInput) phoneInput.value = data.data.phone || '';
    } else {
      const errorMsg = document.getElementById('errorMessage');
      if (errorMsg) {
        errorMsg.textContent = data.message || 'Failed to load profile.';
        errorMsg.style.display = 'block';
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    const errorMsg = document.getElementById('errorMessage');
    if (errorMsg) {
      errorMsg.textContent = 'Error loading profile. Please try again.';
      errorMsg.style.display = 'block';
    }
  }
}

function initializeProfileForm() {
  const profileForm = document.getElementById('profileForm');
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');
  const updateButton = document.getElementById('updateButton');

  if (!profileForm) return;

  profileForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (updateButton && updateButton.disabled) return;
    
    if (updateButton) {
      updateButton.disabled = true;
      updateButton.textContent = 'Updating...';
    }
    
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';
    successMessage.style.display = 'none';
    successMessage.textContent = '';

    const token = localStorage.getItem('token');
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    let phone = document.getElementById('phone').value.trim();

    if (phone) {
      phone = phone.replace(/\s+/g, '').replace(/[-()]/g, '');
    }

    if (!firstName || !lastName) {
      errorMessage.textContent = 'First name and last name are required!';
      errorMessage.style.display = 'block';
      if (updateButton) {
        updateButton.disabled = false;
        updateButton.textContent = 'Update Profile';
      }
      return;
    }

    try {
      const requestBody = {
        firstName,
        lastName
      };

      if (phone) requestBody.phone = phone;

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('userName', `${data.data.firstName} ${data.data.lastName}`);
        localStorage.setItem('userEmail', data.data.email);
        localStorage.setItem('userPhone', data.data.phone || '');
        localStorage.setItem('userFirstName', data.data.firstName);
        localStorage.setItem('userLastName', data.data.lastName);
        
        successMessage.textContent = 'Profile updated successfully!';
        successMessage.style.display = 'block';
      } else {
        errorMessage.textContent = data.message || 'Failed to update profile. Please try again.';
        errorMessage.style.display = 'block';
      }
    } catch (error) {
      console.error('Update error:', error);
      errorMessage.textContent = 'Network error. Please check if the server is running.';
      errorMessage.style.display = 'block';
    } finally {
      if (updateButton) {
        updateButton.disabled = false;
        updateButton.textContent = 'Update Profile';
      }
    }
  });
}

function initializeChangePassword() {
  const changePasswordButton = document.getElementById('changePasswordButton');
  const changePasswordModal = document.getElementById('changePasswordModal');
  const changePasswordForm = document.getElementById('changePasswordForm');
  const passwordErrorMessage = document.getElementById('passwordErrorMessage');
  const passwordSuccessMessage = document.getElementById('passwordSuccessMessage');
  const changePasswordSubmitButton = document.getElementById('changePasswordSubmitButton');

  if (changePasswordButton) {
    changePasswordButton.addEventListener('click', function() {
      if (changePasswordModal) {
        changePasswordModal.style.display = 'block';
      }
    });
  }

  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      if (changePasswordSubmitButton && changePasswordSubmitButton.disabled) return;
      
      if (changePasswordSubmitButton) {
        changePasswordSubmitButton.disabled = true;
        changePasswordSubmitButton.textContent = 'Changing...';
      }
      
      passwordErrorMessage.style.display = 'none';
      passwordErrorMessage.textContent = '';
      passwordSuccessMessage.style.display = 'none';
      passwordSuccessMessage.textContent = '';

      const token = localStorage.getItem('token');
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmNewPassword = document.getElementById('confirmNewPassword').value;

      if (!currentPassword || !newPassword || !confirmNewPassword) {
        passwordErrorMessage.textContent = 'All fields are required!';
        passwordErrorMessage.style.display = 'block';
        if (changePasswordSubmitButton) {
          changePasswordSubmitButton.disabled = false;
          changePasswordSubmitButton.textContent = 'Change Password';
        }
        return;
      }

      if (newPassword.length < 6) {
        passwordErrorMessage.textContent = 'New password must be at least 6 characters!';
        passwordErrorMessage.style.display = 'block';
        if (changePasswordSubmitButton) {
          changePasswordSubmitButton.disabled = false;
          changePasswordSubmitButton.textContent = 'Change Password';
        }
        return;
      }

      if (newPassword !== confirmNewPassword) {
        passwordErrorMessage.textContent = 'New passwords do not match!';
        passwordErrorMessage.style.display = 'block';
        if (changePasswordSubmitButton) {
          changePasswordSubmitButton.disabled = false;
          changePasswordSubmitButton.textContent = 'Change Password';
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            currentPassword,
            newPassword
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          passwordSuccessMessage.textContent = 'Password changed successfully!';
          passwordSuccessMessage.style.display = 'block';
          changePasswordForm.reset();
          setTimeout(() => {
            closeChangePasswordModal();
          }, 1500);
        } else {
          passwordErrorMessage.textContent = data.message || 'Failed to change password. Please try again.';
          passwordErrorMessage.style.display = 'block';
        }
      } catch (error) {
        console.error('Change password error:', error);
        passwordErrorMessage.textContent = 'Network error. Please check if the server is running.';
        passwordErrorMessage.style.display = 'block';
      } finally {
        if (changePasswordSubmitButton) {
          changePasswordSubmitButton.disabled = false;
          changePasswordSubmitButton.textContent = 'Change Password';
        }
      }
    });
  }
}

function closeChangePasswordModal() {
  const changePasswordModal = document.getElementById('changePasswordModal');
  const changePasswordForm = document.getElementById('changePasswordForm');
  const passwordErrorMessage = document.getElementById('passwordErrorMessage');
  const passwordSuccessMessage = document.getElementById('passwordSuccessMessage');
  
  if (changePasswordModal) {
    changePasswordModal.style.display = 'none';
  }
  if (changePasswordForm) {
    changePasswordForm.reset();
  }
  if (passwordErrorMessage) {
    passwordErrorMessage.style.display = 'none';
    passwordErrorMessage.textContent = '';
  }
  if (passwordSuccessMessage) {
    passwordSuccessMessage.style.display = 'none';
    passwordSuccessMessage.textContent = '';
  }
}

// Close modal when clicking outside
window.onclick = function(event) {
  const changePasswordModal = document.getElementById('changePasswordModal');
  if (event.target == changePasswordModal) {
    closeChangePasswordModal();
  }
}
