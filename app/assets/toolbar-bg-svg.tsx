import React from 'react';

interface ToolbarBgSvgProps {
  width?: string;
  height?: string;
  className?: string;
  children?: React.ReactNode;
}

const ToolbarBgSvg: React.FC<ToolbarBgSvgProps> = ({ className = '', children }) => {
  return (
      <svg
        viewBox={`0 0 8000 1000`}
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full bg-transparent rounded-md"
      >
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter="url(#noiseFilter)"
        />
      </svg>
  );
};

export default ToolbarBgSvg;