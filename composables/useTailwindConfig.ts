import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '@/tailwind.config';

export function getTwConfig() {
    const fullConfig = resolveConfig(tailwindConfig);

    return {
        colors: fullConfig.theme.colors
    }
}