/**
 * Smart Space Organizer - MCA Major Project Frontend Application Logic
 * Title: "Personalized AI-Based Household Object Organization Using Visual Recognition"
 * Connects with Python Flask Backend & SQLite Database (`smart_space.db`)
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Global State ---
  let currentUser = null;
  let cachedObjects = [];
  let cachedRooms = [];
  let cachedLocations = [];
  let uploadedFile = null;
  let aiDetectionResult = null;
  let activeFilterRoom = 'all';

  // --- Views ---
  const viewLanding = document.getElementById('viewLanding');
  const viewItems = document.getElementById('viewItems');
  const viewOrganize = document.getElementById('viewOrganize');
  const viewSettings = document.getElementById('viewSettings');
  const viewStoreItem = document.getElementById('viewStoreItem');
  const viewLocationResult = document.getElementById('viewLocationResult');

  const views = [viewLanding, viewItems, viewOrganize, viewSettings, viewStoreItem, viewLocationResult];

  // --- Navigation Elements ---
  const navHome = document.getElementById('navHome');
  const navItems = document.getElementById('navItems');
  const navOrganize = document.getElementById('navOrganize');
  const navSettings = document.getElementById('navSettings');
  const sidebarLogo = document.getElementById('sidebarLogo');
  const brandHeaderHome = document.getElementById('brandHeaderHome');
  const avatarProfileBtn = document.getElementById('avatarProfileBtn');

  const navItemsList = [navHome, navItems, navOrganize, navSettings];

  // Header Elements
  const userBadgePill = document.getElementById('userBadgePill');
  const headerUsernameText = document.getElementById('headerUsernameText');
  const btnLoginHeader = document.getElementById('btnLoginHeader');
  const btnLogoutHeader = document.getElementById('btnLogoutHeader');

  // Landing Metrics
  const statItemsCount = document.getElementById('statItemsCount');
  const statLocationsCount = document.getElementById('statLocationsCount');
  const statSpacesCount = document.getElementById('statSpacesCount');
  const cardItemsStored = document.getElementById('cardItemsStored');
  const cardLocationsSaved = document.getElementById('cardLocationsSaved');
  const cardSpacesOrganized = document.getElementById('cardSpacesOrganized');
  const btnCreateItem = document.getElementById('btnCreateItem');

  // Items Directory Elements
  const btnBackToHomeFromItems = document.getElementById('btnBackToHomeFromItems');
  const btnAddObjectFromItems = document.getElementById('btnAddObjectFromItems');
  const itemsSearchInput = document.getElementById('itemsSearchInput');
  const btnClearItemsSearch = document.getElementById('btnClearItemsSearch');
  const itemsFilterPills = document.getElementById('itemsFilterPills');
  const itemsGrid = document.getElementById('itemsGrid');
  const itemsEmptyState = document.getElementById('itemsEmptyState');
  const itemsEmptyTitle = document.getElementById('itemsEmptyTitle');
  const itemsEmptyDesc = document.getElementById('itemsEmptyDesc');
  const btnEmptyCreate = document.getElementById('btnEmptyCreate');

  // Organize Elements
  const btnBackToHomeFromOrganize = document.getElementById('btnBackToHomeFromOrganize');
  const btnOpenCreateRoomModal = document.getElementById('btnOpenCreateRoomModal');
  const btnOpenCreateLocModal = document.getElementById('btnOpenCreateLocModal');
  const organizeSearchInput = document.getElementById('organizeSearchInput');
  const btnLocateObject = document.getElementById('btnLocateObject');
  const locatorResultBanner = document.getElementById('locatorResultBanner');
  const locatorResultText = document.getElementById('locatorResultText');
  const roomsGridContainer = document.getElementById('roomsGridContainer');

  // Settings Elements
  const btnBackToHomeFromSettings = document.getElementById('btnBackToHomeFromSettings');
  const settingsUsername = document.getElementById('settingsUsername');
  const settingsEmail = document.getElementById('settingsEmail');
  const settingsSession = document.getElementById('settingsSession');
  const btnSettingsLogout = document.getElementById('btnSettingsLogout');

  // Add Object & Store Wizard Elements (Screens 02-05)
  const btnBackToHome = document.getElementById('btnBackToHome');
  const btnCancelStore = document.getElementById('btnCancelStore');
  const btnDirectSaveItem = document.getElementById('btnDirectSaveItem');
  const tabTypeItem = document.getElementById('tabTypeItem');
  const tabUploadImage = document.getElementById('tabUploadImage');
  const itemSearchInput = document.getElementById('itemSearchInput');
  const btnClearInput = document.getElementById('btnClearInput');
  const itemDescriptionInput = document.getElementById('itemDescriptionInput');
  const selectStoreRoom = document.getElementById('selectStoreRoom');
  const selectStoreLocation = document.getElementById('selectStoreLocation');
  const btnQuickAddRoom = document.getElementById('btnQuickAddRoom');
  const btnQuickAddLocation = document.getElementById('btnQuickAddLocation');
  const suggestionChips = document.querySelectorAll('.item-chip');

  const uploadDropzone = document.getElementById('uploadDropzone');
  const fileInput = document.getElementById('fileInput');
  const uploadDefaultContent = document.getElementById('uploadDefaultContent');
  const uploadPreviewContainer = document.getElementById('uploadPreviewContainer');
  const previewImage = document.getElementById('previewImage');
  const previewFilename = document.getElementById('previewFilename');
  const btnRemoveImage = document.getElementById('btnRemoveImage');
  const aiSuggestionBox = document.getElementById('aiSuggestionBox');
  const aiSuggestionText = document.getElementById('aiSuggestionText');
  const aiConfidenceBadge = document.getElementById('aiConfidenceBadge');
  const btnApplyAiSuggestion = document.getElementById('btnApplyAiSuggestion');

  // Multi-Step Wizard Elements (Screens 02 - 05)
  const storeStep1 = document.getElementById('storeStep1');
  const storeStep2 = document.getElementById('storeStep2');
  const storeStep3 = document.getElementById('storeStep3');
  const storeStep4 = document.getElementById('storeStep4');
  const storeSteps = [storeStep1, storeStep2, storeStep3, storeStep4];

  const btnStoreStep1Next = document.getElementById('btnStoreStep1Next');
  const btnStoreStep2Back = document.getElementById('btnStoreStep2Back');
  const btnStoreStep2Next = document.getElementById('btnStoreStep2Next');
  const btnStoreStep3Back = document.getElementById('btnStoreStep3Back');
  const btnStoreStep3Next = document.getElementById('btnStoreStep3Next');
  const btnStoreStep4Back = document.getElementById('btnStoreStep4Back');

  const locationCardsGrid = document.getElementById('locationCardsGrid');
  const subLocTitle = document.getElementById('subLocTitle');
  const subLocSubtitle = document.getElementById('subLocSubtitle');
  const subLocOptionsList = document.getElementById('subLocOptionsList');
  const inputCustomSubLocation = document.getElementById('inputCustomSubLocation');

  const locPhotoDropzone = document.getElementById('locPhotoDropzone');
  const locPhotoFileInput = document.getElementById('locPhotoFileInput');
  const locPhotoDefaultContent = document.getElementById('locPhotoDefaultContent');
  const locPhotoPreviewContainer = document.getElementById('locPhotoPreviewContainer');
  const locPreviewImage = document.getElementById('locPreviewImage');
  const locPreviewFilename = document.getElementById('locPreviewFilename');
  const btnRemoveLocPhoto = document.getElementById('btnRemoveLocPhoto');

  // Confirmation View Elements (Screen 06)
  const resultItemThumb = document.getElementById('resultItemThumb');
  const resultItemThumbIcon = document.getElementById('resultItemThumbIcon');
  const resultItemName = document.getElementById('resultItemName');
  const resultBreadcrumbs = document.getElementById('resultBreadcrumbs');
  const pathPillLocation = document.getElementById('pathPillLocation');
  const pathPillSubLocation = document.getElementById('pathPillSubLocation');
  const resultCurrentLocHierarchy = document.getElementById('resultCurrentLocHierarchy');
  const resultSavedDate = document.getElementById('resultSavedDate');
  const btnAddAnotherItem = document.getElementById('btnAddAnotherItem');
  const btnDecorateSpace = document.getElementById('btnDecorateSpace');
  const btnViewAllSavedItems = document.getElementById('btnViewAllSavedItems');
  const avatarProfileBtnHeader = document.getElementById('avatarProfileBtnHeader');

  // Wizard Global State
  let currentStoreStep = 1;
  let selectedMainLocation = 'Drawer';
  let selectedRoomName = 'Bedroom';
  let selectedSubLocation = 'Drawer under Study Desk';
  let uploadedLocationPhoto = null;

  // Sub-locations configuration mapping
  const LOCATION_SUBLOCS_MAP = {
    'Drawer': {
      title: 'Which drawer?',
      subtitle: 'Select the specific drawer where you kept it.',
      room: 'Bedroom',
      options: [
        'Drawer under Study Desk',
        'Drawer inside Dressing Table',
        'Bedside Drawer',
        'Kitchen Drawer',
        'Wardrobe Drawer',
        'Other Drawer'
      ]
    },
    'Wardrobe': {
      title: 'Which part of wardrobe?',
      subtitle: 'Select the section inside wardrobe.',
      room: 'Bedroom',
      options: [
        'Top Shelf',
        'Hanging Rod Section',
        'Lower Shelf',
        'Inner Drawer',
        'Shoe Rack',
        'Other Wardrobe Section'
      ]
    },
    'Bedroom': {
      title: 'Where in bedroom?',
      subtitle: 'Select the specific spot in the bedroom.',
      room: 'Bedroom',
      options: [
        'Bedside Table',
        'Under Bed Storage',
        'Bookshelf',
        'Wall Shelf',
        'Corner Stand',
        'Other Bedroom Spot'
      ]
    },
    'Kitchen': {
      title: 'Which kitchen spot?',
      subtitle: 'Select the specific kitchen cabinet or counter.',
      room: 'Kitchen',
      options: [
        'Upper Cabinet',
        'Lower Cabinet',
        'Cutlery Organizer',
        'Spice Rack',
        'Kitchen Countertop',
        'Pantry Shelf'
      ]
    },
    'Dressing Table': {
      title: 'Where on dressing table?',
      subtitle: 'Select the specific drawer or shelf.',
      room: 'Bedroom',
      options: [
        'Top Mirror Shelf',
        'Left Drawer',
        'Right Drawer',
        'Cosmetics Organizer Tray',
        'Jewelry Box',
        'Other Dressing Table Spot'
      ]
    },
    'Study Desk': {
      title: 'Where on study desk?',
      subtitle: 'Select the exact area on your desk.',
      room: 'Bedroom',
      options: [
        'Desk Drawer',
        'Monitor Stand',
        'Pen & Pencil Organizer',
        'Bookshelf Above Desk',
        'Cable Management Tray',
        'Desk Surface'
      ]
    },
    'Storage Box': {
      title: 'Which storage box?',
      subtitle: 'Select the labeled storage box.',
      room: 'Bedroom',
      options: [
        'Plastic Utility Box',
        'Fabric Wardrobe Box',
        'Under-Bed Box',
        'Electronics & Cables Box',
        'Documents Box',
        'Other Storage Box'
      ]
    },
    'Other': {
      title: 'Where is it stored?',
      subtitle: 'Select or specify the exact storage spot.',
      room: 'Living Room',
      options: [
        'Living Room Cabinet',
        'Balcony Storage',
        'Hallway Console',
        'Closet Shelf',
        'Shoe Cabinet',
        'Other Location'
      ]
    }
  };

  // Modals
  const loginModal = document.getElementById('loginModal');
  const btnCloseLoginModal = document.getElementById('btnCloseLoginModal');
  const tabSignIn = document.getElementById('tabSignIn');
  const tabRegister = document.getElementById('tabRegister');
  const authUsernameGroup = document.getElementById('authUsernameGroup');
  const authUsername = document.getElementById('authUsername');
  const authIdentLabel = document.getElementById('authIdentLabel');
  const authIdentifier = document.getElementById('authIdentifier');
  const authPassword = document.getElementById('authPassword');
  const btnSubmitAuth = document.getElementById('btnSubmitAuth');
  const authAlertBox = document.getElementById('authAlertBox');
  let isRegisterMode = false;

  const createRoomModal = document.getElementById('createRoomModal');
  const btnCloseRoomModal = document.getElementById('btnCloseRoomModal');
  const modalRoomName = document.getElementById('modalRoomName');
  const modalRoomDesc = document.getElementById('modalRoomDesc');
  const btnSaveNewRoom = document.getElementById('btnSaveNewRoom');

  const createLocationModal = document.getElementById('createLocationModal');
  const btnCloseLocModal = document.getElementById('btnCloseLocModal');
  const modalLocRoomSelect = document.getElementById('modalLocRoomSelect');
  const modalLocName = document.getElementById('modalLocName');
  const modalLocDesc = document.getElementById('modalLocDesc');
  const btnSaveNewLocation = document.getElementById('btnSaveNewLocation');

  const editItemModal = document.getElementById('editItemModal');
  const btnCloseEditModal = document.getElementById('btnCloseEditModal');
  const btnCancelEdit = document.getElementById('btnCancelEdit');
  const btnSaveEdit = document.getElementById('btnSaveEdit');
  const editItemId = document.getElementById('editItemId');
  const editItemName = document.getElementById('editItemName');
  const editItemRoomSelect = document.getElementById('editItemRoomSelect');
  const editItemLocSelect = document.getElementById('editItemLocSelect');
  const editItemDescription = document.getElementById('editItemDescription');

  const toastContainer = document.getElementById('toastContainer');

  // =========================================================================
  // View Switcher Helper
  // =========================================================================
  function switchView(targetView, activeNavBtn = null) {
    views.forEach(v => {
      if (v) v.classList.remove('active-view');
    });
    if (targetView) {
      targetView.classList.add('active-view');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navItemsList.forEach(btn => {
      if (btn) btn.classList.remove('active');
    });
    if (activeNavBtn) {
      activeNavBtn.classList.add('active');
    }
  }

  // Toast Notification
  function showToast(message, type = 'success') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✓' : (type === 'error' ? '✕' : 'ℹ');
    toast.innerHTML = `<span style="font-weight: bold; margin-right: 6px;">${icon}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  // =========================================================================
  // API Fetch Helpers
  // =========================================================================

  // 1. Check Authentication Status
  async function checkAuthStatus() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        currentUser = data.user;
        renderUserStatus(true, currentUser.username);
      } else if (data.user) {
        // Guest mode default account
        currentUser = data.user;
        renderUserStatus(false, currentUser.username);
      } else {
        currentUser = null;
        renderUserStatus(false, null);
      }
    } catch (err) {
      console.warn('Could not check auth status:', err);
    }
  }

  function renderUserStatus(isAuthenticated, username) {
    if (username) {
      if (headerUsernameText) headerUsernameText.textContent = username;
      if (settingsUsername) settingsUsername.textContent = username;
      if (settingsEmail) settingsEmail.textContent = currentUser?.email || `${username}@smartspace.io`;
      if (settingsSession) settingsSession.textContent = isAuthenticated ? 'Active (Authenticated)' : 'Guest Mode';
    }

    if (isAuthenticated) {
      if (userBadgePill) userBadgePill.style.display = 'inline-flex';
      if (btnLoginHeader) btnLoginHeader.style.display = 'none';
      if (btnLogoutHeader) btnLogoutHeader.style.display = 'inline-flex';
    } else {
      if (userBadgePill) userBadgePill.style.display = 'none';
      if (btnLoginHeader) btnLoginHeader.style.display = 'inline-flex';
      if (btnLogoutHeader) btnLogoutHeader.style.display = 'none';
    }
  }

  // 2. Fetch Dashboard Statistics
  async function fetchDashboardStats() {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const stats = await res.json();
        if (statItemsCount) statItemsCount.textContent = stats.items_stored ?? 0;
        if (statLocationsCount) statLocationsCount.textContent = stats.locations_saved ?? 0;
        if (statSpacesCount) statSpacesCount.textContent = stats.spaces_organized ?? 0;
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  }

  // 3. Fetch Rooms
  async function fetchRooms() {
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        cachedRooms = await res.json();
        populateRoomDropdowns();
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  }

  function populateRoomDropdowns() {
    const dropdowns = [selectStoreRoom, modalLocRoomSelect, editItemRoomSelect];
    dropdowns.forEach(dd => {
      if (!dd) return;
      const currentVal = dd.value;
      dd.innerHTML = '';
      if (cachedRooms.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'No rooms created yet';
        dd.appendChild(opt);
        return;
      }
      cachedRooms.forEach(room => {
        const opt = document.createElement('option');
        opt.value = room.id;
        opt.textContent = room.room_name;
        dd.appendChild(opt);
      });
      if (currentVal) dd.value = currentVal;
    });

    // Populate locations for the currently selected store room
    if (selectStoreRoom && selectStoreRoom.value) {
      fetchLocationsForRoom(selectStoreRoom.value, selectStoreLocation);
    }
  }

  // 4. Fetch Locations for Room
  async function fetchLocationsForRoom(roomId, targetSelect, selectedLocId = null) {
    if (!targetSelect) return;
    try {
      const url = roomId ? `/api/locations?room_id=${roomId}` : '/api/locations';
      const res = await fetch(url);
      if (res.ok) {
        const locs = await res.json();
        targetSelect.innerHTML = '';
        if (locs.length === 0) {
          const opt = document.createElement('option');
          opt.value = '';
          opt.textContent = 'Default Storage Area';
          targetSelect.appendChild(opt);
          return;
        }
        locs.forEach(loc => {
          const opt = document.createElement('option');
          opt.value = loc.id;
          opt.textContent = loc.location_name;
          targetSelect.appendChild(opt);
        });
        if (selectedLocId) targetSelect.value = selectedLocId;
      }
    } catch (err) {
      console.error('Error loading locations:', err);
    }
  }

  // Natural Language Search Query Parser (Screens 11 & 12)
  function parseSearchQuery(query) {
    if (!query) return '';
    let q = query.trim().toLowerCase();
    q = q.replace(/[?.,!;:"]/g, '');
    const fillers = new Set([
      'where', 'is', 'are', 'was', 'were', 'my', 'the', 'a', 'an', 'stored',
      'kept', 'located', 'find', 'show', 'me', 'tell', 'at', 'in', 'item',
      'items', 'object', 'objects', 'please', 'can', 'you', 'did', 'i', 'put',
      'leave', 'have', 'got', 'look', 'for', 'search'
    ]);
    const tokens = q.split(/\s+/).filter(word => !fillers.has(word));
    if (tokens.length > 0) {
      return tokens.join(' ');
    }
    return q;
  }

  // 5. Fetch and Render Items Directory (My Saved Items)
  let currentSearchQuery = '';
  async function fetchAndRenderItems(query = '') {
    if (!itemsGrid) return;
    currentSearchQuery = query;
    try {
      itemsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Loading saved items...</div>';
      const cleanQ = parseSearchQuery(query);
      const url = cleanQ ? `/api/objects/search?q=${encodeURIComponent(cleanQ)}` : '/api/objects';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to retrieve objects');
      cachedObjects = await res.json();
      renderItemsCards();
    } catch (err) {
      console.error('Error loading items:', err);
      itemsGrid.innerHTML = `<div class="search-error-state" style="grid-column: 1/-1; text-align: center; padding: 30px; color: #DC2626; font-weight: 600;">Failed to connect to database. Please make sure backend is running.</div>`;
    }
  }

  function renderItemsCards() {
    if (!itemsGrid) return;
    itemsGrid.innerHTML = '';

    let filtered = cachedObjects;

    // Filter by NLP Search Query if present
    const cleanQ = parseSearchQuery(currentSearchQuery);
    if (cleanQ) {
      filtered = filtered.filter(item => {
        const name = (item.object_name || '').toLowerCase();
        const path = (item.full_location_path || '').toLowerCase();
        const room = (item.room_name || '').toLowerCase();
        const loc = (item.location_name || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        return name.includes(cleanQ) || path.includes(cleanQ) || room.includes(cleanQ) || loc.includes(cleanQ) || desc.includes(cleanQ);
      });
    }

    // Filter by Location Chip (All, Wardrobe, Bedroom, Kitchen, Dressing Table, Drawer, Study Desk, Storage Box, Other)
    if (activeFilterRoom && activeFilterRoom.toLowerCase() !== 'all') {
      const chipFilter = activeFilterRoom.toLowerCase();
      filtered = filtered.filter(item => {
        const room = (item.room_name || '').toLowerCase();
        const loc = (item.location_name || '').toLowerCase();
        const path = (item.full_location_path || '').toLowerCase();
        return room.includes(chipFilter) || loc.includes(chipFilter) || path.includes(chipFilter);
      });
    }

    // Handle Empty States (Screen 11 & 12)
    if (filtered.length === 0) {
      if (itemsEmptyState) {
        itemsEmptyState.style.display = 'flex';
        if (itemsEmptyTitle) {
          itemsEmptyTitle.textContent = currentSearchQuery ? 'No items found' : 'No items saved yet';
        }
        if (itemsEmptyDesc) {
          itemsEmptyDesc.textContent = currentSearchQuery
            ? `We couldn't find anything matching "${currentSearchQuery}". Try searching for "charger", "watch", or "keys".`
            : 'Start by storing your first household object to organize your space.';
        }
      }
      return;
    }

    if (itemsEmptyState) itemsEmptyState.style.display = 'none';

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'item-card';

      let imgSrc = item.image_path || '';
      if (!imgSrc) {
        const n = (item.object_name || '').toLowerCase();
        if (n.includes('earphone') || n.includes('headphone') || n.includes('airpod')) {
          imgSrc = 'assets/wireless-earphones.jpg';
        } else if (n.includes('charger') || n.includes('laptop')) {
          imgSrc = 'assets/desk-workspace.jpg';
        } else if (n.includes('passport') || n.includes('key')) {
          imgSrc = 'assets/card-drawer.jpg';
        } else {
          imgSrc = 'assets/card-drawer.jpg';
        }
      }

      const displayPath = item.full_location_path || `${item.room_name || 'Room'} > ${item.location_name || 'Storage'}`;

      card.innerHTML = `
        <div class="item-card-image-box">
          <img src="${imgSrc}" alt="${escapeHtml(item.object_name)}" onerror="this.onerror=null; this.src='assets/card-drawer.jpg';">
        </div>
        <div class="item-card-body">
          <h3 class="item-card-title">${escapeHtml(item.object_name)}</h3>
          <div class="item-card-location-badge">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${escapeHtml(displayPath)}</span>
          </div>
          <p class="item-card-desc">${escapeHtml(item.description || 'Stored in ' + displayPath)}</p>
          <div class="item-card-footer">
            <span class="item-card-date">${formatDate(item.created_at)}</span>
            <div class="item-card-actions">
              <button type="button" class="btn-card-find" title="Find location" data-name="${escapeHtml(item.object_name)}" data-loc="${escapeHtml(displayPath)}">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span>Find</span>
              </button>
              <button type="button" class="btn-card-action edit-action" title="Edit object" data-id="${item.id}">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button type="button" class="btn-card-action delete-action" title="Delete object" data-id="${item.id}" data-name="${escapeHtml(item.object_name)}">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;

      // Attach button events
      card.querySelector('.btn-card-find').addEventListener('click', () => {
        showToast(`📍 ${item.object_name} is kept in: ${displayPath}`, 'success');
      });
      card.querySelector('.edit-action').addEventListener('click', () => openEditModal(item));
      card.querySelector('.delete-action').addEventListener('click', () => deleteObject(item.id, item.object_name));

      itemsGrid.appendChild(card);
    });
  }

  // 6. Fetch and Render Organize Page
  async function fetchAndRenderOrganizePage() {
    if (!roomsGridContainer) return;
    try {
      roomsGridContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Loading rooms and zones...</div>';
      const [roomsRes, locsRes, objsRes] = await Promise.all([
        fetch('/api/rooms'),
        fetch('/api/locations'),
        fetch('/api/objects')
      ]);

      cachedRooms = await roomsRes.json();
      cachedLocations = await locsRes.json();
      cachedObjects = await objsRes.json();

      populateRoomDropdowns();
      renderOrganizeRooms();
    } catch (err) {
      console.error('Error loading organize page:', err);
    }
  }

  function renderOrganizeRooms() {
    if (!roomsGridContainer) return;
    roomsGridContainer.innerHTML = '';

    if (cachedRooms.length === 0) {
      roomsGridContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: rgba(255,255,255,0.8); border-radius: 16px;">
          <h4 style="font-size: 16px; font-weight: 700; color: #1E1B4B;">No rooms created yet</h4>
          <p style="font-size: 14px; color: var(--text-secondary); margin: 6px 0 16px 0;">Create rooms such as Bedroom, Kitchen, or Living Room to organize your belongings.</p>
          <button type="button" class="btn-create-primary" id="btnEmptyCreateRoom"><span>+ Create Room</span></button>
        </div>
      `;
      const btn = document.getElementById('btnEmptyCreateRoom');
      if (btn) btn.addEventListener('click', () => createRoomModal.classList.add('active'));
      return;
    }

    cachedRooms.forEach(room => {
      const roomLocs = cachedLocations.filter(loc => loc.room_id === room.id);
      const roomObjs = cachedObjects.filter(obj => obj.room_id === room.id);

      const card = document.createElement('div');
      card.className = 'room-card';

      let locsHtml = '';
      if (roomLocs.length === 0) {
        locsHtml = `<div style="font-size: 13px; color: var(--text-light); padding: 8px 0;">No specific storage spots added yet.</div>`;
      } else {
        locsHtml = roomLocs.map(loc => {
          const locObjsCount = roomObjs.filter(o => o.location_id === loc.id).length;
          return `
            <div class="location-item-pill">
              <span>📍 ${escapeHtml(loc.location_name)}</span>
              <span class="location-item-count">${locObjsCount} object${locObjsCount === 1 ? '' : 's'}</span>
            </div>
          `;
        }).join('');
      }

      card.innerHTML = `
        <div class="room-card-head">
          <div class="room-card-title">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#7C3AED" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>${escapeHtml(room.room_name)}</span>
          </div>
          <span class="room-card-count">${roomObjs.length} stored</span>
        </div>
        <p style="font-size: 13.5px; color: var(--text-secondary);">${escapeHtml(room.description || 'Organized zone')}</p>
        <div class="room-locations-list">
          <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Storage Spots:</div>
          ${locsHtml}
        </div>
        <div style="margin-top: auto; padding-top: 12px; border-top: 1px solid #F1F5F9; display: flex; justify-content: space-between;">
          <button type="button" class="btn-card-add-loc" data-room-id="${room.id}" style="background: none; border: none; color: var(--primary-600); font-size: 13px; font-weight: 700; cursor: pointer;">+ Add Spot</button>
          <button type="button" class="btn-card-view-items" data-room-name="${escapeHtml(room.room_name)}" style="background: none; border: none; color: var(--text-secondary); font-size: 13px; font-weight: 600; cursor: pointer;">View Items →</button>
        </div>
      `;

      card.querySelector('.btn-card-add-loc').addEventListener('click', () => {
        if (modalLocRoomSelect) modalLocRoomSelect.value = room.id;
        createLocationModal.classList.add('active');
      });

      card.querySelector('.btn-card-view-items').addEventListener('click', () => {
        activeFilterRoom = room.room_name;
        updateFilterPillsActiveState();
        switchView(viewItems, navItems);
        fetchAndRenderItems();
      });

      roomsGridContainer.appendChild(card);
    });
  }

  // Part 5 Object Retrieval by Name
  async function locateSavedObjectByName() {
    const q = organizeSearchInput.value.trim();
    if (!q) {
      showToast('Please enter an object name to locate.', 'warning');
      return;
    }

    try {
      const res = await fetch(`/api/objects/search?q=${encodeURIComponent(q)}`);
      const results = await res.json();
      if (results && results.length > 0) {
        const found = results[0];
        // Part 5 Example: "Charger is stored in Bedroom → Study Desk Drawer."
        locatorResultText.innerHTML = `<strong>${escapeHtml(found.object_name)}</strong> is stored in <span style="color: #7C3AED; font-weight: 800;">${escapeHtml(found.full_location_path)}</span>.`;
        locatorResultBanner.classList.add('active');
        showToast(`Found: ${found.object_name} in ${found.full_location_path}!`, 'success');
      } else {
        locatorResultBanner.classList.remove('active');
        showToast(`No saved object found with name "${q}".`, 'error');
      }
    } catch (err) {
      console.error('Locate error:', err);
    }
  }

  // Delete Object
  async function deleteObject(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}" from SQLite database?`)) return;

    try {
      const res = await fetch(`/api/objects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `Deleted "${name}" successfully.`);
        fetchAndRenderItems();
        fetchDashboardStats();
      } else {
        showToast(data.message || 'Could not delete item.', 'error');
      }
    } catch (err) {
      showToast('Failed to connect to server.', 'error');
    }
  }

  // Open Edit Modal
  function openEditModal(item) {
    editItemId.value = item.id;
    editItemName.value = item.object_name;
    editItemDescription.value = item.description || '';

    // Populate room and location
    if (editItemRoomSelect) {
      editItemRoomSelect.value = item.room_id || '';
      fetchLocationsForRoom(item.room_id, editItemLocSelect, item.location_id);
    }
    editItemModal.classList.add('active');
  }

  // Save Edit Changes
  async function saveItemEdit() {
    const id = editItemId.value;
    const name = editItemName.value.trim();
    const roomId = editItemRoomSelect.value;
    const locId = editItemLocSelect.value;
    const desc = editItemDescription.value.trim();

    if (!name) {
      showToast('Object name cannot be empty.', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/objects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          object_name: name,
          room_id: roomId ? parseInt(roomId) : null,
          location_id: locId ? parseInt(locId) : null,
          description: desc
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Changes saved successfully.');
        editItemModal.classList.remove('active');
        fetchAndRenderItems();
        fetchDashboardStats();
      } else {
        showToast(data.message || 'Failed to update object.', 'error');
      }
    } catch (err) {
      showToast('Network error while saving changes.', 'error');
    }
  }

  // =========================================================================
  // AI Visual Recognition Handling (Part 7)
  // =========================================================================

  async function handleImageUploadForAi(file) {
    uploadedFile = file;
    previewFilename.textContent = file.name;

    // Show preview
    const reader = new FileReader();
    reader.onload = e => {
      previewImage.src = e.target.result;
      uploadDefaultContent.style.display = 'none';
      uploadPreviewContainer.style.display = 'flex';
    };
    reader.readAsDataURL(file);

    // Call /api/ai/recognize
    aiSuggestionBox.classList.add('active');
    aiSuggestionText.textContent = 'Analyzing photograph with PyTorch MobileNetV3 visual recognition model...';
    aiConfidenceBadge.textContent = 'Processing...';

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/ai/recognize', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        aiDetectionResult = data;
        const confidenceText = data.confidence_percentage || `${Math.round(data.confidence * 100)}%`;
        aiConfidenceBadge.textContent = `Confidence: ${confidenceText}`;

        if (data.needs_confirmation) {
          aiSuggestionText.innerHTML = `Suggested Object: <strong>${escapeHtml(data.suggested_name)}</strong> (${escapeHtml(data.category)})<br><span style="font-size: 12px; color: #D97706;">⚠️ Low confidence prediction. Please verify or correct the object name.</span>`;
        } else {
          aiSuggestionText.innerHTML = `AI Detected: <strong>${escapeHtml(data.suggested_name)}</strong> (${escapeHtml(data.category)})<br>Recommended Spot: <strong>${escapeHtml(data.suggested_room)} → ${escapeHtml(data.suggested_location)}</strong>`;
        }

        // Auto-fill object name if empty
        if (!itemSearchInput.value.trim()) {
          itemSearchInput.value = data.suggested_name;
        }
      } else {
        aiSuggestionText.textContent = data.message || 'Image recognition could not classify this object. Please enter the name manually.';
        aiConfidenceBadge.textContent = 'Manual Entry';
      }
    } catch (err) {
      console.error('AI recognition error:', err);
      aiSuggestionText.textContent = 'AI recognition offline. You can manually enter the object name and location.';
      aiConfidenceBadge.textContent = 'Manual';
    }
  }

  function applyAiSuggestion() {
    if (!aiDetectionResult) return;
    itemSearchInput.value = aiDetectionResult.suggested_name;

    // Match suggested room
    if (aiDetectionResult.suggested_room && selectStoreRoom) {
      const matchRoom = cachedRooms.find(r => r.room_name.toLowerCase().includes(aiDetectionResult.suggested_room.toLowerCase()));
      if (matchRoom) {
        selectStoreRoom.value = matchRoom.id;
        fetchLocationsForRoom(matchRoom.id, selectStoreLocation);
      }
    }
    showToast(`Applied AI suggestion: "${aiDetectionResult.suggested_name}"`);
  }

  function removeUploadedImage() {
    uploadedFile = null;
    fileInput.value = '';
    previewImage.src = '';
    uploadDefaultContent.style.display = 'flex';
    uploadPreviewContainer.style.display = 'none';
    aiSuggestionBox.classList.remove('active');
    aiDetectionResult = null;
  }

  function removeUploadedLocPhoto() {
    uploadedLocationPhoto = null;
    if (locPhotoFileInput) locPhotoFileInput.value = '';
    if (locPreviewImage) locPreviewImage.src = '';
    if (locPhotoDefaultContent) locPhotoDefaultContent.style.display = 'flex';
    if (locPhotoPreviewContainer) locPhotoPreviewContainer.style.display = 'none';
  }

  // Wizard Step Navigation Helper
  function setStoreStep(stepNum) {
    currentStoreStep = stepNum;
    storeSteps.forEach((s, idx) => {
      if (s) {
        if (idx + 1 === stepNum) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Render Dynamic Sub-Locations for Step 3 (Screen 04)
  function renderSubLocationOptions(mainLoc) {
    const config = LOCATION_SUBLOCS_MAP[mainLoc] || LOCATION_SUBLOCS_MAP['Drawer'];
    if (subLocTitle) subLocTitle.textContent = config.title;
    if (subLocSubtitle) subLocSubtitle.textContent = config.subtitle;
    if (config.room) selectedRoomName = config.room;

    if (!subLocOptionsList) return;
    subLocOptionsList.innerHTML = '';

    config.options.forEach((opt, idx) => {
      const isFirst = idx === 0;
      if (isFirst) selectedSubLocation = opt;

      const label = document.createElement('label');
      label.className = `subloc-radio-card ${isFirst ? 'selected' : ''}`;
      label.innerHTML = `
        <input type="radio" name="sublocOption" value="${escapeHtml(opt)}" ${isFirst ? 'checked' : ''}>
        <span class="custom-radio-circle"></span>
        <span class="subloc-label-text">${escapeHtml(opt)}</span>
        <span class="subloc-badge-dot"></span>
      `;

      label.addEventListener('click', () => {
        subLocOptionsList.querySelectorAll('.subloc-radio-card').forEach(c => c.classList.remove('selected'));
        label.classList.add('selected');
        const r = label.querySelector('input');
        if (r) r.checked = true;
        selectedSubLocation = opt;
        if (inputCustomSubLocation) inputCustomSubLocation.value = '';
      });

      subLocOptionsList.appendChild(label);
    });
  }

  // Save Object Workflow (Screens 02-05 -> Screen 06)
  async function saveObjectWorkflow() {
    const objectName = itemSearchInput.value.trim();

    if (!objectName) {
      showToast('Please enter an object name.', 'error');
      setStoreStep(1);
      itemSearchInput.focus();
      return;
    }

    // Determine Room: Match room from cachedRooms or use selectedRoomName
    let roomId = selectStoreRoom && selectStoreRoom.value ? selectStoreRoom.value : null;
    if (!roomId) {
      const matchRoom = cachedRooms.find(r => (r.room_name || '').toLowerCase() === selectedRoomName.toLowerCase());
      if (matchRoom) {
        roomId = matchRoom.id;
      } else if (cachedRooms.length > 0) {
        roomId = cachedRooms[0].id;
      } else {
        roomId = selectedRoomName || 'Bedroom';
      }
    }

    // Determine Location: Match selectedSubLocation or pass as string
    let locId = selectStoreLocation && selectStoreLocation.value ? selectStoreLocation.value : null;
    if (!locId && selectedSubLocation) {
      const matchLoc = cachedLocations.find(l => (l.location_name || '').toLowerCase() === selectedSubLocation.toLowerCase());
      if (matchLoc) {
        locId = matchLoc.id;
      } else {
        locId = selectedSubLocation;
      }
    }

    const description = itemDescriptionInput ? itemDescriptionInput.value.trim() : '';

    const formData = new FormData();
    formData.append('object_name', objectName);
    formData.append('room_id', roomId);
    if (locId) formData.append('location_id', locId);
    if (description) formData.append('description', description);
    if (uploadedFile) {
      formData.append('image', uploadedFile);
    } else if (uploadedLocationPhoto) {
      formData.append('image', uploadedLocationPhoto);
    }

    try {
      const res = await fetch('/api/objects', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        const savedObj = data.object;
        showToast(data.message || `"${objectName}" saved successfully.`);

        // Render Confirmation View (Screen 06)
        if (resultItemName) resultItemName.textContent = savedObj.object_name;

        const roomDisplay = savedObj.room_name || selectedRoomName || 'Bedroom';
        const locDisplay = selectedMainLocation || 'Drawer';
        const subLocDisplay = selectedSubLocation || savedObj.location_name || 'Storage Spot';

        if (resultBreadcrumbs) {
          resultBreadcrumbs.innerHTML = `
            <span class="path-pill">Home</span>
            <span class="path-arrow">→</span>
            <span class="path-pill">${escapeHtml(roomDisplay)}</span>
            <span class="path-arrow">→</span>
            <span class="path-pill">${escapeHtml(locDisplay)}</span>
            <span class="path-arrow">→</span>
            <span class="path-pill">${escapeHtml(subLocDisplay)}</span>
          `;
        }

        if (pathPillLocation) pathPillLocation.textContent = roomDisplay;
        if (pathPillSubLocation) pathPillSubLocation.textContent = locDisplay;
        if (resultCurrentLocHierarchy) {
          resultCurrentLocHierarchy.textContent = `${roomDisplay} → ${locDisplay} → ${subLocDisplay}`;
        }
        if (resultSavedDate) {
          resultSavedDate.textContent = 'Today';
        }

        if (savedObj.image_path) {
          resultItemThumb.src = savedObj.image_path;
          resultItemThumb.style.display = 'block';
          resultItemThumbIcon.style.display = 'none';
        } else {
          let fallbackImg = 'assets/wireless-earphones.jpg';
          const n = (savedObj.object_name || '').toLowerCase();
          if (n.includes('charger') || n.includes('laptop') || n.includes('desk')) fallbackImg = 'assets/desk-workspace.jpg';
          else if (n.includes('passport') || n.includes('key') || n.includes('drawer')) fallbackImg = 'assets/card-drawer.jpg';
          else if (n.includes('wardrobe') || n.includes('cloth')) fallbackImg = 'assets/card-wardrobe.jpg';
          else if (n.includes('kitchen')) fallbackImg = 'assets/card-kitchen.jpg';
          resultItemThumb.src = fallbackImg;
          resultItemThumb.style.display = 'block';
          resultItemThumbIcon.style.display = 'none';
        }

        // Reset Add Form and Wizard to Step 1
        itemSearchInput.value = '';
        if (itemDescriptionInput) itemDescriptionInput.value = '';
        if (inputCustomSubLocation) inputCustomSubLocation.value = '';
        removeUploadedImage();
        removeUploadedLocPhoto();
        setStoreStep(1);

        // Switch to Confirmation view & refresh stats
        switchView(viewLocationResult);
        fetchDashboardStats();
        fetchRooms();
      } else {
        showToast(data.message || 'Failed to save object.', 'error');
      }
    } catch (err) {
      console.error('Save object error:', err);
      showToast('Connection error. Could not reach server.', 'error');
    }
  }

  // =========================================================================
  // Navigation & User Interaction Listeners
  // =========================================================================

  // Sidebar Buttons
  if (navHome) navHome.addEventListener('click', () => {
    switchView(viewLanding, navHome);
    fetchDashboardStats();
  });

  if (navItems) navItems.addEventListener('click', () => {
    switchView(viewItems, navItems);
    fetchAndRenderItems();
  });

  if (navOrganize) navOrganize.addEventListener('click', () => {
    switchView(viewOrganize, navOrganize);
    fetchAndRenderOrganizePage();
  });

  if (navSettings) navSettings.addEventListener('click', () => {
    switchView(viewSettings, navSettings);
  });

  if (sidebarLogo) sidebarLogo.addEventListener('click', () => {
    switchView(viewLanding, navHome);
    fetchDashboardStats();
  });

  if (brandHeaderHome) brandHeaderHome.addEventListener('click', () => {
    switchView(viewLanding, navHome);
    fetchDashboardStats();
  });

  if (avatarProfileBtn) avatarProfileBtn.addEventListener('click', () => {
    switchView(viewSettings, navSettings);
  });

  // Hero "+ CREATE" button navigates to Add Object Page
  if (btnCreateItem) btnCreateItem.addEventListener('click', () => {
    switchView(viewStoreItem);
    fetchRooms();
  });

  // Landing Stat Card Click Actions
  if (cardItemsStored) cardItemsStored.addEventListener('click', () => {
    switchView(viewItems, navItems);
    fetchAndRenderItems();
  });

  if (cardLocationsSaved || cardSpacesOrganized) {
    const handleOrganizeClick = () => {
      switchView(viewOrganize, navOrganize);
      fetchAndRenderOrganizePage();
    };
    if (cardLocationsSaved) cardLocationsSaved.addEventListener('click', handleOrganizeClick);
    if (cardSpacesOrganized) cardSpacesOrganized.addEventListener('click', handleOrganizeClick);
  }

  // Items Directory Actions
  if (btnBackToHomeFromItems) btnBackToHomeFromItems.addEventListener('click', () => switchView(viewLanding, navHome));
  if (btnAddObjectFromItems) btnAddObjectFromItems.addEventListener('click', () => {
    switchView(viewStoreItem);
    fetchRooms();
  });
  if (btnEmptyCreate) btnEmptyCreate.addEventListener('click', () => {
    switchView(viewStoreItem);
    fetchRooms();
  });

  // Items Search Debounce
  let searchDebounceTimer = null;
  if (itemsSearchInput) {
    itemsSearchInput.addEventListener('input', e => {
      const q = e.target.value.trim();
      if (btnClearItemsSearch) btnClearItemsSearch.style.display = q ? 'block' : 'none';
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        fetchAndRenderItems(q);
      }, 250);
    });
  }

  if (btnClearItemsSearch) {
    btnClearItemsSearch.addEventListener('click', () => {
      itemsSearchInput.value = '';
      btnClearItemsSearch.style.display = 'none';
      fetchAndRenderItems();
    });
  }

  // Filter Pills
  if (itemsFilterPills) {
    itemsFilterPills.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        activeFilterRoom = pill.dataset.filter;
        updateFilterPillsActiveState();
        renderItemsCards();
      });
    });
  }

  function updateFilterPillsActiveState() {
    if (!itemsFilterPills) return;
    itemsFilterPills.querySelectorAll('.filter-pill').forEach(pill => {
      if (pill.dataset.filter === activeFilterRoom) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  // Organize Actions
  if (btnBackToHomeFromOrganize) btnBackToHomeFromOrganize.addEventListener('click', () => switchView(viewLanding, navHome));
  if (btnLocateObject) btnLocateObject.addEventListener('click', locateSavedObjectByName);
  if (organizeSearchInput) {
    organizeSearchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        locateSavedObjectByName();
      }
    });
  }

  if (btnOpenCreateRoomModal) btnOpenCreateRoomModal.addEventListener('click', () => createRoomModal.classList.add('active'));
  if (btnOpenCreateLocModal) btnOpenCreateLocModal.addEventListener('click', () => createLocationModal.classList.add('active'));

  // Settings Actions
  if (btnBackToHomeFromSettings) btnBackToHomeFromSettings.addEventListener('click', () => switchView(viewLanding, navHome));
  if (btnSettingsLogout) btnSettingsLogout.addEventListener('click', handleLogout);

  // Add Object View & Wizard Actions
  if (btnBackToHome) btnBackToHome.addEventListener('click', () => switchView(viewLanding, navHome));
  if (btnCancelStore) btnCancelStore.addEventListener('click', () => switchView(viewLanding, navHome));
  if (btnDirectSaveItem) btnDirectSaveItem.addEventListener('click', saveObjectWorkflow);

  // Step 1: Mode Switch Tabs (Type Item / Upload Image)
  if (tabTypeItem && tabUploadImage) {
    tabTypeItem.addEventListener('click', () => {
      tabTypeItem.classList.add('active');
      tabUploadImage.classList.remove('active');
      itemSearchInput.focus();
    });
    tabUploadImage.addEventListener('click', () => {
      tabUploadImage.classList.add('active');
      tabTypeItem.classList.remove('active');
      if (fileInput) fileInput.click();
    });
  }

  // Clear Input Button
  if (btnClearInput) {
    btnClearInput.addEventListener('click', () => {
      itemSearchInput.value = '';
      itemSearchInput.focus();
    });
  }

  // Suggestion Chips
  suggestionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      itemSearchInput.value = chip.dataset.item;
    });
  });

  // Wizard Step 1 Next Button
  if (btnStoreStep1Next) {
    btnStoreStep1Next.addEventListener('click', () => {
      const val = itemSearchInput.value.trim();
      if (!val && !uploadedFile) {
        showToast('Please type an item name or upload a photo to continue.', 'warning');
        itemSearchInput.focus();
        return;
      }
      setStoreStep(2);
    });
  }

  // Step 2: Location Card Selection (Screen 03)
  if (locationCardsGrid) {
    locationCardsGrid.querySelectorAll('.location-card').forEach(card => {
      card.addEventListener('click', () => {
        locationCardsGrid.querySelectorAll('.location-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedMainLocation = card.dataset.location || 'Drawer';
        selectedRoomName = card.dataset.room || 'Bedroom';
        renderSubLocationOptions(selectedMainLocation);
      });
    });
  }

  // Step 2 Next & Back
  if (btnStoreStep2Back) btnStoreStep2Back.addEventListener('click', () => setStoreStep(1));
  if (btnStoreStep2Next) {
    btnStoreStep2Next.addEventListener('click', () => {
      renderSubLocationOptions(selectedMainLocation);
      setStoreStep(3);
    });
  }

  // Step 3: Custom Sub-Location Input Listener
  if (inputCustomSubLocation) {
    inputCustomSubLocation.addEventListener('input', e => {
      const val = e.target.value.trim();
      if (val) {
        if (subLocOptionsList) {
          subLocOptionsList.querySelectorAll('.subloc-radio-card').forEach(c => {
            c.classList.remove('selected');
            const r = c.querySelector('input');
            if (r) r.checked = false;
          });
        }
        selectedSubLocation = val;
      }
    });
  }

  // Step 3 Next & Back
  if (btnStoreStep3Back) btnStoreStep3Back.addEventListener('click', () => setStoreStep(2));
  if (btnStoreStep3Next) {
    btnStoreStep3Next.addEventListener('click', () => {
      const customVal = inputCustomSubLocation ? inputCustomSubLocation.value.trim() : '';
      if (customVal) {
        selectedSubLocation = customVal;
      }
      setStoreStep(4);
    });
  }

  // Step 4: Location Photo Upload Dropzone (Screen 05)
  if (locPhotoDropzone && locPhotoFileInput) {
    locPhotoDropzone.addEventListener('click', e => {
      if (e.target.closest('#btnRemoveLocPhoto')) return;
      locPhotoFileInput.click();
    });

    locPhotoFileInput.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        uploadedLocationPhoto = file;
        if (locPreviewFilename) locPreviewFilename.textContent = file.name;
        const reader = new FileReader();
        reader.onload = ev => {
          if (locPreviewImage) locPreviewImage.src = ev.target.result;
          if (locPhotoDefaultContent) locPhotoDefaultContent.style.display = 'none';
          if (locPhotoPreviewContainer) locPhotoPreviewContainer.style.display = 'flex';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (btnRemoveLocPhoto) {
    btnRemoveLocPhoto.addEventListener('click', e => {
      e.stopPropagation();
      removeUploadedLocPhoto();
    });
  }

  // Step 4 Back
  if (btnStoreStep4Back) btnStoreStep4Back.addEventListener('click', () => setStoreStep(3));

  // Room Select Change Updates Location Select (Compatibility)
  if (selectStoreRoom) {
    selectStoreRoom.addEventListener('change', e => {
      fetchLocationsForRoom(e.target.value, selectStoreLocation);
    });
  }

  if (editItemRoomSelect) {
    editItemRoomSelect.addEventListener('change', e => {
      fetchLocationsForRoom(e.target.value, editItemLocSelect);
    });
  }

  // Quick Add Room / Location from Add Object Page
  if (btnQuickAddRoom) btnQuickAddRoom.addEventListener('click', () => createRoomModal.classList.add('active'));
  if (btnQuickAddLocation) btnQuickAddLocation.addEventListener('click', () => {
    if (modalLocRoomSelect && selectStoreRoom) modalLocRoomSelect.value = selectStoreRoom.value;
    createLocationModal.classList.add('active');
  });

  // Image Upload Dropzone (Step 1 AI Recognition)
  if (uploadDropzone && fileInput) {
    uploadDropzone.addEventListener('click', e => {
      if (e.target.closest('#btnRemoveImage') || e.target.closest('#btnApplyAiSuggestion')) return;
      fileInput.click();
    });

    fileInput.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) {
        handleImageUploadForAi(e.target.files[0]);
      }
    });

    uploadDropzone.addEventListener('dragover', e => {
      e.preventDefault();
      uploadDropzone.style.borderColor = 'var(--primary-500)';
    });

    uploadDropzone.addEventListener('dragleave', () => {
      uploadDropzone.style.borderColor = '';
    });

    uploadDropzone.addEventListener('drop', e => {
      e.preventDefault();
      uploadDropzone.style.borderColor = '';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImageUploadForAi(e.dataTransfer.files[0]);
      }
    });
  }

  if (btnRemoveImage) btnRemoveImage.addEventListener('click', e => {
    e.stopPropagation();
    removeUploadedImage();
  });

  if (btnApplyAiSuggestion) btnApplyAiSuggestion.addEventListener('click', e => {
    e.stopPropagation();
    applyAiSuggestion();
  });

  // Confirmation View Actions (Screen 06)
  if (btnAddAnotherItem) {
    btnAddAnotherItem.addEventListener('click', () => {
      itemSearchInput.value = '';
      if (itemDescriptionInput) itemDescriptionInput.value = '';
      if (inputCustomSubLocation) inputCustomSubLocation.value = '';
      removeUploadedImage();
      removeUploadedLocPhoto();
      setStoreStep(1);
      switchView(viewStoreItem);
      fetchRooms();
    });
  }

  if (btnDecorateSpace) {
    btnDecorateSpace.addEventListener('click', () => {
      switchView(viewOrganize, navOrganize);
      fetchAndRenderOrganizePage();
    });
  }

  if (btnViewAllSavedItems) {
    btnViewAllSavedItems.addEventListener('click', () => {
      switchView(viewItems, navItems);
      fetchAndRenderItems();
    });
  }

  // Header Avatar Profile Button
  if (avatarProfileBtnHeader) {
    avatarProfileBtnHeader.addEventListener('click', () => {
      switchView(viewSettings, navSettings);
    });
  }

  // =========================================================================
  // Modals Implementation
  // =========================================================================

  // Auth Modal
  if (btnLoginHeader) btnLoginHeader.addEventListener('click', () => {
    authAlertBox.style.display = 'none';
    loginModal.classList.add('active');
  });

  if (btnCloseLoginModal) btnCloseLoginModal.addEventListener('click', () => loginModal.classList.remove('active'));

  if (tabSignIn && tabRegister) {
    tabSignIn.addEventListener('click', () => {
      isRegisterMode = false;
      tabSignIn.classList.add('active');
      tabRegister.classList.remove('active');
      authUsernameGroup.style.display = 'none';
      authIdentLabel.textContent = 'Username or Email';
      btnSubmitAuth.textContent = 'Sign In';
      authAlertBox.style.display = 'none';
    });

    tabRegister.addEventListener('click', () => {
      isRegisterMode = true;
      tabRegister.classList.add('active');
      tabSignIn.classList.remove('active');
      authUsernameGroup.style.display = 'flex';
      authIdentLabel.textContent = 'Email Address';
      btnSubmitAuth.textContent = 'Create Account';
      authAlertBox.style.display = 'none';
    });
  }

  if (btnSubmitAuth) btnSubmitAuth.addEventListener('click', handleAuthSubmit);

  async function handleAuthSubmit() {
    authAlertBox.style.display = 'none';

    if (isRegisterMode) {
      const username = authUsername.value.trim();
      const email = authIdentifier.value.trim();
      const password = authPassword.value.trim();

      if (!username || !email || !password) {
        showAuthAlert('All fields are required.', 'error');
        return;
      }

      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (res.ok) {
          currentUser = data.user;
          renderUserStatus(true, currentUser.username);
          loginModal.classList.remove('active');
          showToast(`Account created! Welcome, ${currentUser.username}.`);
          fetchDashboardStats();
          fetchRooms();
          fetchAndRenderItems();
        } else {
          showAuthAlert(data.message || 'Registration failed.', 'error');
        }
      } catch (err) {
        showAuthAlert('Network error during registration.', 'error');
      }
    } else {
      const identifier = authIdentifier.value.trim();
      const password = authPassword.value.trim();

      if (!identifier || !password) {
        showAuthAlert('Please enter your username/email and password.', 'error');
        return;
      }

      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password })
        });
        const data = await res.json();
        if (res.ok) {
          currentUser = data.user;
          renderUserStatus(true, currentUser.username);
          loginModal.classList.remove('active');
          showToast(`Welcome back, ${currentUser.username}!`);
          fetchDashboardStats();
          fetchRooms();
          fetchAndRenderItems();
        } else {
          showAuthAlert(data.message || 'Invalid credentials.', 'error');
        }
      } catch (err) {
        showAuthAlert('Network error during login.', 'error');
      }
    }
  }

  function showAuthAlert(msg, type = 'error') {
    authAlertBox.textContent = msg;
    authAlertBox.style.display = 'block';
    authAlertBox.style.background = type === 'error' ? '#FEE2E2' : '#D1FAE5';
    authAlertBox.style.color = type === 'error' ? '#991B1B' : '#065F46';
  }

  async function handleLogout() {
    try {
      await fetch('/api/logout', { method: 'POST' });
      currentUser = null;
      renderUserStatus(false, null);
      showToast('Logged out successfully.');
      fetchDashboardStats();
      switchView(viewLanding, navHome);
    } catch (err) {
      showToast('Logout error.', 'error');
    }
  }

  if (btnLogoutHeader) btnLogoutHeader.addEventListener('click', handleLogout);

  // Room Creation Modal
  if (btnCloseRoomModal) btnCloseRoomModal.addEventListener('click', () => createRoomModal.classList.remove('active'));
  if (btnSaveNewRoom) {
    btnSaveNewRoom.addEventListener('click', async () => {
      const name = modalRoomName.value.trim();
      const desc = modalRoomDesc.value.trim();
      if (!name) {
        showToast('Please enter a room name.', 'error');
        return;
      }
      try {
        const res = await fetch('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room_name: name, description: desc })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(`Room "${name}" created successfully!`);
          modalRoomName.value = '';
          modalRoomDesc.value = '';
          createRoomModal.classList.remove('active');
          await fetchRooms();
          if (viewOrganize.classList.contains('active-view')) fetchAndRenderOrganizePage();
          fetchDashboardStats();
        } else {
          showToast(data.message || 'Error creating room.', 'error');
        }
      } catch (err) {
        showToast('Network error.', 'error');
      }
    });
  }

  // Location Creation Modal
  if (btnCloseLocModal) btnCloseLocModal.addEventListener('click', () => createLocationModal.classList.remove('active'));
  if (btnSaveNewLocation) {
    btnSaveNewLocation.addEventListener('click', async () => {
      const roomId = modalLocRoomSelect.value;
      const name = modalLocName.value.trim();
      const desc = modalLocDesc.value.trim();
      if (!roomId || !name) {
        showToast('Room and location name are required.', 'error');
        return;
      }
      try {
        const res = await fetch('/api/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room_id: parseInt(roomId), location_name: name, description: desc })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(`Location "${name}" saved successfully!`);
          modalLocName.value = '';
          modalLocDesc.value = '';
          createLocationModal.classList.remove('active');
          if (selectStoreRoom) fetchLocationsForRoom(selectStoreRoom.value, selectStoreLocation);
          if (viewOrganize.classList.contains('active-view')) fetchAndRenderOrganizePage();
          fetchDashboardStats();
        } else {
          showToast(data.message || 'Error saving location.', 'error');
        }
      } catch (err) {
        showToast('Network error.', 'error');
      }
    });
  }

  // Edit Object Modal
  if (btnCloseEditModal) btnCloseEditModal.addEventListener('click', () => editItemModal.classList.remove('active'));
  if (btnCancelEdit) btnCancelEdit.addEventListener('click', () => editItemModal.classList.remove('active'));
  if (btnSaveEdit) btnSaveEdit.addEventListener('click', saveItemEdit);

  // Close modals on overlay click
  [loginModal, createRoomModal, createLocationModal, editItemModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', e => {
        if (e.target === modal) modal.classList.remove('active');
      });
    }
  });

  // Utilities
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  // =========================================================================
  // Initialize Application
  // =========================================================================
  checkAuthStatus();
  fetchDashboardStats();
  fetchRooms();
});
