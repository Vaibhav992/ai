import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { customizations, designSchema } = await request.json();
        
        // Use AI analysis to generate better code
        const aiAnalysis = designSchema.aiAnalysis || {};
        
        // Generate code based on AI insights
        const files = await generateCodeWithAIInsights(customizations, designSchema, aiAnalysis);
        
        return NextResponse.json({
            success: true,
            files: files,
            aiInsights: aiAnalysis,
            message: 'Code generated with AI analysis insights'
        });
        
    } catch (error) {
        console.error('Error generating code from design:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to generate code from design'
        }, { status: 500 });
    }
}

async function generateCodeWithAIInsights(customizations, designSchema, aiAnalysis) {
    const colors = customizations?.colors || designSchema.colors;
    const typography = customizations?.typography || designSchema.typography;
    const layout = customizations?.layout || designSchema.layout;
    
    // Apply AI insights to code generation
    const htmlCode = generateHTMLWithAI(designSchema, aiAnalysis);
    const cssCode = generateCSSWithAI(colors, typography, layout, aiAnalysis);
    const jsCode = generateJSWithAI(designSchema, aiAnalysis);
    const readmeCode = generateReadmeWithAI(designSchema, aiAnalysis);
    
    return {
        'index.html': htmlCode,
        'styles.css': cssCode,
        'script.js': jsCode,
        'README.md': readmeCode
    };
}

