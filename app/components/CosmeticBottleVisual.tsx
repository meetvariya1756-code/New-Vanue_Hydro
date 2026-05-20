import {useRef, useEffect} from 'react';

interface CosmeticBottleVisualProps {
  className?: string;
  style?: React.CSSProperties;
}

export function CosmeticBottleVisual({className = '', style}: CosmeticBottleVisualProps) {
  return (
    <div className={`cosmetic-bottle-visual ${className}`} style={style}>
      <img
        src="/vanue_serum.png"
        alt="Vanue Glams Body Wash"
        className="cosmetic-bottle-visual__img"
        loading="lazy"
        width={260}
        height={360}
      />
    </div>
  );
}
