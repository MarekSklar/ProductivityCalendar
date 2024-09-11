import { useDark, useToggle } from '@vueuse/core';

const isDark = useDark();
export function toggleDark() {
    useToggle(isDark);
}