function generateHTMLWithAI(designSchema, aiAnalysis) {
    const layout = designSchema.layout?.structure;
    const components = designSchema.components || [];
    
    // Use AI analysis to determine HTML structure
    const isProfessional = aiAnalysis.designStyle?.type === 'professional';
    const hasForms = aiAnalysis.components?.types?.includes('form');
    const isResponsive = aiAnalysis.layoutType?.responsive;
    
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${getTitleFromAnalysis(aiAnalysis)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    ${isResponsive ? '<meta name="theme-color" content="#000000">' : ''}
</head>
<body>
    <div class="container">
        ${generateHeaderHTML(aiAnalysis)}
        ${generateMainContentHTML(layout, aiAnalysis)}
        ${generateFooterHTML(aiAnalysis)}
    </div>
    <script src="script.js"></script>
</body>
</html>`;
    
    return html;
}

function getTitleFromAnalysis(aiAnalysis) {
    const style = aiAnalysis.designStyle?.type || 'modern';
    const purpose = aiAnalysis.components?.purposes?.[0] || 'website';
    
    const titles = {
        'professional': 'Professional Business Website',
        'modern': 'Modern Web Application',
        'minimal': 'Clean & Minimal Design',
        'complex': 'Advanced Web Platform'
    };
    
    return titles[style] || 'AI-Generated Website';
}

function generateHeaderHTML(aiAnalysis) {
    const hasNavigation = aiAnalysis.components?.types?.includes('navigation');
    const isProfessional = aiAnalysis.designStyle?.type === 'professional';
    
    if (!hasNavigation) return '';
    
    return `
        <header class="header">
            <nav class="nav">
                <div class="nav-brand">
                    <h1 class="brand-title">${isProfessional ? 'Company Name' : 'Brand'}</h1>
                </div>
                <ul class="nav-menu">
                    <li><a href="#home" class="nav-link">Home</a></li>
                    <li><a href="#about" class="nav-link">About</a></li>
                    <li><a href="#services" class="nav-link">Services</a></li>
                    <li><a href="#contact" class="nav-link">Contact</a></li>
                </ul>
                <button class="nav-toggle" aria-label="Toggle navigation">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </nav>
        </header>`;
}

function generateMainContentHTML(layout, aiAnalysis) {
    const sections = layout?.sections || [];
    const isResponsive = aiAnalysis.layoutType?.responsive;
    const gridSystem = aiAnalysis.layoutType?.gridSystem || 'flexbox';
    
    let mainContent = '<main class="main-content">';
    
    sections.forEach(section => {
        const sectionClass = getSectionClass(section.type, aiAnalysis);
        const sectionContent = generateSectionContent(section, aiAnalysis);
        
        mainContent += `
            <section id="${section.name.toLowerCase()}" class="${sectionClass}">
                ${sectionContent}
            </section>`;
    });
    
    // Add default sections if none exist
    if (sections.length === 0) {
        mainContent += `
            <section id="hero" class="hero-section">
                <div class="hero-content">
                    <h1 class="hero-title">Welcome to Our Platform</h1>
                    <p class="hero-description">${getHeroDescription(aiAnalysis)}</p>
                    <button class="cta-button">Get Started</button>
                </div>
            </section>
            <section id="features" class="features-section">
                <h2 class="section-title">Features</h2>
                <div class="features-grid">
                    <div class="feature-card">
                        <h3>Feature 1</h3>
                        <p>Description of feature 1</p>
                    </div>
                    <div class="feature-card">
                        <h3>Feature 2</h3>
                        <p>Description of feature 2</p>
                    </div>
                    <div class="feature-card">
                        <h3>Feature 3</h3>
                        <p>Description of feature 3</p>
                    </div>
                </div>
            </section>`;
    }
    
    mainContent += '</main>';
    return mainContent;
}

function getSectionClass(sectionType, aiAnalysis) {
    const baseClass = `${sectionType}-section`;
    const isResponsive = aiAnalysis.layoutType?.responsive;
    const gridSystem = aiAnalysis.layoutType?.gridSystem;
    
    let classes = [baseClass];
    
    if (isResponsive) {
        classes.push('responsive');
    }
    
    if (gridSystem === 'grid') {
        classes.push('grid-layout');
    }
    
    return classes.join(' ');
}

function generateSectionContent(section, aiAnalysis) {
    const purpose = section.purpose || 'content';
    
    switch (purpose) {
        case 'main-attention':
            return `
                <div class="hero-content">
                    <h1 class="hero-title">${getHeroTitle(aiAnalysis)}</h1>
                    <p class="hero-description">${getHeroDescription(aiAnalysis)}</p>
                    <button class="cta-button">Get Started</button>
                </div>`;
        case 'navigation':
            return `
                <div class="nav-content">
                    <h2 class="section-title">Navigation</h2>
                    <nav class="section-nav">
                        <a href="#home">Home</a>
                        <a href="#about">About</a>
                        <a href="#contact">Contact</a>
                    </nav>
                </div>`;
        case 'user-interaction':
            return `
                <div class="form-content">
                    <h2 class="section-title">Contact Us</h2>
                    <form class="contact-form">
                        <input type="text" placeholder="Name" required>
                        <input type="email" placeholder="Email" required>
                        <textarea placeholder="Message" required></textarea>
                        <button type="submit">Send Message</button>
                    </form>
                </div>`;
        default:
            return `
                <div class="content-wrapper">
                    <h2 class="section-title">${section.name}</h2>
                    <p class="section-description">Content for ${section.name} section</p>
                </div>`;
    }
}

function getHeroTitle(aiAnalysis) {
    const style = aiAnalysis.designStyle?.type || 'modern';
    
    const titles = {
        'professional': 'Professional Solutions for Your Business',
        'modern': 'Build the Future with Modern Technology',
        'minimal': 'Simple. Clean. Effective.',
        'complex': 'Advanced Platform for Complex Needs'
    };
    
    return titles[style] || 'Welcome to Our Platform';
}

function getHeroDescription(aiAnalysis) {
    const style = aiAnalysis.designStyle?.type || 'modern';
    
    const descriptions = {
        'professional': 'We provide comprehensive business solutions tailored to your needs.',
        'modern': 'Leverage cutting-edge technology to transform your ideas into reality.',
        'minimal': 'Focus on what matters most with our streamlined approach.',
        'complex': 'Handle complex workflows with our advanced platform features.'
    };
    
    return descriptions[style] || 'Discover amazing possibilities with our platform.';
}

function generateFooterHTML(aiAnalysis) {
    const isProfessional = aiAnalysis.designStyle?.type === 'professional';
    
    return `
        <footer class="footer">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>${isProfessional ? 'Company Name' : 'Brand'}</h3>
                    <p>${isProfessional ? 'Professional solutions for modern businesses.' : 'Building amazing experiences.'}</p>
                </div>
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="#home">Home</a></li>
                        <li><a href="#about">About</a></li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Contact</h4>
                    <p>Email: info@example.com</p>
                    <p>Phone: +1 (555) 123-4567</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 ${isProfessional ? 'Company Name' : 'Brand'}. All rights reserved.</p>
            </div>
        </footer>`;
}

function generateCSSWithAI(colors, typography, layout, aiAnalysis) {
    const isResponsive = aiAnalysis.layoutType?.responsive;
    const gridSystem = aiAnalysis.layoutType?.gridSystem || 'flexbox';
    const colorScheme = aiAnalysis.colorScheme?.type || 'balanced';
    const designStyle = aiAnalysis.designStyle?.type || 'modern';
    
    return `/* AI-Generated CSS with ${designStyle} design principles */
:root {
    /* Color Variables */
    --primary-color: ${colors.primary?.hex || '#3b82f6'};
    --secondary-color: ${colors.secondary?.hex || '#ec4899'};
    --background-color: ${colors.background?.hex || '#1f2937'};
    --text-color: ${colors.text?.hex || '#ffffff'};
    --accent-color: ${colors.accent?.[0]?.hex || '#10b981'};
    
    /* Typography Variables */
    --font-family-heading: '${typography.heading?.fontFamily || 'Inter'}', sans-serif;
    --font-family-body: '${typography.body?.fontFamily || 'Inter'}', sans-serif;
    --font-size-heading: ${typography.heading?.fontSize || 32}px;
    --font-size-body: ${typography.body?.fontSize || 16}px;
    --font-size-accent: ${typography.accent?.fontSize || 14}px;
    
    /* Spacing Variables */
    --spacing-xs: ${layout.spacing?.xs || 4}px;
    --spacing-sm: ${layout.spacing?.sm || 8}px;
    --spacing-md: ${layout.spacing?.md || 16}px;
    --spacing-lg: ${layout.spacing?.lg || 24}px;
    --spacing-xl: ${layout.spacing?.xl || 32}px;
    
    /* Layout Variables */
    --max-width: ${layout.grid?.maxWidth || 1200}px;
    --border-radius: ${designStyle === 'modern' ? '12px' : '4px'};
    --transition: all 0.3s ease;
}

/* Reset and Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: var(--font-family-body);
    font-size: var(--font-size-body);
    line-height: ${typography.body?.lineHeight || 1.6};
    color: var(--text-color);
    background-color: var(--background-color);
    ${isResponsive ? 'overflow-x: hidden;' : ''}
}

/* Container */
.container {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0 var(--spacing-md);
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-family-heading);
    font-weight: ${typography.heading?.fontWeight || 600};
    line-height: ${typography.heading?.lineHeight || 1.2};
    margin-bottom: var(--spacing-md);
}

h1 { font-size: var(--font-size-heading); }
h2 { font-size: calc(var(--font-size-heading) * 0.75); }
h3 { font-size: calc(var(--font-size-heading) * 0.6); }

p {
    margin-bottom: var(--spacing-md);
    line-height: ${typography.body?.lineHeight || 1.6};
}

/* Header Styles */
.header {
    background: ${designStyle === 'modern' ? 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' : 'var(--background-color)'};
    padding: var(--spacing-md) 0;
    position: sticky;
    top: 0;
    z-index: 1000;
    ${designStyle === 'modern' ? 'box-shadow: 0 4px 20px rgba(0,0,0,0.1);' : 'border-bottom: 1px solid rgba(255,255,255,0.1);'}
}

.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    ${gridSystem === 'grid' ? 'grid-template-columns: auto 1fr auto;' : ''}
}

.nav-brand .brand-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-color);
    margin: 0;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: var(--spacing-lg);
}

