import { useEffect, useState } from "react";

export const ClipboardManager = () => {
  const [clipboardHistory, setClipboardHistory] = useState<string[]>([]);
  const [currentClipboard, setCurrentClipboard] = useState('');

  const syncClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text !== currentClipboard) {
        setCurrentClipboard(text);
        setClipboardHistory(prev => [text, ...prev.slice(0, 9)]); // Keep last 10
      }
    } catch (err) {
      console.warn('Clipboard access denied:', err);
    }
  };

  const writeToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCurrentClipboard(text);
    } catch (err) {
      console.warn('Failed to write to clipboard:', err);
    }
  };

  useEffect(() => {
    const interval = setInterval(syncClipboard, 2000);
    return () => clearInterval(interval);
  }, [currentClipboard]);

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Clipboard Manager</h4>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type to send to remote..."
            className="flex-1 px-2 py-1 text-xs border rounded"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                writeToClipboard(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
        </div>
        
        <div className="text-xs text-muted-foreground">Recent clipboard:</div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {clipboardHistory.map((item, index) => (
            <div
              key={index}
              className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => writeToClipboard(item)}
            >
              {item.substring(0, 50)}{item.length > 50 ? '...' : ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};