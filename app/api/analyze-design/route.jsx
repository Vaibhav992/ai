import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { figmaData, prompt } = await request.json();
        
        // AI analysis of the Figma design
        const analysis = await performAIAnalysis(figmaData, prompt);
        
        return NextResponse.json({
            success: true,
            analysis: analysis,
            message: 'Design analysis completed successfully'
        });
        
    } catch (error) {
        console.error('Error analyzing design:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to analyze design'
        }, { status: 500 });
    }
}

async function performAIAnalysis(figmaData, prompt) {
    try {
        // For now, we'll use a sophisticated rule-based analysis
        // In production, you would integrate with OpenAI, Claude, or another AI service
        const analysis = {
            designStyle: analyzeDesignStyle(figmaData),
            colorScheme: analyzeColorScheme(figmaData),
            layoutType: analyzeLayoutType(figmaData),
            typography: analyzeTypography(figmaData),
            components: analyzeComponents(figmaData),
            userExperience: analyzeUserExperience(figmaData),
            technicalRequirements: analyzeTechnicalRequirements(figmaData),
            accessibility: analyzeAccessibility(figmaData),
            recommendations: generateRecommendations(figmaData),
            confidence: calculateConfidence(figmaData)
        };
        
        return analysis;
        
    } catch (error) {
        console.error('AI analysis error:', error);
        return getDefaultAnalysis();
    }
}

function analyzeDesignStyle(figmaData) {
    const frames = figmaData.frames || [];
    const colors = figmaData.styles?.colors || [];
    const typography = figmaData.styles?.typography || [];
    
    let style = 'modern';
    let confidence = 0.7;
    
    // Analyze color palette
    const colorCount = colors.length;
    if (colorCount <= 2) {
        style = 'minimal';
        confidence = 0.8;
    } else if (colorCount <= 4) {
        style = 'clean';
        confidence = 0.7;
    } else if (colorCount > 6) {
        style = 'complex';
        confidence = 0.6;
    }
    
    // Analyze typography
    const fontCount = typography.length;
    if (fontCount === 1) {
        style = 'minimal';
        confidence += 0.1;
    } else if (fontCount >= 3) {
        style = 'professional';
        confidence += 0.1;
    }
    
    // Analyze layout complexity
    const frameCount = frames.length;
    if (frameCount > 10) {
        style = 'complex';
        confidence += 0.1;
    } else if (frameCount <= 3) {
        style = 'simple';
        confidence += 0.1;
    }
    
    return {
        type: style,
        confidence: Math.min(confidence, 1.0),
        characteristics: getStyleCharacteristics(style)
    };
}

function getStyleCharacteristics(style) {
    const characteristics = {
        minimal: ['clean lines', 'lots of whitespace', 'simple color palette', 'focus on content'],
        modern: ['bold typography', 'gradient colors', 'rounded corners', 'card-based layout'],
        professional: ['structured layout', 'consistent spacing', 'corporate colors', 'clear hierarchy'],
        complex: ['multiple sections', 'rich interactions', 'diverse components', 'detailed styling']
    };
    
    return characteristics[style] || characteristics.modern;
}

function analyzeColorScheme(figmaData) {
    const colors = figmaData.styles?.colors || [];
    
    let scheme = 'balanced';
    let palette = [];
    let psychology = 'neutral';
    
    // Analyze color types
    colors.forEach(color => {
        if (color.paints && color.paints.length > 0) {
            const paint = color.paints[0];
            if (paint.type === 'SOLID') {
                const hex = rgbToHex(paint.color.r, paint.color.g, paint.color.b);
                palette.push({
                    hex: hex,
                    name: color.name,
                    type: getColorType(hex)
                });
            }
        }
    });
    
    // Determine scheme based on color count and types
    if (palette.length <= 2) {
        scheme = 'minimal';
        psychology = 'calm';
    } else if (palette.length <= 4) {
        scheme = 'balanced';
        psychology = 'professional';
    } else {
        scheme = 'complex';
        psychology = 'energetic';
    }
    
    return {
        type: scheme,
        palette: palette,
        psychology: psychology,
        accessibility: checkColorAccessibility(palette)
    };
}

