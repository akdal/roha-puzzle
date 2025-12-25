import { useStore } from '../store/useStore';

const THEMES = {
    dark: '#0a1628',   // Match homepage background
    light: '#f0f4f8',  // Soft cool white
    blue: '#0a1628',   // Match homepage background
};

export const GameBackground = () => {
    const { theme } = useStore();
    return <color attach="background" args={[THEMES[theme]]} />;
};
