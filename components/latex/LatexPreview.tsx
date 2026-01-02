import React from 'react';
import PDFPreview from './PDFPreview';

interface LatexPreviewProps {
  pdfUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

export default function LatexPreview(props: LatexPreviewProps) {
  return <PDFPreview {...props} />;
}
