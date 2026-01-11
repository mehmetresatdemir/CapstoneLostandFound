// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function () {
  console.log('Report page loaded');

  // Check if user is logged in
  const token = localStorage.getItem('token');

  if (!token) {
    // Redirect to login if not authenticated
    alert('Please login to report a found item.');
    window.location.href = 'login.html';
    return;
  }

  // Update navigation for logged in user
  updateNavigationForLoggedInUser();

  // Initialize form
  initializeReportForm();
});

// Update navigation for logged in users
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

// Logout function
function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

// Initialize report form
function initializeReportForm() {
  const reportForm = document.querySelector('.report-form');
  if (!reportForm) return;

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
    const locationFound = document.getElementById('location').value.trim();
    const description = document.getElementById('details').value.trim();
    const photoFile = document.getElementById('photo').files[0];

    // Validation
    if (!title || !category || !locationFound) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      // Prepare request body
      const requestBody = {
        title: title,
        description: description || title, // Use title as description if not provided
        category: category,
        itemStatus: 'found',
        locationFound: locationFound
      };

      // TODO: Handle image upload separately if needed
      // For now, we'll skip image upload until we implement file upload endpoint

      // Send request
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
        // Redirect to home page after successful submission
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } else {
        alert(data.message || 'Failed to report item. Please try again.');
      }
    } catch (error) {
      console.error('Report error:', error);
      alert('Network error. Please check if the server is running.');
    }
  });

  // File upload display
  const photoInput = document.getElementById('photo');
  const fileNameSpan = document.querySelector('.file-name');
  if (photoInput && fileNameSpan) {
    photoInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (file) {
        fileNameSpan.textContent = file.name;
      } else {
        fileNameSpan.textContent = 'No file chosen';
      }
    });
  }
}

