import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState, useRef } from "react";
import { Settings, Monitor } from "lucide-react";

interface DisplayManagerProps {
  connection?: {
    requestResolution: (width: number, height: number) => Promise<void>;
  } | null;
  isConnected?: boolean;
}

export const DisplayManager = ({ connection, isConnected = false }: DisplayManagerProps) => {
  const [availableResolutions] = useState([
    { width: 1920, height: 1080, label: "1920×1080 (Full HD)" },
    { width: 1366, height: 768, label: "1366×768 (HD)" },
    { width: 1280, height: 720, label: "1280×720 (HD)" },
    { width: 1024, height: 768, label: "1024×768 (XGA)" },
    { width: 1600, height: 900, label: "1600×900 (HD+)" },
    { width: 2560, height: 1440, label: "2560×1440 (QHD)" },
    { width: 3840, height: 2160, label: "3840×2160 (4K UHD)" }
  ]);

  const [currentResolution, setCurrentResolution] = useState({ width: 1920, height: 1080 });
  const [scaling, setScaling] = useState(100);
  const [resolutionSettingsEnabled, setResolutionSettingsEnabled] = useState(true);
  const [isChangingResolution, setIsChangingResolution] = useState(false);

  const changeResolution = async (width: number, height: number) => {
    if (!connection || !isConnected || !resolutionSettingsEnabled) {
      console.warn('Cannot change resolution: connection not available, not connected, or settings disabled');
      return;
    }

    setIsChangingResolution(true);
    try {
      await connection.requestResolution(width, height);
      setCurrentResolution({ width, height });
      console.log(`Resolution changed to ${width}x${height}`);
    } catch (err) {
      console.error('Failed to change resolution:', err);
    } finally {
      setIsChangingResolution(false);
    }
  };

  const handleResolutionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!resolutionSettingsEnabled) return;
    
    const [width, height] = e.target.value.split('x').map(Number);
    changeResolution(width, height);
  };

  const fitToWindow = () => {
    if (!resolutionSettingsEnabled || !connection || !isConnected) return;
    
    // Get current window dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;
    changeResolution(width, height);
  };

  const setNativeSize = () => {
    if (!resolutionSettingsEnabled || !connection || !isConnected) return;
    
    // Set to Full HD as "native"
    changeResolution(1920, 1080);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-medium">Display Settings</h4>
        </div>
        <div className="flex items-center gap-2">
          <Settings className="h-3 w-3 text-muted-foreground" />
          <Switch
            checked={resolutionSettingsEnabled}
            onCheckedChange={setResolutionSettingsEnabled}
            disabled={!isConnected}
          />
        </div>
      </div>
      
      <div className="space-y-3">
        {/* Connection Status Indicator */}
        {!isConnected && (
          <div className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 p-2 rounded">
            Connect to remote desktop to access display settings
          </div>
        )}

        {/* Resolution Dropdown */}
        <div>
          <Label className="text-xs">Resolution</Label>
          <select 
            className={`w-full mt-1 p-2 text-sm border rounded transition-opacity ${
              !resolutionSettingsEnabled || !isConnected || isChangingResolution
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:border-gray-400'
            }`}
            value={`${currentResolution.width}x${currentResolution.height}`}
            onChange={handleResolutionChange}
            disabled={!resolutionSettingsEnabled || !isConnected || isChangingResolution}
          >
            {availableResolutions.map(res => (
              <option key={`${res.width}x${res.height}`} value={`${res.width}x${res.height}`}>
                {res.label}
              </option>
            ))}
          </select>
          {isChangingResolution && (
            <div className="text-xs text-blue-600 mt-1">Applying resolution change...</div>
          )}
        </div>

        {/* Display Scaling */}
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Display Scaling</Label>
            <span className="text-xs text-muted-foreground">{scaling}%</span>
          </div>
          <Slider
            value={[scaling]}
            onValueChange={(value) => {
              if (resolutionSettingsEnabled && isConnected) {
                setScaling(value[0]);
              }
            }}
            min={50}
            max={200}
            step={25}
            className="mt-2"
            disabled={!resolutionSettingsEnabled || !isConnected}
          />
        </div>

        {/* Quick Action Buttons */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs flex-1"
            onClick={fitToWindow}
            disabled={!resolutionSettingsEnabled || !isConnected || isChangingResolution}
          >
            Fit to Window
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs flex-1"
            onClick={setNativeSize}
            disabled={!resolutionSettingsEnabled || !isConnected || isChangingResolution}
          >
            Native Size
          </Button>
        </div>

        {/* Current Status */}
        <div className="text-xs text-muted-foreground">
          Current: {currentResolution.width}×{currentResolution.height} @ {scaling}%
          {!resolutionSettingsEnabled && (
            <span className="text-yellow-600 block mt-1">
              ⚠️ Resolution controls are disabled
            </span>
          )}
        </div>
      </div>
    </div>
  );
};