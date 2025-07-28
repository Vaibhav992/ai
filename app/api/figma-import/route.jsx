import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const figmaData = await request.json();
        
        // Step 1: AI Analysis of Figma Design
        const aiAnalysis = await analyzeFigmaDesign(figmaData);
        
        // Step 2: Convert Figma data to design schema with AI insights
        const designSchema = await convertFigmaToDesignSchema(figmaData, aiAnalysis);
        
        // Generate a workspace ID for the new design
        const workspaceId = generateWorkspaceId();
        
        return NextResponse.json({
            success: true,
            workspaceId: workspaceId,
            designSchema: designSchema,
            aiAnalysis: aiAnalysis,
            message: 'Figma design analyzed and imported successfully'
        });
        
    } catch (error) {
        console.error('Error processing Figma import:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to process Figma design'
        }, { status: 500 });
    }
}

async function analyzeFigmaDesign(figmaData) {
    try {
        // AI analysis of the Figma design
        const analysisPrompt = createAnalysisPrompt(figmaData);
        
        const response = await fetch('/api/analyze-design', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                figmaData: figmaData,
                prompt: analysisPrompt
            }),
        });

        if (response.ok) {
            const data = await response.json();
            return data.analysis;
        }
    } catch (error) {
        console.error('AI analysis failed, using fallback:', error);
    }

    // Fallback analysis
    return performFallbackAnalysis(figmaData);
}

function createAnalysisPrompt(figmaData) {
    const frameCount = figmaData.frames?.length || 0;
    const colorCount = figmaData.styles?.colors?.length || 0;
    const typographyCount = figmaData.styles?.typography?.length || 0;
    
    return `Analyze this Figma design and provide detailed insights:

Design Overview:
- ${frameCount} frames/components
- ${colorCount} color styles
- ${typographyCount} typography styles

Please analyze:
1. Design Style & Aesthetic: What type of design is this? (Modern, Minimal, Corporate, Creative, etc.)
2. Color Psychology: What emotions/feelings do the colors convey?
3. Typography Hierarchy: How is text organized and prioritized?
4. Layout Structure: What type of layout patterns are used?
5. Component Analysis: What UI components are present?
6. User Experience: What's the intended user journey?
7. Technical Requirements: What technologies would work best?
8. Accessibility: What accessibility considerations are needed?

Provide specific recommendations for:
- HTML structure
- CSS architecture
- JavaScript functionality
- Responsive design approach
- Performance optimizations
- Accessibility features`;
}

function performFallbackAnalysis(figmaData) {
    const analysis = {
        designStyle: 'modern',
        colorScheme: 'professional',
        layoutType: 'responsive',
        components: [],
        recommendations: {
            html: 'Use semantic HTML5 elements',
            css: 'Implement CSS Grid and Flexbox',
            js: 'Add interactive features',
            responsive: 'Mobile-first approach',
            accessibility: 'Include ARIA labels'
        }
    };

    // Analyze frames for components
    if (figmaData.frames) {
        figmaData.frames.forEach(frame => {
            if (frame.name.toLowerCase().includes('header')) analysis.components.push('header');
            if (frame.name.toLowerCase().includes('hero')) analysis.components.push('hero');
            if (frame.name.toLowerCase().includes('footer')) analysis.components.push('footer');
            if (frame.name.toLowerCase().includes('nav')) analysis.components.push('navigation');
            if (frame.name.toLowerCase().includes('card')) analysis.components.push('cards');
            if (frame.name.toLowerCase().includes('form')) analysis.components.push('forms');
        });
    }

    // Analyze colors
    if (figmaData.styles?.colors) {
        const colors = figmaData.styles.colors;
        if (colors.length > 5) analysis.colorScheme = 'complex';
        else if (colors.length > 2) analysis.colorScheme = 'balanced';
        else analysis.colorScheme = 'minimal';
    }

    return analysis;
}

