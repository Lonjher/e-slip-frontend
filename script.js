/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - Type of toast: 'info', 'success', 'error', 'warning'
 * @param {number} duration - Duration in milliseconds (default: 3000)
 * @param {string} title - Optional title for the toast
 * @returns {object} Toast object with methods to control it
 */
function showToast(message, type = "info", duration = 3000, title = null) {
  const container = document.getElementById("toastContainer");
  if (!container) {
    console.warn("Toast container not found");
    return null;
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");

  // Set icon based on type
  let icon = "";
  let defaultTitle = "";

  switch (type) {
    case "success":
      icon = `<i class="fas fa-check-circle"></i>`;
      defaultTitle = "Berhasil";
      break;
    case "error":
      icon = `<i class="fas fa-times-circle"></i>`;
      defaultTitle = "Error";
      break;
    case "warning":
      icon = `<i class="fas fa-exclamation-triangle"></i>`;
      defaultTitle = "Peringatan";
      break;
    case "info":
    default:
      icon = `<i class="fas fa-info-circle"></i>`;
      defaultTitle = "Informasi";
      break;
  }

  // Use provided title or default
  const toastTitle = title || defaultTitle;

  // Build toast HTML
  toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-title">${toastTitle}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" aria-label="Tutup notifikasi">
            <i class="fas fa-times"></i>
        </button>
        <div class="toast-progress">
            <div class="toast-progress-bar" style="animation-duration: ${duration}ms"></div>
        </div>
    `;

  // Add to container
  container.appendChild(toast);

  // Auto remove after duration
  let timeoutId;
  if (duration > 0) {
    timeoutId = setTimeout(() => {
      removeToast(toast);
    }, duration);
  }

  // Add click event to close button
  const closeBtn = toast.querySelector(".toast-close");
  closeBtn.addEventListener("click", () => {
    removeToast(toast);
    if (timeoutId) clearTimeout(timeoutId);
  });

  // Return toast object with control methods
  const toastObject = {
    element: toast,
    remove: () => removeToast(toast),
    update: (newMessage, newType) => updateToast(toast, newMessage, newType),
    extend: (extraTime) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => removeToast(toast), extraTime);

        // Reset progress bar animation
        const progressBar = toast.querySelector(".toast-progress-bar");
        if (progressBar) {
          progressBar.style.animation = "none";
          setTimeout(() => {
            progressBar.style.animation = `toast-progress linear forwards ${extraTime}ms`;
          }, 10);
        }
      }
    },
  };

  // Store reference for later control
  toast._toastObject = toastObject;

  return toastObject;
}

/**
 * Remove a toast with animation
 */
function removeToast(toast) {
  if (!toast || !toast.parentNode) return;

  toast.classList.add("hide");

  // Wait for animation to complete before removing
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }

    // Clean up any stored references
    if (toast._toastObject) {
      delete toast._toastObject;
    }
  }, 300);
}

/**
 * Update an existing toast
 */
function updateToast(toast, newMessage, newType = null) {
  if (!toast) return;

  const messageEl = toast.querySelector(".toast-message");
  if (messageEl && newMessage) {
    messageEl.textContent = newMessage;
  }

  if (newType) {
    // Remove old type classes
    toast.classList.remove("info", "success", "error", "warning");
    // Add new type
    toast.classList.add(newType);

    // Update icon
    const iconEl = toast.querySelector(".toast-icon");
    if (iconEl) {
      let newIcon = "";
      switch (newType) {
        case "success":
          newIcon = '<i class="fas fa-check-circle"></i>';
          break;
        case "error":
          newIcon = '<i class="fas fa-times-circle"></i>';
          break;
        case "warning":
          newIcon = '<i class="fas fa-exclamation-triangle"></i>';
          break;
        case "info":
        default:
          newIcon = '<i class="fas fa-info-circle"></i>';
          break;
      }
      iconEl.innerHTML = newIcon;
    }
  }
}

/**
 * Show a loading toast (requires manual removal)
 */
function showLoadingToast(message = "Memproses...", title = "Loading") {
  const toast = showToast(message, "info", 0, title);
  if (toast && toast.element) {
    toast.element.classList.add("loading");
    const icon = toast.element.querySelector(".toast-icon i");
    if (icon) {
      icon.className = "fas fa-spinner";
    }
  }
  return toast;
}

/**
 * Clear all toasts
 */
function clearAllToasts() {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toasts = container.querySelectorAll(".toast");
  toasts.forEach((toast) => {
    removeToast(toast);
  });
}

/**
 * Get count of active toasts
 */
function getToastCount() {
  const container = document.getElementById("toastContainer");
  if (!container) return 0;
  return container.querySelectorAll(".toast").length;
}

/**
 * Show a success toast with chaining support
 */
function showSuccess(message, duration = 3000) {
  return showToast(message, "success", duration);
}

/**
 * Show an error toast with chaining support
 */
function showError(message, duration = 4000) {
  return showToast(message, "error", duration);
}

/**
 * Show a warning toast with chaining support
 */
function showWarning(message, duration = 3500) {
  return showToast(message, "warning", duration);
}

/**
 * Show an info toast with chaining support
 */
function showInfo(message, duration = 3000) {
  return showToast(message, "info", duration);
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('button[title="Salin nomor rekening"]').forEach(button => {
    button.addEventListener('click', function() {
      const accountNumber = this.parentElement.querySelector('.font-mono').textContent;
      const cleanedNumber = accountNumber.replace(/\s/g, '');
      
      navigator.clipboard.writeText(cleanedNumber)
        .then(() => {
          const icon = this.querySelector('i');
          const originalClass = icon.className;
          icon.className = 'fas fa-check';
          
          setTimeout(() => {
            icon.className = originalClass;
          }, 2000);
        })
        .catch(err => {
          console.error('Gagal menyalin: ', err);
        });
    });
  });
});
