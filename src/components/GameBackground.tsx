import { useStore } from '../store/useStore';

export const GameBackground = () => {
    const { theme } = useStore();
    const color = theme === 'light' ? '#e5e5e5' : theme === 'blue' ? '#1e3a8a' : '#242424';
    return <color attach="background" args={[color]} />;
};
