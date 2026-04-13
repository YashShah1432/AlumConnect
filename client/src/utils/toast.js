import { toast } from '../components/Toast';

// Use one consistent duration across the app (match your other popups)
const DEFAULT_TOAST_MS = 2000;

export const showSuccessToast = (message) => {
  toast(message, {
    type: 'success',
    autoClose: DEFAULT_TOAST_MS,
    pauseOnHover: true,
    closeOnClick: true,
    draggable: true,
  });
};

export const showErrorToast = (message) => {
  toast(message, {
    type: 'error',
    autoClose: DEFAULT_TOAST_MS,
    pauseOnHover: true,
    closeOnClick: true,
    draggable: true,
  });
};

export const showInfoToast = (message) => {
  toast(message, {
    type: 'info',
    autoClose: DEFAULT_TOAST_MS,
    pauseOnHover: true,
    closeOnClick: true,
    draggable: true,
  });
};