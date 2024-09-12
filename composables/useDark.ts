import { useDark, useToggle } from '@vueuse/core';

const isDark = useDark();
export const toggleDark = useToggle(isDark);