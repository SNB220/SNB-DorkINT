// ===== Dork Descriptions Database =====
const dorkDescriptions = {
  'site:': 'Search for results from a specific website.',
  'inurl:': 'Find pages where the URL contains a specific word.',
  'intitle:': 'Find pages where the title contains specific words.',
  'intext:': 'Find pages where the body text contains specific words.',
  'allintitle:': 'All words must appear in the title.',
  'allintext:': 'All words must appear in the page text.',
  'allinurl:': 'All words must appear in the URL.',
  'related:': 'Find sites similar to a specified website.',
  'filetype:pdf': 'Search for PDF documents.',
  'filetype:doc': 'Search for Word documents.',
  'filetype:xls': 'Search for Excel spreadsheets.',
  'filetype:ppt': 'Search for PowerPoint presentations.',
  'filetype:txt': 'Search for plain text files.',
  'filetype:sql': 'Search for SQL database files.',
  'filetype:xml': 'Search for XML files.',
  'filetype:conf': 'Search for configuration files.',
  'filetype:log': 'Search for log files.',
  'index of': 'Find directory listings with browsable folders.',
  'cache:': 'View the cached version of a page.',
  'info:': 'Get information about a website.',
  'define:': 'Get definitions of a word.',
  'weather': 'Get weather information for a location.',
  'stocks': 'Get stock information.',
  '-': 'Exclude a word from results (NOT operator).'
};

// ===== Local Storage Management =====
function saveSearchHistory(query) {
  let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
  if (!history.includes(query)) {
    history.unshift(query);
    if (history.length > 20) history.pop();
    localStorage.setItem('searchHistory', JSON.stringify(history));
  }
}

function getSearchHistory() {
  return JSON.parse(localStorage.getItem('searchHistory')) || [];
}

function saveFavorite(query) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.includes(query)) {
    favorites.unshift(query);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert('✅ Added to favorites!');
  } else {
    alert('⚠️ Already in favorites!');
  }
}

function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites')) || [];
}

// ===== Custom Dorks Management =====
function getCustomDorks() {
  return JSON.parse(localStorage.getItem('customDorks')) || [];
}

function saveCustomDorks(dorks) {
  localStorage.setItem('customDorks', JSON.stringify(dorks));
  displayCustomDorks();
}

function openSaveDorkModal() {
  document.getElementById("saveDorkModal").style.display = "block";
  document.getElementById("customDorkOperator").value = "";
  document.getElementById("customDorkDesc").value = "";
  document.getElementById("customDorkOperator").focus();
}

function closeSaveDorkModal() {
  document.getElementById("saveDorkModal").style.display = "none";
}

function saveCustomDork() {
  const operator = document.getElementById("customDorkOperator").value.trim();
  const description = document.getElementById("customDorkDesc").value.trim();
  
  if (!operator) {
    alert('⚠️ Please enter a dork operator!');
    return;
  }
  
  if (!description) {
    alert('⚠️ Please enter a description!');
    return;
  }
  
  const customDorks = getCustomDorks();
  
  // Check if already exists
  if (customDorks.some(d => d.operator === operator)) {
    alert('⚠️ This dork operator already exists!');
    return;
  }
  
  customDorks.push({
    operator: operator,
    description: description
  });
  
  saveCustomDorks(customDorks);
  closeSaveDorkModal();
  alert('✅ Custom dork saved successfully!');
}

function displayCustomDorks() {
  const customDorks = getCustomDorks();
  const container = document.getElementById("customDorksContainer");
  const section = document.getElementById("customDorksSection");
  
  if (customDorks.length === 0) {
    section.style.display = "none";
    return;
  }
  
  section.style.display = "block";
  container.innerHTML = customDorks.map((dork, index) => `
    <div class="custom-dork-wrapper">
      <button type="button" class="custom-dork-btn" onclick="useCustomDorkByIndex(${index})">
        <strong>${dork.operator}</strong>
        <small>${dork.description}</small>
      </button>
      <button type="button" class="custom-dork-delete" onclick="removeCustomDork(${index});" title="Remove this dork">✕</button>
    </div>
  `).join('');
}

