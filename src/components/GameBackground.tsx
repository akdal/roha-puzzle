import { useStore } from '../store/useStore';

const THEMES = {
    dark: '#1e1e3f',   // Deep purple-blue
    light: '#f0f4f8',  // Soft cool white
    blue: '#1a365d',   // Rich navy blue
};

export const GameBackground = () => {
    const { theme } = useStore();
    return <color attach="background" args={[THEMES[theme]]} />;
};
