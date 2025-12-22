// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function () {
  console.log('Search page loaded');

  // Note: Search page doesn't require authentication (anyone can search)
  // But we can show user info if logged in
  const token = localStorage.getItem('token');

  if (token) {
    updateNavigationForLoggedInUser();
  }

  // Initialize search functionality
  initializeSearch();

  // Load all items on page load
  loadAllItems();
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

// Initialize search functionality
function initializeSearch() {
  const searchButton = document.querySelector('.search-button');
  const searchInput = document.querySelector('.search-box input');
  const categorySelect = document.querySelector('.categories-filter select');
  const resultsText = document.querySelector('.results-text');

  if (!searchButton || !searchInput) return;

  // Search on button click
  searchButton.addEventListener('click', function (e) {
    e.preventDefault();
    performSearch();
  });

  // Search on Enter key
  searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch();
    }
  });

  // Search on category change
  if (categorySelect) {
    categorySelect.addEventListener('change', function () {
      performSearch();
    });
  }
}

// Load all items on page load
async function loadAllItems() {
  const resultsText = document.querySelector('.results-text');

  try {
    // Fetch all items (status=found to show found items)
    const response = await fetch(`${API_BASE_URL}/items?status=found`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      const count = data.data?.length || 0;
      if (resultsText) {
        resultsText.textContent = `We found ${count} unclaimed item${count !== 1 ? 's' : ''}.`;
      }

      // Display all items
      displaySearchResults(data.data || []);
    } else {
      if (resultsText) {
        resultsText.textContent = 'No items found.';
      }
      displaySearchResults([]);
    }
  } catch (error) {
    console.error('Error loading items:', error);
    if (resultsText) {
      resultsText.textContent = 'Error loading items. Please check if the server is running.';
    }
  }
}


// Perform search
async function performSearch() {
  const searchInput = document.querySelector('.search-box input');
  const categorySelect = document.querySelector('.categories-filter select');
  const resultsText = document.querySelector('.results-text');

  const searchTerm = searchInput.value.trim();
  const category = categorySelect.value;

  try {
    // Build query parameters
    const params = new URLSearchParams();
    // Always show only found items
    params.append('status', 'found');

    if (searchTerm) params.append('search', searchTerm);
    if (category && category !== '') {
      params.append('category', category);
    }

    // Send search request
    const response = await fetch(`${API_BASE_URL}/items?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Update results count
      const count = data.data?.length || 0;
      if (resultsText) {
        resultsText.textContent = `We found ${count} item${count !== 1 ? 's' : ''}.`;
      }

      // Display results (you'll need to implement result display UI)
      displaySearchResults(data.data || []);
    } else {
      if (resultsText) {
        resultsText.textContent = 'No items found.';
      }
      displaySearchResults([]);
    }
  } catch (error) {
    console.error('Search error:', error);
    if (resultsText) {
      resultsText.textContent = 'Error searching items. Please try again.';
    }
  }
}

// Display search results
function displaySearchResults(items) {
  // TODO: Implement result display UI
  // This is a placeholder - you'll need to create a results container
  // and display items in cards or a list format
  console.log('Search results:', items);

  // Example: Create a results container if it doesn't exist
  let resultsContainer = document.querySelector('.search-results');
  if (!resultsContainer) {
    resultsContainer = document.createElement('div');
    resultsContainer.className = 'search-results';
    const searchBar = document.querySelector('.search-bar');
    if (searchBar) {
      searchBar.parentNode.insertBefore(resultsContainer, searchBar.nextSibling);
    }
  }

  if (items.length === 0) {
    resultsContainer.innerHTML = '<div class="no-items">No items found matching your search.</div>';
    return;
  }

  // Display items with improved design
  resultsContainer.innerHTML = items.map(item => {
    const date = new Date(item.created_at);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const location = item.location_found || item.location_lost || 'Not specified';
    const category = item.category.charAt(0).toUpperCase() + item.category.slice(1);

    return `
      <div class="item-card">
        <div class="item-header">
          <h3 class="item-title">${item.title}</h3>
          <span class="item-status">Found</span>
        </div>

        <div class="item-details">
          <div class="item-detail">
            <span class="detail-label">Category:</span>
            <span class="detail-value">${category}</span>
          </div>
          <div class="item-detail">
            <span class="detail-label">Location:</span>
            <span class="detail-value">${location}</span>
          </div>
        </div>

        <p class="item-description">${item.description || 'No additional details provided.'}</p>

        <div class="item-footer">
          <span class="item-date">Posted on ${formattedDate}</span>
          <button class="contact-btn" onclick="contactOwner(${item.id})">Contact</button>
        </div>
      </div>
    `;
  }).join('');
}

// Contact owner function
function contactOwner(itemId) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login to contact the item owner.');
    window.location.href = 'login.html';
    return;
  }

  // TODO: Implement contact modal or redirect to contact page
  alert(`Contact functionality for item #${itemId} will be implemented soon.`);
}
