// API Base URL
const API_BASE_URL = '/api';

// Global state
let currentTab = 'all-items';

document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('token');

  if (token) {
    updateNavigationForLoggedInUser();
    showTabNavigation();
    initializeTabs();
  }

  initializeSearch();
  loadAllItems();
});

function updateNavigationForLoggedInUser() {
  const userName = localStorage.getItem('userName');
  const nav = document.querySelector('nav ul');
  if (nav && userName) {
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
  localStorage.clear();
  window.location.href = 'login.html';
}

function initializeSearch() {
  const searchButton = document.querySelector('.search-button');
  const searchInput = document.querySelector('.search-box input');
  const categorySelect = document.querySelector('.categories-filter select');
  const statusSelect = document.getElementById('statusFilter');
  const resultsText = document.querySelector('.results-text');

  if (!searchButton || !searchInput) return;

  searchButton.addEventListener('click', function (e) {
    e.preventDefault();
    if (currentTab === 'all-items') performSearch();
  });

  searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentTab === 'all-items') performSearch();
    }
  });

  if (categorySelect) {
    categorySelect.addEventListener('change', function () {
      if (currentTab === 'all-items') performSearch();
    });
  }

  if (statusSelect) {
    statusSelect.addEventListener('change', function () {
      if (currentTab === 'all-items') performSearch();
    });
  }
}