function getColorType(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    if (r > 200 && g > 200 && b > 200) return 'light';
    if (r < 50 && g < 50 && b < 50) return 'dark';
    if (r > g && r > b) return 'warm';
    if (b > r && b > g) return 'cool';
    if (g > r && g > b) return 'natural';
    
    return 'neutral';
}

function checkColorAccessibility(palette) {
    const issues = [];
    
    // Check for sufficient contrast
    if (palette.length >= 2) {
        const lightColors = palette.filter(c => c.type === 'light');
        const darkColors = palette.filter(c => c.type === 'dark');
        
        if (lightColors.length === 0 || darkColors.length === 0) {
            issues.push('Insufficient contrast between light and dark colors');
        }
    }
    
    return {
        score: issues.length === 0 ? 'good' : 'needs-improvement',
        issues: issues
    };
}

function analyzeLayoutType(figmaData) {
    const frames = figmaData.frames || [];
    
    if (frames.length === 0) return { type: 'single-column', responsive: true };
    
    const mainFrame = frames[0];
    const aspectRatio = mainFrame.width / mainFrame.height;
    
    let layoutType = 'single-column';
    let responsive = true;
    let gridSystem = 'flexbox';
    
    // Analyze layout based on frame structure
    if (mainFrame.children && mainFrame.children.length > 0) {
        const children = mainFrame.children;
        
        // Check for grid-like structure
        const xPositions = children.map(child => child.x).sort((a, b) => a - b);
        const yPositions = children.map(child => child.y).sort((a, b) => a - b);
        
        if (xPositions.length > 1 && (xPositions[xPositions.length - 1] - xPositions[0]) > mainFrame.width * 0.3) {
            layoutType = 'multi-column';
            gridSystem = 'grid';
        }
        
        if (yPositions.length > 1 && (yPositions[yPositions.length - 1] - yPositions[0]) > mainFrame.height * 0.5) {
            layoutType = 'multi-section';
        }
    }
    
    // Determine if responsive based on aspect ratio
    if (aspectRatio > 2) {
        responsive = true;
        layoutType = 'landscape-responsive';
    }
    
    return {
        type: layoutType,
        responsive: responsive,
        gridSystem: gridSystem,
        breakpoints: {
            mobile: 768,
            tablet: 1024,
            desktop: 1440
        }
    };
}

function analyzeTypography(figmaData) {
    const typography = figmaData.styles?.typography || [];
    
    let hierarchy = 'simple';
    let readability = 'good';
    let fontFamily = 'system';
    
    if (typography.length === 0) {
        return {
            hierarchy: 'basic',
            readability: 'standard',
            fontFamily: 'system',
            recommendations: ['Use consistent font sizes', 'Implement proper line heights']
        };
    }
    
    // Analyze font hierarchy
    const fontSizes = typography.map(font => font.fontSize).filter(Boolean);
    const uniqueSizes = [...new Set(fontSizes)];
    
    if (uniqueSizes.length >= 4) {
        hierarchy = 'complex';
    } else if (uniqueSizes.length >= 2) {
        hierarchy = 'structured';
    }
    
    // Analyze font families
    const fontFamilies = typography.map(font => font.fontName?.family).filter(Boolean);
    const uniqueFamilies = [...new Set(fontFamilies)];
    
    if (uniqueFamilies.length > 2) {
        fontFamily = 'mixed';
    } else if (uniqueFamilies.length === 1) {
        fontFamily = uniqueFamilies[0];
    }
    
    // Check readability
    const hasGoodLineHeight = typography.some(font => font.lineHeight && font.lineHeight.value > 1.2);
    if (!hasGoodLineHeight) {
        readability = 'needs-improvement';
    }
    
    return {
        hierarchy: hierarchy,
        readability: readability,
        fontFamily: fontFamily,
        fontCount: uniqueFamilies.length,
        sizeCount: uniqueSizes.length,
        recommendations: generateTypographyRecommendations(hierarchy, readability, fontFamily)
    };
}

function generateTypographyRecommendations(hierarchy, readability, fontFamily) {
    const recommendations = [];
    
    if (hierarchy === 'basic') {
        recommendations.push('Implement clear typography hierarchy');
    }
    
    if (readability === 'needs-improvement') {
        recommendations.push('Improve line heights for better readability');
    }
    
    if (fontFamily === 'mixed') {
        recommendations.push('Consider using fewer font families for consistency');
    }
    
    return recommendations;
}

