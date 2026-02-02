/**
 * Screenshot Service
 * Captures screenshots of HTML content for LLM vision input
 */

import html2canvas from 'html2canvas';

export interface ScreenshotResult {
  base64: string;
  mimeType: 'image/png' | 'image/jpeg';
  width: number;
  height: number;
  sizeBytes: number;
}

/**
 * Capture a screenshot of an iframe's content
 * Returns a base64-encoded image suitable for LLM vision APIs
 */
export async function captureIframeScreenshot(
  iframe: HTMLIFrameElement,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'png' | 'jpeg';
  }
): Promise<ScreenshotResult | null> {
  const { maxWidth = 1280, maxHeight = 800, quality = 0.8, format = 'jpeg' } = options || {};

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc || !iframeDoc.body) {
      console.error('[ScreenshotService] Cannot access iframe content');
      return null;
    }

    // Capture the iframe's body
    const canvas = await html2canvas(iframeDoc.body, {
      width: Math.min(iframeDoc.body.scrollWidth, maxWidth),
      height: Math.min(iframeDoc.body.scrollHeight, maxHeight),
      windowWidth: maxWidth,
      windowHeight: maxHeight,
      scale: 1,
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    // Convert to data URL
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = canvas.toDataURL(mimeType, quality);

    // Extract raw base64 for size calculation
    const rawBase64 = dataUrl.split(',')[1] || '';

    return {
      base64: dataUrl, // Return full data URL so media type can be detected
      mimeType,
      width: canvas.width,
      height: canvas.height,
      sizeBytes: Math.ceil(rawBase64.length * 0.75), // Approximate decoded size
    };
  } catch (error) {
    console.error('[ScreenshotService] Error capturing screenshot:', error);
    return null;
  }
}

/**
 * Capture a screenshot from HTML string by rendering in a hidden iframe
 */
export async function captureHtmlScreenshot(
  html: string,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'png' | 'jpeg';
  }
): Promise<ScreenshotResult | null> {
  const { maxWidth = 1280, maxHeight = 800, quality = 0.8, format = 'jpeg' } = options || {};

  return new Promise((resolve) => {
    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = `${maxWidth}px`;
    iframe.style.height = `${maxHeight}px`;
    iframe.style.border = 'none';
    
    document.body.appendChild(iframe);

    iframe.onload = async () => {
      // Wait a bit for content to render
      await new Promise(r => setTimeout(r, 500));

      try {
        const result = await captureIframeScreenshot(iframe, { maxWidth, maxHeight, quality, format });
        resolve(result);
      } catch (error) {
        console.error('[ScreenshotService] Error capturing HTML screenshot:', error);
        resolve(null);
      } finally {
        // Clean up
        document.body.removeChild(iframe);
      }
    };

    iframe.onerror = () => {
      document.body.removeChild(iframe);
      resolve(null);
    };

    // Write the HTML to the iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();
    } else {
      document.body.removeChild(iframe);
      resolve(null);
    }
  });
}

/**
 * Compress a screenshot if it's too large for LLM APIs
 * Most APIs accept up to 20MB, but smaller is faster
 * Accepts either raw base64 or full data URL, returns full data URL
 */
export async function compressScreenshot(
  input: string,
  targetSizeKB: number = 500
): Promise<string> {
  // Handle both raw base64 and data URL inputs
  const isDataUrl = input.startsWith('data:');
  const rawBase64 = isDataUrl ? (input.split(',')[1] || input) : input;
  const inputDataUrl = isDataUrl ? input : `data:image/jpeg;base64,${input}`;

  const currentSizeKB = Math.ceil(rawBase64.length * 0.75 / 1024);

  if (currentSizeKB <= targetSizeKB) {
    // Return as full data URL
    return inputDataUrl;
  }

  // Create an image from the input
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Calculate scale factor to reduce size
      const scaleFactor = Math.sqrt(targetSizeKB / currentSizeKB);
      const newWidth = Math.floor(img.width * scaleFactor);
      const newHeight = Math.floor(img.height * scaleFactor);

      // Draw to canvas at smaller size
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        // Return full data URL so media type is preserved
        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressed);
      } else {
        resolve(inputDataUrl);
      }
    };
    img.onerror = () => resolve(inputDataUrl);
    img.src = inputDataUrl;
  });
}
