import { ref } from 'vue';
import { getApiUrl } from '@/config';
import type { SessionHistory } from '@/types';

export function useHistory() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const history = ref<SessionHistory[]>([]);

  const fetchHistory = async (roomId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(getApiUrl(`/history/${roomId}`));
      
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      history.value = await response.json();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to fetch history:', err);
    } finally {
      loading.value = false;
    }
  };

  const exportCSV = async (roomId: string) => {
    try {
      const response = await fetch(getApiUrl(`/export/${roomId}`));
      
      if (!response.ok) {
        throw new Error('Failed to export history');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `poker-planning-${roomId}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to export';
      console.error('Failed to export:', err);
    }
  };

  return {
    loading,
    error,
    history,
    fetchHistory,
    exportCSV,
  };
}