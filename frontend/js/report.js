const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('token');

  if (!token) {
    alert('Please login to report an item.');
    window.location.href = 'login.html';
    return;
  }

  updateNavigationForLoggedInUser();
  initializeReportForm();
});

function updateNavigationForLoggedInUser() {
  const userName = localStorage.getItem('userName');
  const nav = document.querySelector('nav ul');
  if (nav && userName) {
    const loginLink = nav.querySelector('a[href="login.html"]');
    if (loginLink) {
      const loginListItem = loginLink.parentElement;
      loginListItem.innerHTML = `
        <span style="color: white; margin-right: 1rem;">Welcome, ${userName}</span>
        <a href="#" onclick="logout(); return false;" style="cursor: pointer;">Logout</a>
      `;
    }
  }
}

function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

function initializeReportForm() {
  const reportForm = document.querySelector('.report-form');
  if (!reportForm) return;
  
  const reportTypeInputs = document.querySelectorAll('input[name="report-type"]');
  const locationLabel = document.getElementById('location-label');
  const locationInput = document.getElementById('location');
  
  reportTypeInputs.forEach(input => {
    input.addEventListener('change', function() {
      if (this.value === 'found') {
        locationLabel.textContent = 'Location Where Found *';
        locationInput.placeholder = 'Where did you find it?';
      } else {
        locationLabel.textContent = 'Location Where Lost *';
        locationInput.placeholder = 'Where did you lose it?';
      }
    });
  });
  
  const selectedType = document.querySelector('input[name="report-type"]:checked')?.value;
  if (selectedType === 'found') {
    locationLabel.textContent = 'Location Where Found *';
    locationInput.placeholder = 'Where did you find it?';
  }

  reportForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to submit a report.');
      window.location.href = 'login.html';
      return;
    }

    // Get form values
    const title = document.getElementById('item-description').value.trim();
    const category = document.querySelector('input[name="category"]:checked')?.value;
    const reportType = document.querySelector('input[name="report-type"]:checked')?.value;
    const location = document.getElementById('location').value.trim();
    const description = document.getElementById('details').value.trim();
    const photoFile = document.getElementById('photo').files[0];

    // Validation
    if (!title || !category || !location || !reportType) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const requestBody = {
        title,
        description: description || title,
        category,
        itemStatus: reportType
      };
      
      if (reportType === 'found') {
        requestBody.locationFound = location;
      } else {
        requestBody.locationLost = location;
      }

      if (photoFile) {
        try {
          const base64Image = await convertImageToBase64(photoFile);
          requestBody.imageUrl = base64Image;
        } catch (error) {
          console.error('Error converting image:', error);
          alert('Error processing image. Submitting without image.');
        }
      }

      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Item reported successfully!');
        reportForm.reset();
        setTimeout(() => window.location.href = 'index.html', 1500);
      } else {
        alert(data.message || 'Failed to report item. Please try again.');
      }
    } catch (error) {
      console.error('Report error:', error);
      alert('Network error. Please check if the server is running.');
    }
  });

  const photoInput = document.getElementById('photo');
  const fileNameSpan = document.querySelector('.file-name');
  if (photoInput && fileNameSpan) {
    photoInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (file) {
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          alert('Image file is too large. Please choose an image smaller than 5MB.');
          photoInput.value = '';
          fileNameSpan.textContent = 'No file chosen';
          return;
        }
        
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file.');
          photoInput.value = '';
          fileNameSpan.textContent = 'No file chosen';
          return;
        }
        
        fileNameSpan.textContent = file.name;
      } else {
        fileNameSpan.textContent = 'No file chosen';
      }
    });
  }
}

function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      resolve(e.target.result);
    };
    
    reader.onerror = function(error) {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
}

