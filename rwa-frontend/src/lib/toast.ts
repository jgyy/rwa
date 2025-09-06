type ToastType = 'success' | 'error' | 'warning' | 'info';

class Toast {
  private showToast(message: string, type: ToastType) {
    // For now, using console logs. In production, integrate with a toast library
    const styles = {
      success: 'color: green; font-weight: bold;',
      error: 'color: red; font-weight: bold;',
      warning: 'color: orange; font-weight: bold;',
      info: 'color: blue; font-weight: bold;',
    };

    console.log(`%c${type.toUpperCase()}: ${message}`, styles[type]);

    // This is where you'd integrate with a real toast library like react-hot-toast
    // Example: toast(message, { type });
  }

  success(message: string) {
    this.showToast(message, 'success');
  }

  error(message: string) {
    this.showToast(message, 'error');
  }

  warning(message: string) {
    this.showToast(message, 'warning');
  }

  info(message: string) {
    this.showToast(message, 'info');
  }
}

export const toast = new Toast();