import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Wifi, Battery, Cpu } from 'lucide-react';

interface PerformanceMetrics {
  memoryUsage?: number;
  connectionType?: string;
  connectionEffective?: string;
  batteryLevel?: number;
  cpuLoad?: number;
}

export const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateMetrics = async () => {
      const newMetrics: PerformanceMetrics = {};

      // Memory usage
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        newMetrics.memoryUsage = Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100);
      }

      // Network information
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        newMetrics.connectionType = connection?.type || connection?.effectiveType;
        newMetrics.connectionEffective = connection?.effectiveType;
      }

      // Battery information
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          newMetrics.batteryLevel = Math.round(battery.level * 100);
        } catch (error) {
          console.log('Battery API not available');
        }
      }

      setMetrics(newMetrics);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    // Show monitor only in development or when explicitly requested
    const shouldShow = localStorage.getItem('show_performance_monitor') === 'true' || 
                       process.env.NODE_ENV === 'development';
    setIsVisible(shouldShow);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const getConnectionBadgeVariant = (type?: string) => {
    if (!type) return 'secondary';
    if (type.includes('4g') || type === 'wifi') return 'default';
    if (type.includes('3g')) return 'secondary';
    return 'destructive';
  };

  const getBatteryBadgeVariant = (level?: number) => {
    if (!level) return 'secondary';
    if (level > 50) return 'default';
    if (level > 20) return 'secondary';
    return 'destructive';
  };

  const getMemoryBadgeVariant = (usage?: number) => {
    if (!usage) return 'secondary';
    if (usage < 70) return 'default';
    if (usage < 90) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className="fixed bottom-4 right-4 w-64 bg-background/95 backdrop-blur-sm border shadow-lg z-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs flex items-center gap-1">
            <Cpu className="h-3 w-3" />
            Memory
          </span>
          <Badge variant={getMemoryBadgeVariant(metrics.memoryUsage)} className="text-xs">
            {metrics.memoryUsage ? `${metrics.memoryUsage}%` : 'N/A'}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs flex items-center gap-1">
            <Wifi className="h-3 w-3" />
            Network
          </span>
          <Badge variant={getConnectionBadgeVariant(metrics.connectionEffective)} className="text-xs">
            {metrics.connectionEffective || 'Unknown'}
          </Badge>
        </div>

        {metrics.batteryLevel !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-xs flex items-center gap-1">
              <Battery className="h-3 w-3" />
              Battery
            </span>
            <Badge variant={getBatteryBadgeVariant(metrics.batteryLevel)} className="text-xs">
              {metrics.batteryLevel}%
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};