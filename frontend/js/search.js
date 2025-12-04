// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('Search page loaded');
  
  // Note: Search page doesn't require authentication (anyone can search)
  // But we can show user info if logged in
  const token = localStorage.getItem('token');
  
  if (token) {
    updateNavigationForLoggedInUser();
  }
  
  // Initialize search functionality
  initializeSearch();
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
  searchButton.addEventListener('click', function(e) {
    e.preventDefault();
    performSearch();
  });
  
  // Search on Enter key
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch();
    }
  });
  
  // Search on category change
  if (categorySelect) {
    categorySelect.addEventListener('change', function() {
      performSearch();
    });
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
    if (searchTerm) params.append('search', searchTerm);
    if (category && category !== 'Show all categories') {
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
    resultsContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">No items found.</p>';
    return;
  }
  
  // Display items (basic implementation)
  resultsContainer.innerHTML = items.map(item => `
    <div class="item-card" style="border: 1px solid #ddd; padding: 1rem; margin: 1rem; border-radius: 8px;">
      <h3>${item.title}</h3>
      <p><strong>Category:</strong> ${item.category}</p>
      <p><strong>Status:</strong> ${item.item_status}</p>
      <p><strong>Location:</strong> ${item.location_found || item.location_lost || 'N/A'}</p>
      <p>${item.description || ''}</p>
      ${item.image_url ? `<img src="${item.image_url}" alt="${item.title}" style="max-width: 200px;">` : ''}
    </div>
  `).join('');
}

