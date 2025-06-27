import { useEffect, useState, useRef } from "react";

export const PerformanceMonitor = () => {
  // Replace 'any' with the actual type if known
  const connRef = useRef<any>(null);

  const [performanceData, setPerformanceData] = useState({
    cpuUsage: 0,
    memoryUsage: 0,
    networkIn: 0,
    networkOut: 0,
    diskUsage: 0
  });

  const [history, setHistory] = useState<Array<{timestamp: number, fps: number, latency: number}>>([]);

  // Enhanced stats collection
  const collectPerformanceData = async () => {
    if (connRef.current) {
      try {
        const stats = await connRef.current.getStats();
        const newEntry = {
          timestamp: Date.now(),
          fps: stats.fps,
          latency: stats.latency
        };
        
        setHistory(prev => [...prev.slice(-50), newEntry]); // Keep last 50 entries
        
        // Simulate additional performance metrics (you'd get these from your backend)
        setPerformanceData({
          cpuUsage: Math.random() * 100,
          memoryUsage: Math.random() * 100,
          networkIn: Math.random() * 1000,
          networkOut: Math.random() * 500,
          diskUsage: Math.random() * 100
        });
      } catch (err) {
        console.warn("Failed to collect performance data:", err);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(collectPerformanceData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Performance Monitor</h4>
      
      {/* Real-time metrics */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
          <div className="text-muted-foreground">CPU</div>
          <div className="font-mono">{performanceData.cpuUsage.toFixed(1)}%</div>
        </div>
        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
          <div className="text-muted-foreground">Memory</div>
          <div className="font-mono">{performanceData.memoryUsage.toFixed(1)}%</div>
        </div>
        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
          <div className="text-muted-foreground">Net In</div>
          <div className="font-mono">{performanceData.networkIn.toFixed(0)} KB/s</div>
        </div>
        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
          <div className="text-muted-foreground">Net Out</div>
          <div className="font-mono">{performanceData.networkOut.toFixed(0)} KB/s</div>
        </div>
      </div>

      {/* Performance graph would go here */}
      <div className="h-20 bg-gray-50 dark:bg-gray-800 rounded p-2">
        <div className="text-xs text-muted-foreground mb-1">FPS & Latency Trend</div>
        {/* Mini chart visualization */}
      </div>
    </div>
  );
};
