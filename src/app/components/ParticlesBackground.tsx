'use client';

import { useCallback, useEffect } from 'react';
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
    interactivity: {
      events: {
        onClick: {
          enable: false,
        },
        onHover: {
          enable: true,
          mode: 'attract',
        },
        resize: true,
      },
      modes: {
        attract: {
          distance: 200,
          duration: 0.4,
          factor: 1,
          maxSpeed: 50,
          speed: 1,
        },
      },
    },
    particles: {
      color: {
        value: '#66c0f4',
      },
      move: {
        direction: 'none',
        enable: true,
        outModes: 'bounce',
        random: true,
        speed: 1,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 30,
      },
      opacity: {
        value: { min: 0.1, max: 0.5 },
        animation: {
          enable: true,
          speed: 1,
          sync: false,
        },
      },
      shape: {
        type: 'circle',
      },
      size: {
        value: { min: 1, max: 3 },
        animation: {
          enable: true,
          speed: 2,
          sync: false,
        },
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