function useCustomDorkByIndex(index) {
  const customDorks = getCustomDorks();
  if (index >= 0 && index < customDorks.length) {
    useCustomDork(customDorks[index].operator);
  }
}

function useCustomDork(operator) {
  console.log('Using custom dork:', operator);
  const dorkTypeSelect = document.getElementById("dorkType");
  
  // Check if option exists, if not create it
  let option = Array.from(dorkTypeSelect.options).find(opt => opt.value === operator);
  if (!option) {
    option = document.createElement('option');
    option.value = operator;
    option.text = operator + ' (Custom)';
    dorkTypeSelect.appendChild(option);
  }
  
  dorkTypeSelect.value = operator;
  
  // Trigger change event to update the form
  const event = new Event('change', { bubbles: true });
  dorkTypeSelect.dispatchEvent(event);
  
  document.getElementById("keyword").value = "";
  updateDorkInfo();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => {
    document.getElementById("keyword").focus();
  }, 500);
}

function removeCustomDork(index) {
  if (confirm('⚠️ Remove this custom dork?')) {
    const customDorks = getCustomDorks();
    customDorks.splice(index, 1);
    saveCustomDorks(customDorks);
  }
}

// ===== Export Custom Dorks =====
function exportCustomDorks() {
  const customDorks = getCustomDorks();
  
  if (customDorks.length === 0) {
    alert('⚠️ No custom dorks to export!');
    return;
  }
  
  const dataStr = JSON.stringify(customDorks, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `SNB-CustomDorks-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  alert('✅ Custom dorks exported successfully!');
}

// ===== Import Custom Dorks =====
function importCustomDorks(event) {
  const file = event.target.files[0];
  
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedDorks = JSON.parse(e.target.result);
      
      // Validate the data
      if (!Array.isArray(importedDorks)) {
        alert('❌ Invalid file format! Expected an array of dorks.');
        return;
      }
      
      // Check if all items have operator and description
      const isValid = importedDorks.every(d => 
        d.operator && typeof d.operator === 'string' && 
        d.description && typeof d.description === 'string'
      );
      
      if (!isValid) {
        alert('❌ Invalid dork format! Each dork must have operator and description.');
        return;
      }
      
      const currentDorks = getCustomDorks();
      const mergedDorks = [...currentDorks];
      
      // Add imported dorks (avoid duplicates)
      importedDorks.forEach(importedDork => {
        if (!mergedDorks.some(d => d.operator === importedDork.operator)) {
          mergedDorks.push(importedDork);
        }
      });
      
      saveCustomDorks(mergedDorks);
      alert(`✅ Import successful! Added ${importedDorks.length} dork(s).`);
    } catch (error) {
      alert('❌ Error reading file: ' + error.message);
    }
  };
  
  reader.readAsText(file);
  
  // Reset file input
  event.target.value = '';
}

// ===== Main Search Function =====
function searchDork(event) {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  const searchEngine = document.getElementById("searchEngine").value;
  const dorkType = document.getElementById("dorkType").value;
  const keyword = document.getElementById("keyword").value;
  
  // Check if keyword already contains dork operators (from templates)
  const hasTemplateOperators = keyword.includes(':') || keyword.includes('-') || keyword.includes('OR') || keyword.includes('AND');
  
  // If template is used (has operators), use keyword as full query
  // Otherwise, combine dorkType + keyword
  let fullQuery;
  if (hasTemplateOperators && !dorkType) {
    fullQuery = keyword.trim();
  } else {
    fullQuery = `${dorkType.trim()}${keyword ? ' ' + keyword.trim() : ''}`;
  }
  
  if (!fullQuery || fullQuery.trim() === '') {
    alert('⚠️ Please enter a search query!');
    return;
  }
  
  saveSearchHistory(fullQuery);
  const encodedQuery = encodeURIComponent(fullQuery);
  
  // Search engine URLs
  const searchEngines = {
    google: `https://www.google.com/search?q=${encodedQuery}`,
    bing: `https://www.bing.com/search?q=${encodedQuery}`,
    duckduckgo: `https://duckduckgo.com/?q=${encodedQuery}`,
    brave: `https://search.brave.com/search?q=${encodedQuery}`,
    yahoo: `https://search.yahoo.com/search?p=${encodedQuery}`,
    yandex: `https://yandex.com/search/?text=${encodedQuery}`
  };
  
  const searchUrl = searchEngines[searchEngine] || searchEngines.google;
  window.open(searchUrl, "_blank");
}

