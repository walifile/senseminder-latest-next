import { Button } from "@/components/ui/button";
import { Slider } from "@radix-ui/react-slider";
import { useState } from "react";
import { Label } from "recharts";

// 5. DISPLAY CONFIGURATION MANAGER
export const DisplayManager = () => {
  // Replace 'any' with the actual type if known
  const connRef = useState<{ current: { requestResolution: (width: number, height: number) => Promise<void> } | null }>({ current: null })[0];

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

  const changeResolution = async (width: number, height: number) => {
    if (connRef.current) {
      try {
        await connRef.current.requestResolution(width, height);
        setCurrentResolution({ width, height });
      } catch (err) {
        console.error('Failed to change resolution:', err);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Display Settings</h4>
      
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Resolution</Label>
          <select 
            className="w-full mt-1 p-1 text-xs border rounded"
            value={`${currentResolution.width}x${currentResolution.height}`}
            onChange={(e) => {
              const [width, height] = e.target.value.split('x').map(Number);
              changeResolution(width, height);
            }}
          >
            {availableResolutions.map(res => (
              <option key={`${res.width}x${res.height}`} value={`${res.width}x${res.height}`}>
                {res.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Display Scaling</Label>
            <span className="text-xs text-muted-foreground">{scaling}%</span>
          </div>
          <Slider
            value={[scaling]}
            onValueChange={(value) => setScaling(value[0])}
            min={50}
            max={200}
            step={25}
            className="mt-2"
          />
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs">
            Fit to Window
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            Native Size
          </Button>
        </div>
      </div>
    </div>
  );
};



        // `` <ConnectionDiagnostics />}
        // `` <KeyboardShortcutsPanel />}
        // `` <PerformanceMonitor />}
        // `` <FileTransferManager />}
        // `` <ClipboardManager />}
        // `` <DisplayManager />}
        // `` <SessionRecorder />}
        // `` <ConnectionDiagnostics />}