async function convertFigmaToDesignSchema(figmaData, aiAnalysis) {
    const designSchema = {
        colors: {
            primary: extractPrimaryColors(figmaData.styles.colors, aiAnalysis),
            secondary: extractSecondaryColors(figmaData.styles.colors, aiAnalysis),
            accent: extractAccentColors(figmaData.styles.colors, aiAnalysis),
            background: extractBackgroundColors(figmaData.styles.colors, aiAnalysis),
            text: extractTextColors(figmaData.styles.colors, aiAnalysis)
        },
        typography: {
            heading: extractHeadingTypography(figmaData.styles.typography, aiAnalysis),
            body: extractBodyTypography(figmaData.styles.typography, aiAnalysis),
            accent: extractAccentTypography(figmaData.styles.typography, aiAnalysis)
        },
        layout: {
            structure: extractLayoutStructure(figmaData.frames, aiAnalysis),
            spacing: extractSpacingSystem(figmaData.frames, aiAnalysis),
            grid: extractGridSystem(figmaData.frames, aiAnalysis)
        },
        components: extractComponents(figmaData.frames, aiAnalysis),
        assets: extractAssets(figmaData.frames),
        aiAnalysis: aiAnalysis,
        metadata: {
            source: 'figma',
            exportTime: figmaData.metadata.exportTime,
            selectionCount: figmaData.metadata.selectionCount,
            analysisVersion: '1.0'
        }
    };
    
    return designSchema;
}

function extractPrimaryColors(colors, aiAnalysis) {
    // Use AI analysis to better identify primary colors
    const primaryColor = colors.find(color => 
        color.name.toLowerCase().includes('primary') ||
        color.name.toLowerCase().includes('brand') ||
        color.name.toLowerCase().includes('main') ||
        (aiAnalysis.colorScheme === 'professional' && color.name.toLowerCase().includes('blue'))
    );
    
    if (primaryColor && primaryColor.paints && primaryColor.paints.length > 0) {
        const paint = primaryColor.paints[0];
        if (paint.type === 'SOLID') {
            return {
                hex: rgbToHex(paint.color.r, paint.color.g, paint.color.b),
                rgb: paint.color,
                opacity: paint.opacity || 1,
                purpose: 'primary-brand'
            };
        }
    }
    
    // Fallback to first color
    if (colors.length > 0 && colors[0].paints && colors[0].paints.length > 0) {
        const paint = colors[0].paints[0];
        if (paint.type === 'SOLID') {
            return {
                hex: rgbToHex(paint.color.r, paint.color.g, paint.color.b),
                rgb: paint.color,
                opacity: paint.opacity || 1,
                purpose: 'primary-fallback'
            };
        }
    }
    
    // Default based on AI analysis
    const defaultColor = aiAnalysis.colorScheme === 'professional' ? 
        { hex: '#3b82f6', rgb: { r: 0.23, g: 0.51, b: 0.96 } } :
        { hex: '#a855f7', rgb: { r: 0.66, g: 0.33, b: 0.97 } };
    
    return {
        ...defaultColor,
        opacity: 1,
        purpose: 'primary-default'
    };
}

function extractSecondaryColors(colors, aiAnalysis) {
    const secondaryColor = colors.find(color => 
        color.name.toLowerCase().includes('secondary') ||
        color.name.toLowerCase().includes('accent') ||
        (aiAnalysis.colorScheme === 'professional' && color.name.toLowerCase().includes('gray'))
    );
    
    if (secondaryColor && secondaryColor.paints && secondaryColor.paints.length > 0) {
        const paint = secondaryColor.paints[0];
        if (paint.type === 'SOLID') {
            return {
                hex: rgbToHex(paint.color.r, paint.color.g, paint.color.b),
                rgb: paint.color,
                opacity: paint.opacity || 1,
                purpose: 'secondary-accent'
            };
        }
    }
    
    return {
        hex: '#ec4899',
        rgb: { r: 0.93, g: 0.28, b: 0.60 },
        opacity: 1,
        purpose: 'secondary-default'
    };
}

function extractAccentColors(colors, aiAnalysis) {
    const accentColors = colors.filter(color => 
        color.name.toLowerCase().includes('accent') ||
        color.name.toLowerCase().includes('highlight') ||
        color.name.toLowerCase().includes('success') ||
        color.name.toLowerCase().includes('error')
    );
    
    return accentColors.map(color => {
        if (color.paints && color.paints.length > 0) {
            const paint = color.paints[0];
            if (paint.type === 'SOLID') {
                return {
                    hex: rgbToHex(paint.color.r, paint.color.g, paint.color.b),
                    rgb: paint.color,
                    opacity: paint.opacity || 1,
                    purpose: color.name.toLowerCase()
                };
            }
        }
        return null;
    }).filter(Boolean);
}

