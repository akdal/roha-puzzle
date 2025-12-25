import { useStore } from '../store/useStore';

const THEMES = {
    dark: '#1a1a2e',   // Deep dark blue
    light: '#f8f9fa',  // Soft white
    blue: '#0f3460',   // Rich navy blue
};

export const GameBackground = () => {
    const { theme } = useStore();
    return <color attach="background" args={[THEMES[theme]]} />;
};
