import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, Download } from "lucide-react";
import html2canvas from 'html2canvas';

export function ScreenshotButton() {
  const [isCapturing, setIsCapturing] = useState(false);

  const captureScreenshot = async () => {
    setIsCapturing(true);
    
    try {
      // Get the main app container
      const element = document.getElementById('app-root') || document.body;
      
      // Configure html2canvas options
      const canvas = await html2canvas(element, {
        height: window.innerHeight,
        width: window.innerWidth,
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          // Create download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          
          // Generate filename with timestamp
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          link.download = `team-priority-tracker-${timestamp}.png`;
          
          // Trigger download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up
          URL.revokeObjectURL(url);
        }
      }, 'image/png', 0.9);
      
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      alert('Failed to capture screenshot. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={captureScreenshot}
      disabled={isCapturing}
      className="relative"
      title="Take screenshot"
      data-screenshot-ignore="true"
    >
      {isCapturing ? (
        <Download className="h-4 w-4 animate-pulse" />
      ) : (
        <Camera className="h-4 w-4" />
      )}
      <span className="sr-only">Take screenshot</span>
    </Button>
  );
}