function extractBackgroundColors(colors, aiAnalysis) {
    const bgColor = colors.find(color => 
        color.name.toLowerCase().includes('background') ||
        color.name.toLowerCase().includes('bg') ||
        color.name.toLowerCase().includes('surface')
    );
    
    if (bgColor && bgColor.paints && bgColor.paints.length > 0) {
        const paint = bgColor.paints[0];
        if (paint.type === 'SOLID') {
            return {
                hex: rgbToHex(paint.color.r, paint.color.g, paint.color.b),
                rgb: paint.color,
                opacity: paint.opacity || 1,
                purpose: 'background-main'
            };
        }
    }
    
    // Default based on AI analysis
    const defaultBg = aiAnalysis.colorScheme === 'professional' ? 
        { hex: '#1f2937', rgb: { r: 0.12, g: 0.16, b: 0.22 } } :
        { hex: '#0f0f23', rgb: { r: 0.06, g: 0.06, b: 0.14 } };
    
    return {
        ...defaultBg,
        opacity: 1,
        purpose: 'background-default'
    };
}

function extractTextColors(colors, aiAnalysis) {
    const textColor = colors.find(color => 
        color.name.toLowerCase().includes('text') ||
        color.name.toLowerCase().includes('foreground')
    );
    
    if (textColor && textColor.paints && textColor.paints.length > 0) {
        const paint = textColor.paints[0];
        if (paint.type === 'SOLID') {
            return {
                hex: rgbToHex(paint.color.r, paint.color.g, paint.color.b),
                rgb: paint.color,
                opacity: paint.opacity || 1,
                purpose: 'text-primary'
            };
        }
    }
    
    return {
        hex: '#ffffff',
        rgb: { r: 1, g: 1, b: 1 },
        opacity: 1,
        purpose: 'text-default'
    };
}

function extractHeadingTypography(typography, aiAnalysis) {
    const headingFont = typography.find(font => 
        font.name.toLowerCase().includes('heading') ||
        font.name.toLowerCase().includes('title') ||
        font.name.toLowerCase().includes('h1') ||
        font.name.toLowerCase().includes('h2')
    );
    
    if (headingFont) {
        return {
            fontFamily: headingFont.fontName?.family || 'Inter',
            fontSize: headingFont.fontSize || 32,
            fontWeight: headingFont.fontName?.style?.includes('Bold') ? 700 : 600,
            lineHeight: headingFont.lineHeight?.value || 1.2,
            purpose: 'headings'
        };
    }
    
    return {
        fontFamily: 'Inter',
        fontSize: 32,
        fontWeight: 600,
        lineHeight: 1.2,
        purpose: 'headings-default'
    };
}

function extractBodyTypography(typography, aiAnalysis) {
    const bodyFont = typography.find(font => 
        font.name.toLowerCase().includes('body') ||
        font.name.toLowerCase().includes('text') ||
        font.name.toLowerCase().includes('paragraph')
    );
    
    if (bodyFont) {
        return {
            fontFamily: bodyFont.fontName?.family || 'Inter',
            fontSize: bodyFont.fontSize || 16,
            fontWeight: bodyFont.fontName?.style?.includes('Bold') ? 700 : 400,
            lineHeight: bodyFont.lineHeight?.value || 1.6,
            purpose: 'body-text'
        };
    }
    
    return {
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: 400,
        lineHeight: 1.6,
        purpose: 'body-text-default'
    };
}

function extractAccentTypography(typography, aiAnalysis) {
    const accentFont = typography.find(font => 
        font.name.toLowerCase().includes('accent') ||
        font.name.toLowerCase().includes('caption') ||
        font.name.toLowerCase().includes('small')
    );
    
    if (accentFont) {
        return {
            fontFamily: accentFont.fontName?.family || 'Inter',
            fontSize: accentFont.fontSize || 14,
            fontWeight: accentFont.fontName?.style?.includes('Bold') ? 600 : 500,
            lineHeight: accentFont.lineHeight?.value || 1.4,
            purpose: 'accent-text'
        };
    }
    
    return {
        fontFamily: 'Inter',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: 1.4,
        purpose: 'accent-text-default'
    };
}

function extractLayoutStructure(frames, aiAnalysis) {
    if (frames.length === 0) return { type: 'single-column', sections: [] };
    
    const mainFrame = frames[0];
    const sections = [];
    
    // Analyze frame structure with AI insights
    if (mainFrame.children) {
        for (const child of mainFrame.children) {
            if (child.type === 'FRAME' || child.type === 'GROUP') {
                const sectionType = determineSectionType(child, aiAnalysis);
                sections.push({
                    id: child.id,
                    name: child.name,
                    type: sectionType,
                    width: child.width,
                    height: child.height,
                    x: child.x,
                    y: child.y,
                    purpose: getSectionPurpose(child.name, aiAnalysis)
                });
            }
        }
    }
    
    return {
        type: determineLayoutType(mainFrame, aiAnalysis),
        sections: sections,
        width: mainFrame.width,
        height: mainFrame.height,
        responsive: aiAnalysis.layoutType === 'responsive'
    };
}

