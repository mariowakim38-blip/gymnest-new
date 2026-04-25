import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';

export const [SidebarProvider, useSidebar] = createContextHook(() => {
  const [isOpen, setIsOpen] = useState(false);

  const openSidebar = useCallback(() => {
    console.log('Opening sidebar');
    setIsOpen(true);
  }, []);
  
  const closeSidebar = useCallback(() => {
    console.log('Closing sidebar');
    setIsOpen(false);
  }, []);
  
  const toggleSidebar = useCallback(() => {
    console.log('Toggling sidebar, current state:', isOpen);
    setIsOpen(prev => !prev);
  }, [isOpen]);

  return useMemo(() => ({
    isOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar,
  }), [isOpen, openSidebar, closeSidebar, toggleSidebar]);
});