.nav-link {
    color: var(--text-color);
    text-decoration: none;
    font-weight: 500;
    transition: var(--transition);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius);
}

.nav-link:hover {
    background: rgba(255,255,255,0.1);
    transform: translateY(-2px);
}

/* Main Content */
.main-content {
    min-height: 80vh;
    padding: var(--spacing-xl) 0;
}

/* Section Styles */
.hero-section {
    text-align: center;
    padding: var(--spacing-xl) 0;
    ${designStyle === 'modern' ? 'background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(236,72,153,0.1));' : ''}
}

.hero-title {
    font-size: 3rem;
    margin-bottom: var(--spacing-lg);
    ${designStyle === 'modern' ? 'background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;' : ''}
}

.hero-description {
    font-size: 1.2rem;
    max-width: 600px;
    margin: 0 auto var(--spacing-xl);
    opacity: 0.9;
}

/* Button Styles */
.cta-button {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    border: none;
    padding: var(--spacing-md) var(--spacing-xl);
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: var(--transition);
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
}

/* Features Section */
.features-section {
    padding: var(--spacing-xl) 0;
}

.section-title {
    text-align: center;
    margin-bottom: var(--spacing-xl);
    font-size: 2.5rem;
}

.features-grid {
    display: ${gridSystem === 'grid' ? 'grid' : 'flex'};
    ${gridSystem === 'grid' ? 'grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));' : 'flex-wrap: wrap; justify-content: center;'}
    gap: var(--spacing-lg);
}

.feature-card {
    background: rgba(255,255,255,0.05);
    padding: var(--spacing-lg);
    border-radius: var(--border-radius);
    border: 1px solid rgba(255,255,255,0.1);
    transition: var(--transition);
    ${gridSystem === 'flexbox' ? 'flex: 1; min-width: 300px; max-width: 400px;' : ''}
}

