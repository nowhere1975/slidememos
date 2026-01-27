// Service Worker for Slidememos extension

// Configure side panel to open on action click
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('Failed to set panel behavior:', error))

// Set session storage access level for draft persistence
chrome.storage.session
  .setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' })
  .catch((error) => console.error('Failed to set session access level:', error))

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Initialize default settings on first install
    chrome.storage.sync.set({
      memos: [],
      settings: {
        quickSaveShortcut: 'Alt+S',
        theme: 'auto',
      },
    })
  }
})
