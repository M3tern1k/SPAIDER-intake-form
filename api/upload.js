import { handleUpload } from '@vercel/blob/client';

export default async function handler(request, response) {
  try {
    const body = await request.json();

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // No auth required: this is a public intake form.
        // Adjust allowedContentTypes / size below if you want tighter control.
        return {
          allowedContentTypes: ['*/*'], // STEP/IGES/PDF/ZIP etc. don't have reliable MIME types
          addRandomSuffix: true,
          maximumSizeInBytes: 250 * 1024 * 1024, // 250MB per file, matches the client-side check
          tokenPayload: JSON.stringify({}),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Intake form file uploaded:', blob.url);
      },
    });

    return response.status(200).json(jsonResponse);
  } catch (error) {
    // Logged here so the real cause shows up in Vercel's function logs —
    // the @vercel/blob client SDK only shows a generic "Failed to retrieve
    // the client token" message in the browser regardless of the reason.
    console.error('Blob upload token error:', error);
    return response.status(400).json({ error: error.message || String(error) });
  }
}
