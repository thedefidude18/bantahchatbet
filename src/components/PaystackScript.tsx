import { useEffect } from 'react';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export const PaystackScript = () => {
  useEffect(() => {
    const loadScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (document.querySelector('script[src*="paystack.co/v1/inline.js"]')) {
          if (window.PaystackPop) {
            resolve();
          } else {
            const checkPaystack = setInterval(() => {
              if (window.PaystackPop) {
                clearInterval(checkPaystack);
                resolve();
              }
            }, 100);
          }
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        
        script.onload = () => {
          const checkPaystack = setInterval(() => {
            if (window.PaystackPop) {
              clearInterval(checkPaystack);
              resolve();
            }
          }, 100);
        };
        
        script.onerror = () => reject(new Error('Failed to load Paystack script'));
        document.head.appendChild(script);
      });
    };

    loadScript().catch(error => {
      console.error('Error loading Paystack script:', error);
    });

    return () => {
      // Don't remove the script on unmount as it might be needed by other components
    };
  }, []);

  return null;
};
