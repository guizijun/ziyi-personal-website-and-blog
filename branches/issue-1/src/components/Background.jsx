import { useEffect, useRef } from 'react';
import { createBgEngine } from '../lib/background.js';

export default function Background({ prefs }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && !engineRef.current) {
      engineRef.current = createBgEngine(canvasRef.current);
    }
    return () => {
      if (engineRef.current) engineRef.current.destroy();
    };
  }, []);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.set(prefs.background, {
        speed: prefs.bgSpeed ?? 1,
        image: prefs.backgroundImage || ''
      });
    }
  }, [prefs.background, prefs.bgSpeed, prefs.backgroundImage]);

  const showImage = prefs.background === 'image' && prefs.backgroundImage;
  return (
    <>
      <div
        id="bg-image"
        style={showImage
          ? { display: 'block', backgroundImage: `url("${prefs.backgroundImage}")` }
          : { display: 'none' }}
      />
      <canvas id="bg-canvas" ref={canvasRef} />
    </>
  );
}
