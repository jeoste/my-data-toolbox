import { useState, useEffect, useCallback } from 'react';

export interface UpdateStatus {
  status: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  message: string;
  timestamp?: string;
  percent?: number;
  transferred?: number;
  total?: number;
  bytesPerSecond?: number;
}

export function useUpdater() {
  const [isCheckingForUpdates, setIsCheckingForUpdates] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({
    status: 'idle',
    message: ''
  });
  const [appVersion, setAppVersion] = useState<string>('');

  useEffect(() => {
    // Web version: no update system needed
    setAppVersion('web');
  }, []);

  // Web version: no update system
  const checkForUpdates = useCallback(async () => {
    // No-op for web version
  }, []);

  const checkForUpdatesAndNotify = useCallback(async () => {
    // No-op for web version
  }, []);

  const quitAndInstall = useCallback(async () => {
    // No-op for web version
  }, []);

  // Helpers pour les statuts
  const isUpdateAvailable = updateStatus.status === 'available';
  const isUpdateDownloaded = updateStatus.status === 'downloaded';
  const isDownloading = updateStatus.status === 'downloading';
  const hasError = updateStatus.status === 'error';

  // Formater la progress du téléchargement
  const downloadProgress = updateStatus.percent ? Math.round(updateStatus.percent) : 0;

  return {
    // État général
    isCheckingForUpdates,
    updateStatus,
    appVersion,
    
    // Actions
    checkForUpdates,
    checkForUpdatesAndNotify,
    quitAndInstall,
    
    // États dérivés pour faciliter l'usage
    isUpdateAvailable,
    isUpdateDownloaded,
    isDownloading,
    hasError,
    downloadProgress
  };
} 