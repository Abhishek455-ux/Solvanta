/**
 * SOLVANTA - Reusable UI Components
 * Toast notifications, custom confirmation modals, dynamic dialogs,
 * badge helpers, and icon lifecycle hooks.
 */

const SolvantaUI = (() => {
  // Ensure toast container exists
  function getToastContainer() {
    let container = document.getElementById('solvanta-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'solvanta-toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  // Toast Notification
  function toast(message, type = 'info', title = null, duration = 4000) {
    const container = getToastContainer();
    const toastEl = document.createElement('div');
    toastEl.className = `toast toast-${type}`;

    const iconMap = {
      success: '<i data-lucide="check-circle-2" style="color:#10b981;"></i>',
      warning: '<i data-lucide="alert-triangle" style="color:#f59e0b;"></i>',
      danger:  '<i data-lucide="alert-octagon" style="color:#ef4444;"></i>',
      info:    '<i data-lucide="info" style="color:#0284c7;"></i>'
    };

    const defaultTitle = {
      success: 'Success',
      warning: 'Warning',
      danger:  'Error',
      info:    'Notice'
    };

    const displayTitle = title || defaultTitle[type] || 'Notice';

    toastEl.innerHTML = `
      <div class="toast-icon">${iconMap[type] || iconMap.info}</div>
      <div class="toast-content">
        <div class="toast-title">${SolvantaUtils.escapeHtml(displayTitle)}</div>
        <div class="toast-message">${SolvantaUtils.escapeHtml(message)}</div>
      </div>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

    container.appendChild(toastEl);
    initIcons();

    // Trigger animation
    requestAnimationFrame(() => {
      toastEl.classList.add('show');
    });

    const removeToast = () => {
      toastEl.classList.remove('show');
      setTimeout(() => {
        if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
      }, 300);
    };

    toastEl.querySelector('.toast-close').addEventListener('click', removeToast);
    if (duration > 0) {
      setTimeout(removeToast, duration);
    }
  }

  // Custom Modal
  function modal({ title, bodyHtml, footerButtons = [], size = '' }) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    const dialog = document.createElement('div');
    dialog.className = `modal-dialog ${size ? `modal-${size}` : ''}`;

    let footerHtml = '';
    if (footerButtons.length > 0) {
      footerHtml = `<div class="modal-footer"></div>`;
    }

    dialog.innerHTML = `
      <div class="modal-header">
        <h3>${SolvantaUtils.escapeHtml(title)}</h3>
        <button class="btn-icon modal-close-btn" aria-label="Close">
          <i data-lucide="x"></i>
        </button>
      </div>
      <div class="modal-body">
        ${bodyHtml}
      </div>
      ${footerHtml}
    `;

    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);
    initIcons();

    const closeModal = () => {
      backdrop.classList.remove('active');
      setTimeout(() => {
        if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
      }, 250);
    };

    backdrop.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });

    // Populate footer buttons
    if (footerButtons.length > 0) {
      const footerEl = dialog.querySelector('.modal-footer');
      footerButtons.forEach(btnConfig => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = btnConfig.className || 'btn btn-secondary';
        btn.textContent = btnConfig.text;
        btn.addEventListener('click', () => {
          if (btnConfig.onClick) {
            const shouldClose = btnConfig.onClick(closeModal);
            if (shouldClose !== false) closeModal();
          } else {
            closeModal();
          }
        });
        footerEl.appendChild(btn);
      });
    }

    // Show animation
    requestAnimationFrame(() => {
      backdrop.classList.add('active');
    });

    return { close: closeModal, dialogElement: dialog };
  }

  // Custom Confirm Dialog (Replaces native browser window.confirm)
  function confirm(title, message, onConfirm, confirmText = 'Confirm', isDestructive = false) {
    modal({
      title: title || 'Confirmation Required',
      bodyHtml: `
        <div style="display:flex; gap:16px; align-items:flex-start;">
          <div style="width:40px; height:40px; border-radius:8px; background:${isDestructive ? '#fee2e2' : '#ecfdf5'}; color:${isDestructive ? '#ef4444' : '#10b981'}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <i data-lucide="${isDestructive ? 'alert-triangle' : 'help-circle'}"></i>
          </div>
          <div>
            <p style="font-size:14px; color:#334155; line-height:1.5;">${SolvantaUtils.escapeHtml(message)}</p>
          </div>
        </div>
      `,
      footerButtons: [
        {
          text: 'Cancel',
          className: 'btn btn-secondary',
          onClick: (close) => close()
        },
        {
          text: confirmText,
          className: isDestructive ? 'btn btn-danger' : 'btn btn-primary',
          onClick: (close) => {
            if (typeof onConfirm === 'function') onConfirm();
            close();
          }
        }
      ]
    });
  }

  // Status Badge Markup Helper
  function getStatusBadge(status) {
    const s = String(status).toLowerCase();
    if (s === 'operational' || s === 'resolved' || s === 'completed') {
      return `<span class="badge badge-success"><span class="badge-dot"></span>${SolvantaUtils.escapeHtml(status)}</span>`;
    }
    if (s === 'degraded' || s === 'in progress' || s === 'medium' || s === 'acknowledged') {
      return `<span class="badge badge-warning"><span class="badge-dot"></span>${SolvantaUtils.escapeHtml(status)}</span>`;
    }
    if (s === 'offline' || s === 'critical' || s === 'high' || s === 'open') {
      return `<span class="badge badge-danger"><span class="badge-dot"></span>${SolvantaUtils.escapeHtml(status)}</span>`;
    }
    if (s === 'maintenance' || s === 'scheduled' || s === 'low' || s === 'inspection') {
      return `<span class="badge badge-info"><span class="badge-dot"></span>${SolvantaUtils.escapeHtml(status)}</span>`;
    }
    return `<span class="badge badge-neutral"><span class="badge-dot"></span>${SolvantaUtils.escapeHtml(status)}</span>`;
  }

  // Plant Type Badge
  function getTypeBadge(type) {
    const t = String(type).toLowerCase();
    if (t === 'solar') {
      return `<span class="badge badge-solar"><i data-lucide="sun" style="width:12px;height:12px;"></i> Solar</span>`;
    }
    if (t === 'wind') {
      return `<span class="badge badge-wind"><i data-lucide="wind" style="width:12px;height:12px;"></i> Wind</span>`;
    }
    return `<span class="badge badge-hybrid"><i data-lucide="zap" style="width:12px;height:12px;"></i> Hybrid</span>`;
  }

  // Initialize Lucide Icons safely
  function initIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  return {
    toast,
    modal,
    confirm,
    getStatusBadge,
    getTypeBadge,
    initIcons
  };
})();