function analyzeComponents(figmaData) {
    const frames = figmaData.frames || [];
    const components = [];
    
    frames.forEach(frame => {
        if (frame.children) {
            frame.children.forEach(child => {
                if (child.type === 'COMPONENT' || child.type === 'INSTANCE') {
                    components.push({
                        name: child.name,
                        type: getComponentType(child.name),
                        purpose: getComponentPurpose(child.name)
                    });
                }
            });
        }
    });
    
    const uniqueComponents = components.reduce((acc, component) => {
        if (!acc.find(c => c.type === component.type)) {
            acc.push(component);
        }
        return acc;
    }, []);
    
    return {
        count: components.length,
        types: uniqueComponents.map(c => c.type),
        purposes: uniqueComponents.map(c => c.purpose),
        complexity: getComponentComplexity(components.length)
    };
}

function getComponentType(name) {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('button')) return 'button';
    if (lowerName.includes('card')) return 'card';
    if (lowerName.includes('input')) return 'input';
    if (lowerName.includes('nav')) return 'navigation';
    if (lowerName.includes('header')) return 'header';
    if (lowerName.includes('footer')) return 'footer';
    if (lowerName.includes('form')) return 'form';
    if (lowerName.includes('modal')) return 'modal';
    if (lowerName.includes('icon')) return 'icon';
    
    return 'content';
}

function getComponentPurpose(name) {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('button')) return 'interaction';
    if (lowerName.includes('input')) return 'user-input';
    if (lowerName.includes('nav')) return 'navigation';
    if (lowerName.includes('form')) return 'data-collection';
    if (lowerName.includes('card')) return 'content-display';
    
    return 'content';
}

function getComponentComplexity(count) {
    if (count <= 3) return 'simple';
    if (count <= 8) return 'moderate';
    return 'complex';
}

function analyzeUserExperience(figmaData) {
    const frames = figmaData.frames || [];
    
    let userJourney = 'linear';
    let interactionLevel = 'basic';
    let accessibility = 'standard';
    
    // Analyze user journey based on frame structure
    if (frames.length > 5) {
        userJourney = 'complex';
    } else if (frames.length > 2) {
        userJourney = 'multi-step';
    }
    
    // Analyze interaction level
    const hasForms = frames.some(frame => 
        frame.children && frame.children.some(child => 
            child.name.toLowerCase().includes('form') || 
            child.name.toLowerCase().includes('input')
        )
    );
    
    const hasButtons = frames.some(frame => 
        frame.children && frame.children.some(child => 
            child.name.toLowerCase().includes('button')
        )
    );
    
    if (hasForms && hasButtons) {
        interactionLevel = 'interactive';
    } else if (hasButtons) {
        interactionLevel = 'clickable';
    }
    
    return {
        userJourney: userJourney,
        interactionLevel: interactionLevel,
        accessibility: accessibility,
        recommendations: generateUXRecommendations(userJourney, interactionLevel)
    };
}

function generateUXRecommendations(userJourney, interactionLevel) {
    const recommendations = [];
    
    if (userJourney === 'complex') {
        recommendations.push('Consider simplifying the user journey');
    }
    
    if (interactionLevel === 'basic') {
        recommendations.push('Add interactive elements for better engagement');
    }
    
    return recommendations;
}

function analyzeTechnicalRequirements(figmaData) {
    const analysis = {
        html: 'semantic',
        css: 'modern',
        js: 'minimal',
        responsive: true,
        performance: 'optimized'
    };
    
    // Determine HTML requirements
    const hasForms = figmaData.frames?.some(frame => 
        frame.children?.some(child => 
            child.name.toLowerCase().includes('form')
        )
    );
    
    if (hasForms) {
        analysis.html = 'semantic-with-forms';
    }
    
    // Determine CSS requirements
    const colorCount = figmaData.styles?.colors?.length || 0;
    if (colorCount > 5) {
        analysis.css = 'advanced';
    }
    
    // Determine JS requirements
    const componentCount = figmaData.frames?.reduce((count, frame) => 
        count + (frame.children?.filter(child => 
            child.name.toLowerCase().includes('button') || 
            child.name.toLowerCase().includes('form')
        ).length || 0), 0
    ) || 0;
    
    if (componentCount > 3) {
        analysis.js = 'interactive';
    }
    
    return analysis;
}

