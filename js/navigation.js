/**
 * ABHIVANTA - Navigation & Global Shell Controller
 * Handles active route detection, mobile menu drawer, global search,
 * and badge synchronization.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure storage is initialized
  AbhivantaStorage.initStore();

  // Highlight active sidebar navigation
  const currentPath = window.location.pathname;
  const pageFilename = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
  
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === pageFilename || (pageFilename === '' && href === 'dashboard.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Sync open alerts counter badge on sidebar
  const alertBadge = document.getElementById('sidebar-alert-badge');
  if (alertBadge) {
    const alerts = AbhivantaStorage.getAlerts();
    const openCount = alerts.filter(a => a.status === 'Open').length;
    if (openCount > 0) {
      alertBadge.textContent = openCount;
      alertBadge.style.display = 'inline-flex';
    } else {
      alertBadge.style.display = 'none';
    }
  }

  // Mobile Menu Drawer
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-open');
    });
  }
  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', () => {
      document.body.classList.remove('sidebar-open');
    });
  }

  // Sidebar Collapse / Expand Toggle
  const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
  if (sidebarToggleBtn) {
    // Check saved preference
    const isCollapsed = localStorage.getItem('ABHIVANTA_SIDEBAR_COLLAPSED') === 'true';
    if (isCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    }

    sidebarToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-collapsed');
      const collapsedNow = document.body.classList.contains('sidebar-collapsed');
      localStorage.setItem('ABHIVANTA_SIDEBAR_COLLAPSED', collapsedNow);
      // Re-render chart sizes if needed
      window.dispatchEvent(new Event('resize'));
    });
  }

  // Global Quick Search (Ctrl/Cmd+K or '/')
  const topbarSearch = document.getElementById('topbar-search-input');
  window.addEventListener('keydown', (e) => {
    if ((e.key === '/' || (e.ctrlKey && e.key === 'k') || (e.metaKey && e.key === 'k')) && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (topbarSearch) {
        topbarSearch.focus();
        topbarSearch.select();
      }
    }
  });

  if (topbarSearch) {
    topbarSearch.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = topbarSearch.value.trim().toLowerCase();
        if (query) {
          window.location.href = `plants.html?search=${encodeURIComponent(query)}`;
        }
      }
    });
  }

  // Mobile Nav Drawer Toggle for Public Landing & Corporate Pages
  const mobileNavToggle = document.getElementById('mobile-nav-toggle');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const navToggleIcon = document.getElementById('nav-toggle-icon');

  if (mobileNavToggle && mobileNavDrawer) {
    mobileNavToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileNavDrawer.classList.toggle('open');
      if (navToggleIcon) {
        navToggleIcon.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
        AbhivantaUI.initIcons();
      }
    });

    mobileNavDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNavDrawer.classList.remove('open');
        if (navToggleIcon) {
          navToggleIcon.setAttribute('data-lucide', 'menu');
          AbhivantaUI.initIcons();
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (!mobileNavDrawer.contains(e.target) && !mobileNavToggle.contains(e.target)) {
        mobileNavDrawer.classList.remove('open');
        if (navToggleIcon) {
          navToggleIcon.setAttribute('data-lucide', 'menu');
          AbhivantaUI.initIcons();
        }
      }
    });
  }

  // Initialize Lucide icons on load
  AbhivantaUI.initIcons();

  // Initialize Global AI Copilot Floating Widget across SCADA platform
  if (window.AbhivantaAICopilot && document.querySelector('.app-layout')) {
    AbhivantaAICopilot.initGlobalWidget();
  }
});
