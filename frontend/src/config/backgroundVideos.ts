/**
 * Background Videos Configuration
 * Enables extensible multi-video support for background motions across the platform.
 */

export interface BackgroundVideoConfig {
  id: string;
  title: string;
  src: string;
  description?: string;
  isDefaultIntro?: boolean;
  isRegisterBackground?: boolean;
  isLoginBackground?: boolean;
}

export const BACKGROUND_VIDEOS: BackgroundVideoConfig[] = [
  {
    id: 'intro-video-1',
    title: 'SEVA Civic Engine Introduction',
    src: '/video/video1.mp4',
    description: 'Background motion for project introduction',
    isDefaultIntro: true
  },
  {
    id: 'login-video-2',
    title: 'Sign In Form Motion Background',
    src: '/video/video2.mp4',
    description: 'Soundless background motion for citizen sign in form',
    isLoginBackground: true
  },
  {
    id: 'register-video-3',
    title: 'Register Form Motion Background',
    src: '/video/video3.mp4',
    description: 'Soundless background motion for citizen registration form',
    isRegisterBackground: true
  }
];

export const getIntroVideo = (): BackgroundVideoConfig => {
  return BACKGROUND_VIDEOS.find(v => v.isDefaultIntro) || BACKGROUND_VIDEOS[0];
};

export const getRegisterVideo = (): BackgroundVideoConfig => {
  return BACKGROUND_VIDEOS.find(v => v.isRegisterBackground) || BACKGROUND_VIDEOS[2] || BACKGROUND_VIDEOS[0];
};

export const getLoginVideo = (): BackgroundVideoConfig => {
  return BACKGROUND_VIDEOS.find(v => v.isLoginBackground) || BACKGROUND_VIDEOS[1] || BACKGROUND_VIDEOS[0];
};
