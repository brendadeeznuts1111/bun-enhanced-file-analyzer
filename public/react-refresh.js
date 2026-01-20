// React Fast Refresh polyfill for Bun
// This provides the missing $RefreshSig$ and $RefreshReg$ functions

// React Fast Refresh runtime
window.$RefreshReg$ = function(type, id) {
  // Register component for hot reloading
  if (typeof window !== 'undefined' && window.__DEVTOOLS__) {
    console.log('🔥 React Fast Refresh: Registered', type, id);
  }
};

window.$RefreshSig$ = function() {
  // Create a signature for component identity tracking
  return function(type) {
    return type;
  };
};

// HMR acceptance
if (typeof window !== 'undefined' && window.importMetaHot) {
  window.importMetaHot.accept();
}

console.log('🔥 React Fast Refresh polyfill loaded');