// ===== Update Search Engine Selection =====
function updateSearchEngine() {
  localStorage.setItem('selectedEngine', document.getElementById("searchEngine").value);
}

// ===== Template Usage =====
function useTemplate(template) {
  document.getElementById("keyword").value = template;
  updateDorkInfo(); // Update the query display immediately
  document.getElementById("dorkForm").scrollIntoView({ behavior: 'smooth' });
}

// ===== Dork Info Update =====
function updateDorkInfo() {
  const dorkType = document.getElementById("dorkType").value;
  const keyword = document.getElementById("keyword").value;
  
  // Check if keyword already contains dork operators (from templates)
  const hasTemplateOperators = keyword.includes(':') || keyword.includes('-') || keyword.includes('OR') || keyword.includes('AND');
  
  // If template is used, display keyword as the query
  let fullQuery;
  if (hasTemplateOperators && !dorkType) {
    fullQuery = keyword.trim();
  } else {
    fullQuery = `${dorkType.trim()}${keyword ? ' ' + keyword.trim() : ''}`;
  }
  
  document.getElementById("currentQuery").textContent = fullQuery || 'No query yet';
  
  // Check if dorkType is a custom dork
  const customDorks = getCustomDorks();
  const customDork = customDorks.find(d => d.operator === dorkType);
  
  if (customDork) {
    document.getElementById("dorkDescription").textContent = customDork.description;
  } else {
    document.getElementById("dorkDescription").textContent = dorkDescriptions[dorkType] || 'Select a dork type to see description';
  }
}

// ===== Copy Query to Clipboard =====
function copyQuery() {
  const dorkType = document.getElementById("dorkType").value;
  const keyword = document.getElementById("keyword").value;
  
  // Check if keyword already contains dork operators (from templates)
  const hasTemplateOperators = keyword.includes(':') || keyword.includes('-') || keyword.includes('OR') || keyword.includes('AND');
  
  // If template is used, use keyword as full query
  let fullQuery;
  if (hasTemplateOperators && !dorkType) {
    fullQuery = keyword.trim();
  } else {
    fullQuery = `${dorkType.trim()}${keyword ? ' ' + keyword.trim() : ''}`;
  }
  
  if (!fullQuery || fullQuery.trim() === '') {
    alert('⚠️ Please complete the query first!');
    return;
  }
  
  navigator.clipboard.writeText(fullQuery).then(() => {
    alert('✅ Query copied to clipboard!');
  }).catch(() => {
    alert('❌ Failed to copy!');
  });
}

// ===== Add to Favorites =====
function addToFavorites() {
  const dorkType = document.getElementById("dorkType").value;
  const keyword = document.getElementById("keyword").value;
  
  // Check if keyword already contains dork operators (from templates)
  const hasTemplateOperators = keyword.includes(':') || keyword.includes('-') || keyword.includes('OR') || keyword.includes('AND');
  
  // If template is used, use keyword as full query
  let fullQuery;
  if (hasTemplateOperators && !dorkType) {
    fullQuery = keyword.trim();
  } else {
    fullQuery = `${dorkType.trim()}${keyword ? ' ' + keyword.trim() : ''}`;
  }
  
  if (!fullQuery || fullQuery.trim() === '') {
    alert('⚠️ Please complete the query first!');
    return;
  }
  
  saveFavorite(fullQuery);
}

