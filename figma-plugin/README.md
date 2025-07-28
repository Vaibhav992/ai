# Vaibhav AI Website Builder - Figma Plugin

This Figma plugin allows you to export your Figma designs directly to the Vaibhav AI Website Builder, where they will be converted into production-ready code.

## Features

- **Export Design Elements**: Extract frames, components, and layouts from Figma
- **Preserve Styles**: Maintain colors, typography, and effects
- **Asset Extraction**: Export images, icons, and vector graphics
- **Direct Integration**: Seamlessly connect to the AI website builder
- **Real-time Processing**: Convert designs to code instantly

## Installation

### Method 1: Development Installation

1. **Clone or download this plugin folder**
   ```bash
   git clone <your-repo-url>
   cd figma-plugin
   ```

2. **Open Figma Desktop App**

3. **Go to Plugins > Development > New Plugin**
   - Click "Import plugin from manifest"
   - Select the `manifest.json` file from this folder

4. **The plugin will appear in your development plugins list**

### Method 2: Manual Installation

1. **Create a new folder** in your Figma plugins directory:
   - **Windows**: `%APPDATA%\Figma\plugins`
   - **macOS**: `~/Library/Application Support/Figma/plugins`
   - **Linux**: `~/.config/Figma/plugins`

2. **Copy all files** from this folder to the new directory

3. **Restart Figma** and the plugin will appear in your plugins list

## Usage

### Step 1: Prepare Your Design

1. **Open your Figma file**
2. **Select the frames or components** you want to export
3. **Ensure your design uses named styles** for colors and typography (recommended)

### Step 2: Export Design

1. **Right-click on your selection** or go to **Plugins > Vaibhav AI Website Builder**
2. **Click "Export to Website Builder"** in the plugin interface
3. **Wait for processing** - the plugin will extract:
   - Layout structure and positioning
   - Colors and typography styles
   - Text content and styling
   - Images and vector graphics
   - Component hierarchy

### Step 3: Continue in Website Builder

1. **Your design will be sent** to the Vaibhav AI Website Builder
2. **Review the extracted design schema** in the web interface
3. **Customize and refine** your design using the visual editor
4. **Generate production-ready code** with HTML, CSS, and JavaScript

## What Gets Exported

### Design Elements
- **Frames**: Main layout containers
- **Components**: Reusable design elements
- **Groups**: Organized content sections
- **Text Layers**: Typography and content
- **Shapes**: Geometric elements and backgrounds

### Styles
- **Colors**: Primary, secondary, accent, and background colors
- **Typography**: Font families, sizes, weights, and line heights
- **Effects**: Shadows, blurs, and other visual effects
- **Spacing**: Layout margins, padding, and grid systems

### Assets
- **Images**: PNG exports of image elements
- **Icons**: Vector graphics as SVG
- **Backgrounds**: Pattern and texture elements

## Configuration

### Network Access

The plugin needs to communicate with your website builder. Update the `manifest.json` file to include your domain:

```json
{
  "networkAccess": {
    "allowedDomains": ["localhost:3000", "your-domain.com"]
  }
}
```

### Development vs Production

- **Development**: Use `localhost:3000` for local testing
- **Production**: Replace with your actual domain

## Troubleshooting

### Plugin Not Appearing
- Ensure all files are in the correct plugins directory
- Restart Figma after installation
- Check that `manifest.json` is valid JSON

### Export Fails
- Make sure you have selected at least one frame or component
- Check your internet connection
- Verify the website builder is running (for local development)
- Check browser console for error messages

### Design Elements Missing
- Ensure elements are properly named in Figma
- Use Figma's style system for better extraction
- Check that elements are not locked or hidden

## Development

### File Structure
```
figma-plugin/
├── manifest.json      # Plugin configuration
├── code.js           # Main plugin logic
├── ui.html           # Plugin interface
└── README.md         # This file
```

### Customization

You can customize the plugin by modifying:

- **`code.js`**: Add new export features or modify data extraction
- **`ui.html`**: Update the user interface design
- **`manifest.json`**: Change plugin metadata and permissions

### Testing

1. **Load the plugin** in Figma development mode
2. **Create a test design** with various elements
3. **Export and verify** the extracted data
4. **Check the website builder** receives the correct information

## Support

For issues or questions:

1. **Check this README** for common solutions
2. **Review the console logs** in Figma's developer tools
3. **Test with a simple design** to isolate issues
4. **Contact support** with specific error messages

## License

This plugin is part of the Vaibhav AI Website Builder project.

---

**Happy designing! 🎨✨** 