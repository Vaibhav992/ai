figma.showUI(__html__, { width: 400, height: 600 });

// Listen for messages from the UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'export-design') {
    try {
      // Get the current selection
      const selection = figma.currentPage.selection;
      
      if (selection.length === 0) {
        figma.ui.postMessage({ 
          type: 'error', 
          message: 'Please select at least one frame or component to export' 
        });
        return;
      }

      // Export design data
      const designData = await exportDesignData(selection);
      
      // Send to your website
      const response = await sendToWebsite(designData);
      
      figma.ui.postMessage({ 
        type: 'success', 
        message: 'Design exported successfully!',
        data: response 
      });
      
    } catch (error) {
      figma.ui.postMessage({ 
        type: 'error', 
        message: 'Failed to export design: ' + error.message 
      });
    }
  }
};

async function exportDesignData(selection) {
  const designData = {
    frames: [],
    components: [],
    styles: {
      colors: [],
      typography: [],
      effects: []
    },
    metadata: {
      exportTime: new Date().toISOString(),
      figmaVersion: figma.version,
      selectionCount: selection.length
    }
  };

  for (const node of selection) {
    if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE') {
      const frameData = await extractFrameData(node);
      designData.frames.push(frameData);
    }
  }

  // Extract global styles
  designData.styles.colors = await extractColors();
  designData.styles.typography = await extractTypography();
  designData.styles.effects = await extractEffects();

  return designData;
}

async function extractFrameData(node) {
  const frameData = {
    id: node.id,
    name: node.name,
    type: node.type,
    width: node.width,
    height: node.height,
    x: node.x,
    y: node.y,
    fills: node.fills,
    strokes: node.strokes,
    effects: node.effects,
    children: []
  };

  if ('children' in node) {
    for (const child of node.children) {
      const childData = await extractNodeData(child);
      frameData.children.push(childData);
    }
  }

  return frameData;
}

async function extractNodeData(node) {
  const nodeData = {
    id: node.id,
    name: node.name,
    type: node.type,
    width: node.width,
    height: node.height,
    x: node.x,
    y: node.y
  };

  // Extract text data
  if (node.type === 'TEXT') {
    nodeData.text = node.characters;
    nodeData.fontSize = node.fontSize;
    nodeData.fontName = node.fontName;
    nodeData.textAlignHorizontal = node.textAlignHorizontal;
    nodeData.textAlignVertical = node.textAlignVertical;
    nodeData.fills = node.fills;
  }

  // Extract image data
  if (node.type === 'RECTANGLE' && node.fills && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.type === 'IMAGE') {
      nodeData.imageData = await node.exportAsync({
        format: 'PNG',
        constraint: { type: 'SCALE', value: 2 }
      });
    }
  }

  // Extract vector data
  if (node.type === 'VECTOR') {
    nodeData.vectorData = await node.exportAsync({
      format: 'SVG'
    });
  }

  return nodeData;
}

async function extractColors() {
  const colors = [];
  const paintStyles = figma.getLocalPaintStyles();
  
  for (const style of paintStyles) {
    if (style.paints && style.paints.length > 0) {
      colors.push({
        name: style.name,
        paints: style.paints
      });
    }
  }
  
  return colors;
}

async function extractTypography() {
  const typography = [];
  const textStyles = figma.getLocalTextStyles();
  
  for (const style of textStyles) {
    typography.push({
      name: style.name,
      fontSize: style.fontSize,
      fontName: style.fontName,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      textAlignHorizontal: style.textAlignHorizontal,
      textAlignVertical: style.textAlignVertical
    });
  }
  
  return typography;
}

async function extractEffects() {
  const effects = [];
  const effectStyles = figma.getLocalEffectStyles();
  
  for (const style of effectStyles) {
    effects.push({
      name: style.name,
      effects: style.effects
    });
  }
  
  return effects;
}

async function sendToWebsite(designData) {
  const response = await fetch('http://localhost:3000/api/figma-import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(designData)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
} 