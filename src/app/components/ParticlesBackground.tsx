'use client';

import { useEffect } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { tsParticles } from '@tsparticles/engine';

export const ParticlesBackground: React.FC = () => {
  useEffect(() => {
    loadSlim(tsParticles);
  }, []);

  const particlesOptions = {
    background: {
      opacity: 0,
    },
    fpsLimit: 60,
    particles: {
      color: {
        value: '#66c0f4',
      },
      move: {
        enable: true,
        speed: 1,
      },
      number: {
        value: 30,
      },
      opacity: {
        value: 0.3,
      },
      shape: {
        type: 'circle',
      },
      size: {
        value: 2,
      },
    },
    detectRetina: true,
  };

  return (
    <Particles
      id="tsparticles"
      options={particlesOptions}
      className="absolute inset-0 pointer-events-none"
    />
  );
}; 