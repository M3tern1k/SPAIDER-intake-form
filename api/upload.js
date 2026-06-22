import { handleUpload } from '@vercel/blob/client';

export default async function handler(request) {
  const body = await request.json();

  try {
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

    return Response.json(jsonResponse);
  } catch (error) {
    // Logged here so the real cause shows up in Vercel's function logs —
    // the @vercel/blob client SDK only shows a generic "Failed to retrieve
    // the client token" message in the browser regardless of the reason.
    console.error('Blob upload token error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
}