async function loadAllItems() {
  const resultsText = document.querySelector('.results-text');
  const statusSelect = document.getElementById('statusFilter');
  const status = statusSelect ? statusSelect.value : '';

  try {
    const params = new URLSearchParams();
    if (status && status !== '') params.append('status', status);

    const url = params.toString() ? `${API_BASE_URL}/items?${params.toString()}` : `${API_BASE_URL}/items`;
    
    const response = await fetch(url, {
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


async function performSearch() {
  const searchInput = document.querySelector('.search-box input');
  const categorySelect = document.querySelector('.categories-filter select');
  const statusSelect = document.getElementById('statusFilter');
  const resultsText = document.querySelector('.results-text');

  const searchTerm = searchInput.value.trim();
  const category = categorySelect.value;
  const status = statusSelect ? statusSelect.value : '';

  try {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (category && category !== '') params.append('category', category);
    if (status && status !== '') params.append('status', status);

    const response = await fetch(`${API_BASE_URL}/items?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      const count = data.data?.length || 0;
      if (resultsText) {
        resultsText.textContent = `We found ${count} item${count !== 1 ? 's' : ''}.`;
      }
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

function displaySearchResults(items) {
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

  resultsContainer.innerHTML = items.map(item => {
    const date = new Date(item.created_at);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const location = item.location_found || item.location_lost || 'Not specified';
    const category = item.category.charAt(0).toUpperCase() + item.category.slice(1);
    const imageUrl = item.image_url || item.imageUrl || item.image_path || item.image;
    const imageHtml = imageUrl 
      ? `<div class="item-image">
           <img src="${imageUrl}" alt="${item.title}" onerror="console.error('Image load error for:', '${item.title}'); this.parentElement.classList.add('no-image')" loading="lazy">
         </div>`
      : `<div class="item-image no-image">
           <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
             <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
             <circle cx="8.5" cy="8.5" r="1.5"/>
             <polyline points="21 15 16 10 5 21"/>
           </svg>
         </div>`;

    const status = item.item_status.charAt(0).toUpperCase() + item.item_status.slice(1);
    const statusClass = item.item_status === 'found' ? 'item-status' : 'item-status-lost';

    return `
      <div class="item-card">
        ${imageHtml}
        <div class="item-header">
          <h3 class="item-title">${item.title}</h3>
          <span class="${statusClass}">${status}</span>
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

function showTabNavigation() {
  const tabNav = document.getElementById('tabNavigation');
  if (tabNav) {
    tabNav.style.display = 'flex';
  }
}

function initializeTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      tabButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      currentTab = this.dataset.tab;
      if (currentTab === 'all-items') {
        loadAllItems();
      } else if (currentTab === 'my-items') {
        loadMyItems();
      }
    });
  });
}

async function loadMyItems() {
  const token = localStorage.getItem('token');
  const resultsText = document.querySelector('.results-text');

  if (!token) {
    alert('Please login to view your items.');
    window.location.href = 'login.html';
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/items/user/items`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      const count = data.data?.length || 0;
      if (resultsText) {
        resultsText.textContent = `You have ${count} item${count !== 1 ? 's' : ''}.`;
      }
      displayUserItems(data.data || []);
    } else {
      if (resultsText) {
        resultsText.textContent = 'No items found.';
      }
      displayUserItems([]);
    }
  } catch (error) {
    console.error('Error loading user items:', error);
    if (resultsText) {
      resultsText.textContent = 'Error loading items.';
    }
  }
}

function displayUserItems(items) {
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
    resultsContainer.innerHTML = '<div class="no-items">You haven\'t posted any items yet.</div>';
    return;
  }

  resultsContainer.innerHTML = items.map(item => {
    const date = new Date(item.created_at);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const location = item.location_found || item.location_lost || 'Not specified';
    const category = item.category.charAt(0).toUpperCase() + item.category.slice(1);
    const status = item.item_status.charAt(0).toUpperCase() + item.item_status.slice(1);
    const imageUrl = item.image_url || item.imageUrl || item.image_path || item.image;
    const imageHtml = imageUrl 
      ? `<div class="item-image">
           <img src="${imageUrl}" alt="${item.title}" onerror="console.error('Image load error for:', '${item.title}'); this.parentElement.classList.add('no-image')" loading="lazy">
         </div>`
      : `<div class="item-image no-image">
           <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
             <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
             <circle cx="8.5" cy="8.5" r="1.5"/>
             <polyline points="21 15 16 10 5 21"/>
           </svg>
         </div>`;

    const statusClass = item.item_status === 'found' ? 'item-status' : 'item-status-lost';

    return `
      <div class="item-card ${item.is_resolved ? 'item-delivered' : ''}">
        ${imageHtml}
        <div class="item-header">
          <h3 class="item-title">${item.title}</h3>
          <span class="${statusClass}">${status}</span>
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
          <div class="item-actions-group">
            <button class="btn-delivered ${item.is_resolved ? 'delivered-done' : ''}" 
                    onclick="markAsDelivered(${item.id})"
                    ${item.is_resolved ? 'disabled' : ''}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              ${item.is_resolved ? 'Claimed' : 'Mark as Claimed'}
            </button>
            <div class="item-menu-container">
              <button class="item-menu-btn" onclick="toggleMenu(event, ${item.id})">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="2"/>
                  <circle cx="12" cy="12" r="2"/>
                  <circle cx="12" cy="19" r="2"/>
                </svg>
              </button>
              <div class="item-dropdown-menu" id="menu-${item.id}">
                <button class="dropdown-item" onclick="openEditModal(${item.id})">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </button>
                <button class="dropdown-item dropdown-item-danger" onclick="deleteItem(${item.id})">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function openEditModal(itemId) {
  const allMenus = document.querySelectorAll('.item-dropdown-menu');
  allMenus.forEach(menu => menu.classList.remove('show'));
  
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      const item = data.data;
      document.getElementById('editItemId').value = item.id;
      document.getElementById('editTitle').value = item.title;
      document.getElementById('editCategory').value = item.category;
      document.getElementById('editLocation').value = item.location_found || item.location_lost || '';
      document.getElementById('editDescription').value = item.description || '';
      document.getElementById('editStatus').value = item.is_resolved ? 'delivered' : 'active';
      document.getElementById('editModal').style.display = 'block';
    }
  } catch (error) {
    console.error('Error fetching item:', error);
    alert('Error loading item details.');
  }
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
  document.getElementById('editForm').reset();
}

document.getElementById('editForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const token = localStorage.getItem('token');
  const itemId = document.getElementById('editItemId').value;
  const title = document.getElementById('editTitle').value.trim();
  const category = document.getElementById('editCategory').value;
  const location = document.getElementById('editLocation').value.trim();
  const description = document.getElementById('editDescription').value.trim();
  const status = document.getElementById('editStatus').value;
  const photoFile = document.getElementById('editPhoto').files[0];

  try {
    const requestBody = {
      title,
      category,
      description,
      locationFound: location,
      isResolved: status === 'delivered'
    };

    if (photoFile) {
      const base64Image = await convertImageToBase64(photoFile);
      requestBody.imageUrl = base64Image;
    }

    const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert('Item updated successfully!');
      closeEditModal();
      loadMyItems();
    } else {
      alert(data.message || 'Failed to update item.');
    }
  } catch (error) {
    console.error('Update error:', error);
    alert('Error updating item.');
  }
});

