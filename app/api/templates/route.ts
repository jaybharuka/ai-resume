import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/templates
 * Returns list of available resume templates
 */
export async function GET(request: NextRequest) {
  try {
    // Template definitions
    // Add new templates here by adding objects to this array
    const templates = [
      // MODERN TEMPLATES
      {
        id: 'modern-1',
        name: 'Modern Professional',
        thumbnail: '/templates/modern-1.svg', // SVG placeholder - replace with .png for production
        description: 'Clean and modern design with bold headers',
        category: 'modern',
      },
      {
        id: 'modern-2',
        name: 'Tech Stack',
        thumbnail: '/templates/modern-2.svg',
        description: 'Perfect for software engineers with tech-focused layout',
        category: 'modern',
      },
      {
        id: 'modern-3',
        name: 'Creative Edge',
        thumbnail: '/templates/modern-3.svg',
        description: 'Stand out with vibrant colors and unique sections',
        category: 'modern',
      },

      // CLASSIC TEMPLATES
      {
        id: 'classic-1',
        name: 'Traditional',
        thumbnail: '/templates/classic-1.svg',
        description: 'Timeless design suitable for any industry',
        category: 'classic',
      },
      {
        id: 'classic-2',
        name: 'Corporate',
        thumbnail: '/templates/classic-2.svg',
        description: 'Professional layout for business roles',
        category: 'classic',
      },
      {
        id: 'classic-3',
        name: 'Executive',
        thumbnail: '/templates/classic-3.svg',
        description: 'Elegant design for senior positions',
        category: 'classic',
      },

      // MINIMAL TEMPLATES
      {
        id: 'minimal-1',
        name: 'Simple',
        thumbnail: '/templates/minimal-1.svg',
        description: 'Clean and distraction-free layout',
        category: 'minimal',
      },
      {
        id: 'minimal-2',
        name: 'Elegant',
        thumbnail: '/templates/minimal-2.svg',
        description: 'Sophisticated minimalism with subtle accents',
        category: 'minimal',
      },
      {
        id: 'minimal-3',
        name: 'Swiss Style',
        thumbnail: '/templates/minimal-3.svg',
        description: 'Grid-based design with perfect typography',
        category: 'minimal',
      },

      // CREATIVE TEMPLATES
      {
        id: 'creative-1',
        name: 'Designer',
        thumbnail: '/templates/creative-1.svg',
        description: 'Showcase your design skills with style',
        category: 'creative',
      },
      {
        id: 'creative-2',
        name: 'Artistic',
        thumbnail: '/templates/creative-2.svg',
        description: 'Bold and expressive for creative professionals',
        category: 'creative',
      },
      {
        id: 'creative-3',
        name: 'Portfolio',
        thumbnail: '/templates/creative-3.svg',
        description: 'Highlight projects with visual emphasis',
        category: 'creative',
      },
    ];

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('[Templates API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