function analyzeAccessibility(figmaData) {
    const issues = [];
    const recommendations = [];
    
    // Check color contrast
    const colors = figmaData.styles?.colors || [];
    if (colors.length < 2) {
        issues.push('Insufficient color contrast');
        recommendations.push('Add contrasting colors for better accessibility');
    }
    
    // Check typography
    const typography = figmaData.styles?.typography || [];
    const hasSmallFonts = typography.some(font => font.fontSize && font.fontSize < 12);
    if (hasSmallFonts) {
        issues.push('Font sizes may be too small');
        recommendations.push('Ensure minimum font size of 12px for readability');
    }
    
    // Check interactive elements
    const hasButtons = figmaData.frames?.some(frame => 
        frame.children?.some(child => 
            child.name.toLowerCase().includes('button')
        )
    );
    
    if (hasButtons) {
        recommendations.push('Add focus states for interactive elements');
        recommendations.push('Include ARIA labels for screen readers');
    }
    
    return {
        score: issues.length === 0 ? 'good' : 'needs-improvement',
        issues: issues,
        recommendations: recommendations
    };
}

function generateRecommendations(figmaData) {
    const recommendations = {
        html: ['Use semantic HTML5 elements', 'Implement proper heading hierarchy'],
        css: ['Use CSS Grid and Flexbox', 'Implement responsive design'],
        js: ['Add interactive features', 'Implement form validation'],
        responsive: ['Mobile-first approach', 'Use relative units'],
        accessibility: ['Include ARIA labels', 'Ensure color contrast'],
        performance: ['Optimize images', 'Minimize CSS and JS']
    };
    
    // Customize recommendations based on analysis
    const colorCount = figmaData.styles?.colors?.length || 0;
    if (colorCount > 5) {
        recommendations.css.push('Use CSS custom properties for color management');
    }
    
    const hasForms = figmaData.frames?.some(frame => 
        frame.children?.some(child => 
            child.name.toLowerCase().includes('form')
        )
    );
    
    if (hasForms) {
        recommendations.js.push('Implement form validation and submission');
        recommendations.html.push('Use proper form elements and labels');
    }
    
    return recommendations;
}

function calculateConfidence(figmaData) {
    let confidence = 0.5;
    
    // Increase confidence based on data quality
    if (figmaData.frames && figmaData.frames.length > 0) confidence += 0.2;
    if (figmaData.styles?.colors && figmaData.styles.colors.length > 0) confidence += 0.15;
    if (figmaData.styles?.typography && figmaData.styles.typography.length > 0) confidence += 0.15;
    
    return Math.min(confidence, 1.0);
}

function getDefaultAnalysis() {
    return {
        designStyle: { type: 'modern', confidence: 0.5, characteristics: ['clean', 'professional'] },
        colorScheme: { type: 'balanced', palette: [], psychology: 'neutral', accessibility: { score: 'good', issues: [] } },
        layoutType: { type: 'single-column', responsive: true, gridSystem: 'flexbox' },
        typography: { hierarchy: 'basic', readability: 'standard', fontFamily: 'system', recommendations: [] },
        components: { count: 0, types: [], purposes: [], complexity: 'simple' },
        userExperience: { userJourney: 'linear', interactionLevel: 'basic', accessibility: 'standard', recommendations: [] },
        technicalRequirements: { html: 'semantic', css: 'modern', js: 'minimal', responsive: true, performance: 'optimized' },
        accessibility: { score: 'good', issues: [], recommendations: [] },
        recommendations: {
            html: ['Use semantic HTML5 elements'],
            css: ['Use CSS Grid and Flexbox'],
            js: ['Add interactive features'],
            responsive: ['Mobile-first approach'],
            accessibility: ['Include ARIA labels'],
            performance: ['Optimize images']
        },
        confidence: 0.5
    };
}

function rgbToHex(r, g, b) {
    const toHex = (c) => {
        const hex = Math.round(c * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
} 