async function markAsDelivered(itemId) {
  if (!confirm('Mark this item as claimed by the owner? It will no longer appear in search results.')) {
    return;
  }

  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}/resolve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert('Item marked as claimed! It will no longer appear in search results.');
      loadMyItems();
    } else {
      alert(data.message || 'Failed to mark item as claimed.');
    }
  } catch (error) {
    console.error('Resolve error:', error);
    alert('Error marking item as claimed.');
  }
}

async function deleteItem(itemId) {
  const allMenus = document.querySelectorAll('.item-dropdown-menu');
  allMenus.forEach(menu => menu.classList.remove('show'));
  
  if (!confirm('Are you sure you want to delete this item?')) {
    return;
  }

  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert('Item deleted successfully!');
      loadMyItems();
    } else {
      alert(data.message || 'Failed to delete item.');
    }
  } catch (error) {
    console.error('Delete error:', error);
    alert('Error deleting item.');
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

function toggleMenu(event, itemId) {
  event.stopPropagation();
  
  const menu = document.getElementById(`menu-${itemId}`);
  const allMenus = document.querySelectorAll('.item-dropdown-menu');
  
  allMenus.forEach(m => {
    if (m.id !== `menu-${itemId}`) {
      m.classList.remove('show');
    }
  });
  
  menu.classList.toggle('show');
}

document.addEventListener('click', function(event) {
  if (!event.target.closest('.item-menu-container')) {
    const allMenus = document.querySelectorAll('.item-dropdown-menu');
    allMenus.forEach(menu => menu.classList.remove('show'));
  }
});

window.onclick = function(event) {
  const editModal = document.getElementById('editModal');
  const contactModal = document.getElementById('contactModal');
  
  if (event.target == editModal) {
    closeEditModal();
  }
  
  if (event.target == contactModal) {
    closeContactModal();
  }
}

const closeButtons = document.querySelectorAll('.close');
closeButtons.forEach((btn, index) => {
  if (index === 0) {
    btn.addEventListener('click', closeContactModal);
  } else if (index === 1) {
    btn.addEventListener('click', closeEditModal);
  }
});

async function contactOwner(itemId) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login to contact the item owner.');
    window.location.href = 'login.html';
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      const item = data.data;
      const contactInfo = document.getElementById('contactInfo');
      contactInfo.innerHTML = `
        <div class="contact-details">
          <div class="contact-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <div>
              <div class="contact-label">Name</div>
              <div class="contact-value">${item.first_name} ${item.last_name}</div>
            </div>
          </div>
          
          <div class="contact-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <div>
              <div class="contact-label">Email</div>
              <div class="contact-value">
                <a href="mailto:${item.email}" style="color: var(--primary-color); text-decoration: none;">
                  ${item.email}
                </a>
              </div>
            </div>
          </div>
          
          ${item.phone ? `
            <div class="contact-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <div>
                <div class="contact-label">Phone</div>
                <div class="contact-value">
                  <a href="tel:${item.phone}" style="color: var(--primary-color); text-decoration: none;">
                    ${item.phone}
                  </a>
                </div>
              </div>
            </div>
          ` : ''}
          
          <div class="contact-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <div>
              <div class="contact-label">Item Details</div>
              <div class="contact-value">${item.title}</div>
              <div class="contact-value" style="font-size: 0.85rem; color: var(--text-light);">
                Found at: ${item.location_found || item.location_lost || 'Not specified'}
              </div>
            </div>
          </div>
        </div>
      `;
      document.getElementById('contactModal').style.display = 'block';
    } else {
      alert('Error loading contact information.');
    }
  } catch (error) {
    console.error('Error fetching contact info:', error);
    alert('Error loading contact information.');
  }
}

function closeContactModal() {
  document.getElementById('contactModal').style.display = 'none';
}
