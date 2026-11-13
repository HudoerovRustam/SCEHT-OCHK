import { useWindowDimensions } from 'react-native';

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  const isWatch = width < 280;
  const isTablet = width >= 600;
  const isCompactHeight = height < 500;

  return {
    width,
    height,
    isWatch,
    isTablet,
    isCompactHeight,
    paddingHorizontal: isWatch ? 12 : 20,
    paddingTop: isWatch ? 22 : isCompactHeight ? 20 : 45,
    maxWidth: isTablet ? 640 : 540,
    titleSize: isWatch ? 17 : 24,
    cardPadding: isWatch ? 10 : 16,
  };
};