.feature-card:hover {
    transform: translateY(-5px);
    background: rgba(255,255,255,0.1);
    border-color: var(--primary-color);
}

/* Form Styles */
.contact-form {
    max-width: 500px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.contact-form input,
.contact-form textarea {
    padding: var(--spacing-md);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: var(--border-radius);
    background: rgba(255,255,255,0.05);
    color: var(--text-color);
    font-family: var(--font-family-body);
}

.contact-form input:focus,
.contact-form textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}

.contact-form button {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: var(--spacing-md);
    border-radius: var(--border-radius);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
}

.contact-form button:hover {
    background: var(--secondary-color);
    transform: translateY(-2px);
}

/* Footer */
.footer {
    background: rgba(0,0,0,0.3);
    padding: var(--spacing-xl) 0 var(--spacing-md);
    margin-top: var(--spacing-xl);
}

.footer-content {
    display: ${gridSystem === 'grid' ? 'grid' : 'flex'};
    ${gridSystem === 'grid' ? 'grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));' : 'flex-wrap: wrap; justify-content: space-between;'}
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
}

.footer-section h3,
.footer-section h4 {
    margin-bottom: var(--spacing-md);
    color: var(--primary-color);
}

.footer-section ul {
    list-style: none;
}

.footer-section ul li {
    margin-bottom: var(--spacing-sm);
}

.footer-section ul li a {
    color: var(--text-color);
    text-decoration: none;
    opacity: 0.8;
    transition: var(--transition);
}

.footer-section ul li a:hover {
    opacity: 1;
    color: var(--primary-color);
}

.footer-bottom {
    text-align: center;
    padding-top: var(--spacing-md);
    border-top: 1px solid rgba(255,255,255,0.1);
    opacity: 0.7;
}

/* Responsive Design */
${isResponsive ? `
@media (max-width: 768px) {
    .nav-menu {
        display: none;
    }
    
    .nav-toggle {
        display: block;
    }
    
    .hero-title {
        font-size: 2rem;
    }
    
    .features-grid {
        grid-template-columns: 1fr;
    }
    
    .footer-content {
        grid-template-columns: 1fr;
        text-align: center;
    }
}

@media (max-width: 480px) {
    .container {
        padding: 0 var(--spacing-sm);
    }
    
    .hero-title {
        font-size: 1.5rem;
    }
    
    .cta-button {
        padding: var(--spacing-sm) var(--spacing-lg);
        font-size: 1rem;
    }
}
` : ''}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

/* Focus styles for accessibility */
button:focus,
input:focus,
textarea:focus,
a:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
    :root {
        --primary-color: #ffffff;
        --text-color: #000000;
        --background-color: #ffffff;
    }
}`;
}

function generateJSWithAI(designSchema, aiAnalysis) {
    const hasForms = aiAnalysis.components?.types?.includes('form');
    const interactionLevel = aiAnalysis.userExperience?.interactionLevel || 'basic';
    const isResponsive = aiAnalysis.layoutType?.responsive;
    
    return `// AI-Generated JavaScript with ${aiAnalysis.designStyle?.type || 'modern'} interactions

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    ${isResponsive ? 'initializeMobileNavigation();' : ''}
    ${hasForms ? 'initializeFormHandling();' : ''}
    ${interactionLevel !== 'basic' ? 'initializeInteractiveElements();' : ''}
    initializeSmoothScrolling();
    initializeAnimations();
}

${isResponsive ? `
// Mobile Navigation
function initializeMobileNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }
}
` : ''}

${hasForms ? `
// Form Handling
function initializeFormHandling() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmission(form);
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(input);
            });
        });
    });
}

function handleFormSubmission(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
        showNotification('Message sent successfully!', 'success');
        form.reset();
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }, 2000);
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing error styling
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Validation rules
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    } else if (field.type === 'email' && value && !isValidEmail(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
    }
    
    // Show error if invalid
    if (!isValid) {
        field.classList.add('error');
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = errorMessage;
        field.parentNode.appendChild(errorElement);
    }
    
    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return emailRegex.test(email);
}
` : ''}

${interactionLevel !== 'basic' ? `
// Interactive Elements
function initializeInteractiveElements() {
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .hero-content, .section-title');
    animateElements.forEach(el => observer.observe(el));
    
    // Parallax effect for hero section
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroSection.style.transform = \`translateY(\${rate}px)\`;
        });
    }
}
` : ''}

