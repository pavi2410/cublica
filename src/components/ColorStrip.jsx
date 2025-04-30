import React from 'react';

/**
 * ColorStrip component displays a strip of color blocks at the bottom of the code editor
 * Each color block represents a different voxel color
 * Clicking a color block inserts the corresponding color code at the cursor position
 */
const ColorStrip = ({ onColorSelect }) => {
  // Define the colors that match the voxel colors in the 3D view
  const colors = [
    { id: 1, color: 'oklch(0.84 0.18 330)', label: '1', name: 'Pink' },  
    { id: 2, color: 'oklch(0.6 0.2 250)', label: '2', name: 'Dark Blue' },    
    { id: 3, color: 'oklch(0.8 0.15 220)', label: '3', name: 'Light Blue' },   
    { id: 4, color: 'oklch(0.95 0.02 0)', label: '4', name: 'White' },    
    { id: 5, color: 'oklch(0.7 0.25 25)', label: '5', name: 'Red' },    
    { id: 6, color: 'oklch(0.8 0.15 60)', label: '6', name: 'Orange' },    
    { id: 7, color: 'oklch(0.9 0.15 90)', label: '7', name: 'Yellow' },    
    { id: 8, color: 'oklch(0.8 0.15 140)', label: '8', name: 'Green' },   
    { id: 9, color: 'oklch(0.7 0.2 290)', label: '9', name: 'Purple' },    
    { id: 10, color: 'oklch(0.6 0.2 180)', label: '10', name: 'Teal' },  
    { id: 11, color: 'oklch(0.75 0.18 350)', label: '11', name: 'Magenta' }, 
    { id: 12, color: 'oklch(0.3 0.05 0)', label: '12', name: 'Black' },   
    { id: 13, color: 'oklch(0.5 0.1 220)', label: '13', name: 'Navy' },  
    { id: 14, color: 'oklch(0.7 0.15 40)', label: '14', name: 'Brown' },  
    { id: 15, color: 'oklch(0.85 0.07 90)', label: '15', name: 'Pale Yellow' }, 
    { id: 16, color: 'oklch(0.6 0.15 160)', label: '16', name: 'Forest Green' }  
  ];

  const handleColorClick = (colorId) => {
    if (onColorSelect) {
      onColorSelect(colorId);
    }
  };

  return (
    <div className="color-strip">
      {colors.map(color => (
        <div 
          key={color.id} 
          className="color-block" 
          style={{ backgroundColor: color.color }}
          onClick={() => handleColorClick(color.id)}
          title={`${color.name} (${color.id})`}
        >
          <span className="color-label">{color.label}</span>
        </div>
      ))}
    </div>
  );
};

export default ColorStrip;