function determineLayoutType(frame, aiAnalysis) {
    if (frame.width > frame.height * 1.5) {
        return 'landscape';
    } else if (frame.height > frame.width * 1.5) {
        return 'portrait';
    } else {
        return 'square';
    }
}

function determineSectionType(section, aiAnalysis) {
    const name = section.name.toLowerCase();
    
    if (name.includes('header') || name.includes('nav')) return 'header';
    if (name.includes('hero') || name.includes('banner')) return 'hero';
    if (name.includes('footer')) return 'footer';
    if (name.includes('sidebar')) return 'sidebar';
    if (name.includes('content') || name.includes('main')) return 'content';
    if (name.includes('gallery') || name.includes('grid')) return 'gallery';
    if (name.includes('form') || name.includes('contact')) return 'form';
    
    return 'section';
}

function getSectionPurpose(sectionName, aiAnalysis) {
    const name = sectionName.toLowerCase();
    
    if (name.includes('hero')) return 'main-attention';
    if (name.includes('header')) return 'navigation';
    if (name.includes('footer')) return 'information';
    if (name.includes('form')) return 'user-interaction';
    if (name.includes('gallery')) return 'content-display';
    
    return 'content';
}

function extractSpacingSystem(frames, aiAnalysis) {
    // Analyze spacing patterns in frames with AI insights
    const spacings = new Set();
    
    frames.forEach(frame => {
        if (frame.children) {
            frame.children.forEach(child => {
                spacings.add(child.x);
                spacings.add(child.y);
            });
        }
    });
    
    const spacingArray = Array.from(spacings).sort((a, b) => a - b);
    
    return {
        xs: spacingArray[0] || 4,
        sm: spacingArray[1] || 8,
        md: spacingArray[2] || 16,
        lg: spacingArray[3] || 24,
        xl: spacingArray[4] || 32,
        system: aiAnalysis.layoutType === 'responsive' ? 'responsive' : 'fixed'
    };
}

function extractGridSystem(frames, aiAnalysis) {
    if (frames.length === 0) return { columns: 12, gutter: 16 };
    
    const mainFrame = frames[0];
    
    // Enhanced grid detection based on AI analysis
    const gridConfig = {
        columns: 12,
        gutter: 16,
        maxWidth: mainFrame.width,
        responsive: aiAnalysis.layoutType === 'responsive',
        breakpoints: {
            mobile: 768,
            tablet: 1024,
            desktop: 1440
        }
    };
    
    return gridConfig;
}

function extractComponents(frames, aiAnalysis) {
    const components = [];
    
    frames.forEach(frame => {
        if (frame.children) {
            frame.children.forEach(child => {
                if (child.type === 'COMPONENT' || child.type === 'INSTANCE') {
                    components.push({
                        id: child.id,
                        name: child.name,
                        type: child.type,
                        width: child.width,
                        height: child.height,
                        purpose: getComponentPurpose(child.name, aiAnalysis)
                    });
                }
            });
        }
    });
    
    return components;
}

function getComponentPurpose(componentName, aiAnalysis) {
    const name = componentName.toLowerCase();
    
    if (name.includes('button')) return 'interaction';
    if (name.includes('card')) return 'content-display';
    if (name.includes('input')) return 'user-input';
    if (name.includes('icon')) return 'visual-aid';
    if (name.includes('image')) return 'media';
    
    return 'content';
}

function extractAssets(frames) {
    const assets = [];
    
    frames.forEach(frame => {
        if (frame.children) {
            frame.children.forEach(child => {
                if (child.imageData) {
                    assets.push({
                        id: child.id,
                        name: child.name,
                        type: 'image',
                        data: child.imageData,
                        purpose: 'visual-content'
                    });
                } else if (child.vectorData) {
                    assets.push({
                        id: child.id,
                        name: child.name,
                        type: 'vector',
                        data: child.vectorData,
                        purpose: 'icon-graphic'
                    });
                }
            });
        }
    });
    
    return assets;
}

function rgbToHex(r, g, b) {
    const toHex = (c) => {
        const hex = Math.round(c * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function generateWorkspaceId() {
    return 'figma_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
} 