// Smooth Scrolling
function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Animations
function initializeAnimations() {
    // Add CSS classes for animations
    const style = document.createElement('style');
    style.textContent = \`
        .animate-in {
            animation: fadeInUp 0.6s ease-out forwards;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .feature-card {
            opacity: 0;
            transform: translateY(30px);
        }
        
        .feature-card.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
    \`;
    document.head.appendChild(style);
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = \`notification notification-\${type}\`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = \`
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        background: \${type === 'success' ? '#10b981' : '#3b82f6'};
    \`;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize scroll events
const optimizedScrollHandler = debounce(function() {
    // Handle scroll-based animations
}, 16);

window.addEventListener('scroll', optimizedScrollHandler);`;
}

function generateReadmeWithAI(designSchema, aiAnalysis) {
    const designStyle = aiAnalysis.designStyle?.type || 'modern';
    const colorScheme = aiAnalysis.colorScheme?.type || 'balanced';
    const layoutType = aiAnalysis.layoutType?.type || 'single-column';
    const components = aiAnalysis.components?.types || [];
    
    return `# AI-Generated Website

This website was generated using AI analysis of a Figma design with the following characteristics:

## Design Analysis

- **Design Style**: ${designStyle}
- **Color Scheme**: ${colorScheme}
- **Layout Type**: ${layoutType}
- **Components**: ${components.join(', ') || 'Standard components'}

## Features

${generateFeatureList(aiAnalysis)}

## Technical Stack

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript**: Interactive features and form handling
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliant with ARIA labels

## File Structure

\`\`\`
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality
└── README.md           # This file
\`\`\`

## Setup Instructions

1. Download all files to a local directory
2. Open \`index.html\` in a web browser
3. The website should display correctly with all features working

## Customization

### Colors
The website uses CSS custom properties for easy color customization:

\`\`\`css
:root {
    --primary-color: #3b82f6;
    --secondary-color: #ec4899;
    --background-color: #1f2937;
    --text-color: #ffffff;
}
\`\`\`

### Typography
Font families and sizes can be adjusted in the CSS variables:

\`\`\`css
:root {
    --font-family-heading: 'Inter', sans-serif;
    --font-family-body: 'Inter', sans-serif;
    --font-size-heading: 32px;
    --font-size-body: 16px;
}
\`\`\`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Optimized for fast loading
- Minimal JavaScript footprint
- Efficient CSS with modern techniques
- Responsive images and assets

## Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- High contrast mode support
- Screen reader compatible

## AI Insights

This website was generated based on AI analysis that identified:

${generateAIInsights(aiAnalysis)}

## License

This project is generated code and can be freely used and modified.

---

*Generated by Vaibhav AI Website Builder with AI-powered design analysis*`;
}

function generateFeatureList(aiAnalysis) {
    const features = [];
    
    if (aiAnalysis.layoutType?.responsive) {
        features.push('- **Responsive Design**: Works perfectly on all devices');
    }
    
    if (aiAnalysis.components?.types?.includes('form')) {
        features.push('- **Contact Forms**: Interactive forms with validation');
    }
    
    if (aiAnalysis.components?.types?.includes('navigation')) {
        features.push('- **Navigation**: Smooth scrolling navigation menu');
    }
    
    if (aiAnalysis.userExperience?.interactionLevel !== 'basic') {
        features.push('- **Interactive Elements**: Hover effects and animations');
    }
    
    features.push('- **Modern Styling**: Clean and professional appearance');
    features.push('- **Fast Loading**: Optimized for performance');
    features.push('- **Accessibility**: WCAG compliant design');
    
    return features.join('\n');
}

function generateAIInsights(aiAnalysis) {
    const insights = [];
    
    if (aiAnalysis.designStyle) {
        insights.push(`- **Design Style**: ${aiAnalysis.designStyle.type} with ${aiAnalysis.designStyle.confidence * 100}% confidence`);
    }
    
    if (aiAnalysis.colorScheme) {
        insights.push(`- **Color Psychology**: ${aiAnalysis.colorScheme.psychology} color scheme`);
    }
    
    if (aiAnalysis.typography) {
        insights.push(`- **Typography**: ${aiAnalysis.typography.hierarchy} hierarchy with ${aiAnalysis.typography.fontCount} font families`);
    }
    
    if (aiAnalysis.accessibility) {
        insights.push(`- **Accessibility Score**: ${aiAnalysis.accessibility.score}`);
    }
    
    if (aiAnalysis.technicalRequirements) {
        insights.push(`- **Technical Level**: ${aiAnalysis.technicalRequirements.css} CSS, ${aiAnalysis.technicalRequirements.js} JavaScript`);
    }
    
    return insights.join('\n');
} 