// ===== History Modal =====
function openHistoryModal() {
  const modal = document.getElementById("historyModal");
  const historyList = document.getElementById("historyList");
  const history = getSearchHistory();
  
  if (history.length === 0) {
    historyList.innerHTML = '<div class="empty-message">No search history yet</div>';
  } else {
    historyList.innerHTML = history.map((item, index) => `
      <div class="search-item">
        <span>${item}</span>
        <button onclick="removeHistory(${index})">Delete</button>
      </div>
    `).join('');
  }
  
  modal.style.display = "block";
}

function closeHistoryModal() {
  document.getElementById("historyModal").style.display = "none";
}

function removeHistory(index) {
  let history = getSearchHistory();
  history.splice(index, 1);
  localStorage.setItem('searchHistory', JSON.stringify(history));
  openHistoryModal();
}

// ===== Favorites Modal =====
function openFavoritesModal() {
  const modal = document.getElementById("favoritesModal");
  const favoritesList = document.getElementById("favoritesList2");
  const favorites = getFavorites();
  
  if (favorites.length === 0) {
    favoritesList.innerHTML = '<div class="empty-message">No favorites yet</div>';
  } else {
    favoritesList.innerHTML = favorites.map((item, index) => `
      <div class="favorite-item">
        <span>${item}</span>
        <button onclick="removeFavorite(${index})">Delete</button>
      </div>
    `).join('');
  }
  
  modal.style.display = "block";
}

function closeFavoritesModal() {
  document.getElementById("favoritesModal").style.display = "none";
}

function removeFavorite(index) {
  let favorites = getFavorites();
  favorites.splice(index, 1);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  openFavoritesModal();
}

// ===== Dark Mode Toggle =====
function toggleDarkMode() {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

// ===== Clear All Data =====
function clearAllData() {
  if (confirm('⚠️ Are you sure? This will clear all history and favorites!')) {
    localStorage.removeItem('searchHistory');
    localStorage.removeItem('favorites');
    alert('✅ All data cleared!');
    closeHistoryModal();
    closeFavoritesModal();
  }
}

// ===== Refresh Form =====
function refreshForm() {
  document.getElementById("dorkType").value = "";
  document.getElementById("keyword").value = "";
  document.getElementById("currentQuery").textContent = "No query yet";
  document.getElementById("dorkDescription").textContent = "Select a dork type to see description";
  document.getElementById("dorkType").focus();
}

// ===== Initialization =====
window.onload = () => {
  // Load theme preference
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
  }
  
  // Load previously selected search engine
  const savedEngine = localStorage.getItem('selectedEngine') || 'google';
  document.getElementById("searchEngine").value = savedEngine;
  
  // Display custom dorks
  displayCustomDorks();
  
  // Add event listeners
  document.getElementById("dorkType").addEventListener("change", updateDorkInfo);
  document.getElementById("keyword").addEventListener("input", updateDorkInfo);
  
  // Close modals when clicking outside
  window.onclick = (event) => {
    const historyModal = document.getElementById("historyModal");
    const favoritesModal = document.getElementById("favoritesModal");
    const saveDorkModal = document.getElementById("saveDorkModal");
    
    if (event.target === historyModal) {
      historyModal.style.display = "none";
    }
    if (event.target === favoritesModal) {
      favoritesModal.style.display = "none";
    }
    if (event.target === saveDorkModal) {
      saveDorkModal.style.display = "none";
    }
  };
};

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + Enter to search
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    document.getElementById("dorkForm").dispatchEvent(new Event("submit"));
  }
  // Ctrl/Cmd + S to save favorite
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    addToFavorites();
  }
});
