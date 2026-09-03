import discoHero from '../assets/disco-hero-unsplash.jpg';

// A stable value is stored in Firestore instead of Vite's build-specific asset URL.
export const DEFAULT_HERO_IMAGE = 'default-disco-hero';

export const resolveHeroImage = (value?: string) => {
  const isLegacyOrDefault = !value
    || value === DEFAULT_HERO_IMAGE
    || value.includes('photo-1511795409834-ef04bbd61622')
    || value.includes('/assets/disco-hero');

  return isLegacyOrDefault ? discoHero : value;
};
