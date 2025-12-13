import React, { forwardRef } from 'react';
import { ResumeData } from '@/types/resume';
import { templates, TemplateName } from '@/components/templates';

interface PrintableResumeProps {
  data: ResumeData;
  templateName: TemplateName;
  colorAccent?: string;
}

const PrintableResume = forwardRef<HTMLDivElement, PrintableResumeProps>(
  ({ data, templateName, colorAccent = '#3b82f6' }, ref) => {
    // Use the same template component as the preview
    const TemplateComponent = templates[templateName] || templates['modern'];

    return (
      <div
        ref={ref}
        className="printable-resume"
        style={{
          width: '794px', // A4 width at 96dpi
          minHeight: '1123px', // A4 height at 96dpi
          backgroundColor: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '14px',
          lineHeight: '1.4',
          color: '#1f2937',
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
        }}
      >
        <style jsx>{`
          @media print {
            .printable-resume {
              margin: 0;
              padding: 1in;
              box-shadow: none;
              transform: none !important;
              zoom: 1 !important;
            }

            .printable-resume * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color-adjust: exact;
            }

            .printable-resume section {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .printable-resume h1, .printable-resume h2, .printable-resume h3 {
              break-after: avoid;
              page-break-after: avoid;
            }

            .printable-resume ul, .printable-resume ol {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .printable-resume li {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        `}</style>

        <TemplateComponent
          data={data}
          colorAccent={colorAccent}
          isEditing={false}
          onUpdate={() => {}} // No updates in print mode
        />
      </div>
    );
  }
);

PrintableResume.displayName = 'PrintableResume';

export default PrintableResume;