const API_KEY = '42f0a951dc5e2b2e42e74739688355e8b2f8b4700f77e3cc39db91d74eeeae3ab3f62bad1a960be463f2173256ade946';
const API_URL = 'https://clipdrop-api.co/text-inpainting/v1';

export async function processImage(
  imageDataUrl: string,
  prompt: string,
  maskDataUrl?: string
): Promise<string> {
  try {
    // Convert base64 data URLs to Blobs
    const imageResponse = await fetch(imageDataUrl);
    const imageBlob = await imageResponse.blob();
    const imageFile = new File([imageBlob], 'image.jpg', { type: 'image/jpeg' });

    // Create form data
    const formData = new FormData();
    formData.append('image_file', imageFile);
    formData.append('text_prompt', prompt);

    // Add mask if provided
    if (maskDataUrl) {
      const maskResponse = await fetch(maskDataUrl);
      const maskBlob = await maskResponse.blob();
      
      // Create a canvas to invert the mask colors
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = maskDataUrl;
      });

      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        // Draw the original mask
        ctx.drawImage(img, 0, 0);
        
        // Invert the colors
        ctx.globalCompositeOperation = 'difference';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Convert the inverted mask to a file
      const invertedMaskBlob = await new Promise<Blob>((resolve) => 
        canvas.toBlob((blob) => resolve(blob!), 'image/png')
      );
      
      const maskFile = new File([invertedMaskBlob], 'mask.png', { type: 'image/png' });
      formData.append('mask_file', maskFile);
    }

    const apiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
      },
      body: formData,
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`API Error: ${apiResponse.status} - ${errorText}`);
    }

    const resultBlob = await apiResponse.blob();
    if (!resultBlob.size) {
      throw new Error('Received empty response from API');
    }

    return URL.createObjectURL(resultBlob);
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to process image');
  }
}