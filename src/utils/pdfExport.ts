/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ExportProgressCallback {
  (step: string, percent: number): void;
}

function oklchToRgb(L: number, C: number, H_deg: number, alpha = 1): string {
  const H = (H_deg * Math.PI) / 180;
  const a = C * Math.cos(H);
  const b = C * Math.sin(H);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const rLine = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLine = -1.2684380046 * l + 2.6093323201 * m - 0.3413133155 * s;
  const bLine = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  const gamma = (cVal: number) => {
    if (cVal <= 0.0031308) {
      return 12.92 * cVal;
    }
    return 1.055 * Math.pow(cVal, 1 / 2.4) - 0.055;
  };

  const rVal = Math.max(0, Math.min(255, Math.round(gamma(rLine) * 255)));
  const gVal = Math.max(0, Math.min(255, Math.round(gamma(gLine) * 255)));
  const bVal = Math.max(0, Math.min(255, Math.round(gamma(bLine) * 255)));

  if (alpha === 1) {
    return `rgb(${rVal}, ${gVal}, ${bVal})`;
  }
  return `rgba(${rVal}, ${gVal}, ${bVal}, ${alpha})`;
}

function replaceOklchWithRgb(cssText: string): string {
  const oklchRegex = /oklch\(\s*([\d.-]+%?)[,\s]+([\d.-]+)[,\s]+([\d.-]+)(?:\s*[,\/]\s*([\d.-]+%?))?\s*\)/gi;
  return cssText.replace(oklchRegex, (match, lStr, cStr, hStr, aStr) => {
    try {
      const L = lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
      const C = parseFloat(cStr);
      const H = parseFloat(hStr);
      let alpha = 1;

      if (aStr) {
        alpha = aStr.endsWith('%') ? parseFloat(aStr) / 100 : parseFloat(aStr);
      }

      if (isNaN(L) || isNaN(C) || isNaN(H)) {
        return match;
      }

      return oklchToRgb(L, C, H, alpha);
    } catch (e) {
      return match;
    }
  });
}

export async function exportToPdf(
  pageElements: HTMLElement[],
  customerName: string,
  onProgress?: ExportProgressCallback
): Promise<void> {
  if (pageElements.length === 0) {
    throw new Error("No elements found to export");
  }

  // Backups for cleanup
  const styleBackups: { el: HTMLStyleElement; text: string }[] = [];
  const disabledLinks: { el: HTMLLinkElement; disabled: boolean }[] = [];
  const tempStyleElements: HTMLStyleElement[] = [];
  const originalGetComputedStyle = window.getComputedStyle;

  try {
    if (onProgress) {
      onProgress("Preparing stylesheets...", 5);
    }

    // 1. Process inline styles and replace OKLCH
    const styleElements = Array.from(document.querySelectorAll('style'));
    for (const styleEl of styleElements) {
      const originalText = styleEl.textContent || '';
      if (originalText.toLowerCase().includes('oklch')) {
        styleBackups.push({ el: styleEl, text: originalText });
        styleEl.textContent = replaceOklchWithRgb(originalText);
      }
    }

    // 2. Process external stylesheets (links)
    const linkSheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
    for (const linkEl of linkSheets) {
      try {
        const sheet = linkEl.sheet;
        if (sheet) {
          let cssText = '';
          try {
            const rules = sheet.cssRules;
            for (let r = 0; r < rules.length; r++) {
              cssText += rules[r].cssText + '\n';
            }
          } catch (e) {
            // Silence cross-origin rule access errors
          }

          if (cssText) {
            disabledLinks.push({ el: linkEl, disabled: linkEl.disabled });
            linkEl.disabled = true;

            const tempStyle = document.createElement('style');
            tempStyle.textContent = replaceOklchWithRgb(cssText);
            document.head.appendChild(tempStyle);
            tempStyleElements.push(tempStyle);
          }
        }
      } catch (err) {
        console.warn("Error processing stylesheet link:", err);
      }
    }

    // 3. Mock window.getComputedStyle to return converted RGB strings
    window.getComputedStyle = function (elt: Element, pseudoElt?: string) {
      const style = originalGetComputedStyle.call(this, elt, pseudoElt);
      return new Proxy(style, {
        get(target, prop, receiver) {
          const val = Reflect.get(target, prop, receiver);
          if (typeof val === 'string' && val.toLowerCase().includes('oklch')) {
            return replaceOklchWithRgb(val);
          }
          if (prop === 'getPropertyValue') {
            return function(propertyName: string) {
              const val = target.getPropertyValue(propertyName);
              if (typeof val === 'string' && val.toLowerCase().includes('oklch')) {
                return replaceOklchWithRgb(val);
              }
              return val;
            };
          }
          return val;
        }
      });
    };

    // A4 dimensions at 72 dpi: 595.28 x 841.89 pt
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < pageElements.length; i++) {
      const element = pageElements[i];
      
      if (onProgress) {
        onProgress(`Rendering page ${i + 1} of ${pageElements.length}...`, Math.round(((i + 0.2) / pageElements.length) * 100));
      }

      // Wait a brief tick for render state to settle
      await new Promise(resolve => setTimeout(resolve, 150));

      // Capture the page node
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution renderer
        useCORS: true, // Allow cross-origin images
        logging: false,
        backgroundColor: '#ffffff'
      });

      if (onProgress) {
        onProgress(`Adding page ${i + 1} to document...`, Math.round(((i + 0.8) / pageElements.length) * 100));
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // If not first page, add a new page to the pdf
      if (i > 0) {
        pdf.addPage();
      }

      // Draw the full captured page image fitting the A4 PDF area
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    }

    if (onProgress) {
      onProgress("Saving PDF file...", 98);
    }

    const safeCustomerName = (customerName || 'Report').replace(/[^a-z0-9]/gi, '_');
    pdf.save(`Post_Visit_Report_${safeCustomerName}.pdf`);

    if (onProgress) {
      onProgress("Completed!", 100);
    }

  } finally {
    // 4. Cleanup and restore modified globals and styles
    window.getComputedStyle = originalGetComputedStyle;

    for (const backup of styleBackups) {
      backup.el.textContent = backup.text;
    }

    for (const item of disabledLinks) {
      item.el.disabled = item.disabled;
    }

    for (const tempEl of tempStyleElements) {
      tempEl.remove();
    }
  }
}
