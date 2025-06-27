// _components/audio-video-manager.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
    Activity,
    AlertCircle,
    CheckCircle,
    Mic,
    Monitor,
    Pause,
    Play,
    RotateCcw,
    Settings,
    Video,
    VideoOff,
    Volume2,
    VolumeX,
    Wifi
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

// Audio/Video Types
interface AudioDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
  groupId: string;
}

interface VideoDevice {
  deviceId: string;
  label: string;
  kind: 'videoinput';
  groupId: string;
}

interface AudioSettings {
  enabled: boolean;
  inputDevice: string;
  outputDevice: string;
  inputVolume: number;
  outputVolume: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  sampleRate: number;
  bitrate: number;
  channels: 'mono' | 'stereo';
}

interface VideoSettings {
  enabled: boolean;
  device: string;
  resolution: string;
  frameRate: number;
  bitrate: number;
  codec: string;
  quality: 'low' | 'medium' | 'high' | 'ultra';
}

interface MediaStats {
  audio: {
    inputLevel: number;
    outputLevel: number;
    packetsLost: number;
    latency: number;
    jitter: number;
    bitrate: number;
  };
  video: {
    frameRate: number;
    resolution: string;
    packetsLost: number;
    latency: number;
    bitrate: number;
    droppedFrames: number;
  };
}

interface DcvConnection {
  // Audio methods
  setAudioEnabled: (enabled: boolean) => Promise<void>;
  setAudioInputDevice: (deviceId: string) => Promise<void>;
  setAudioOutputDevice: (deviceId: string) => Promise<void>;
  setAudioInputVolume: (volume: number) => Promise<void>;
  setAudioOutputVolume: (volume: number) => Promise<void>;
  setAudioSettings: (settings: Partial<AudioSettings>) => Promise<void>;
  
  // Video methods
  setVideoEnabled: (enabled: boolean) => Promise<void>;
  setVideoDevice: (deviceId: string) => Promise<void>;
  setVideoSettings: (settings: Partial<VideoSettings>) => Promise<void>;
  
  // Stats methods
  getMediaStats: () => Promise<MediaStats>;
  
  // Test methods
  startAudioTest: () => Promise<void>;
  stopAudioTest: () => Promise<void>;
  startVideoTest: () => Promise<void>;
  stopVideoTest: () => Promise<void>;
}

interface AudioVideoManagerProps {
  connection: any | null;
  isConnected: boolean;
}

export const AudioVideoManager: React.FC<AudioVideoManagerProps> = ({
  connection,
  isConnected
}) => {
  // Device states
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [videoDevices, setVideoDevices] = useState<VideoDevice[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  
  // Settings states
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    enabled: true,
    inputDevice: 'default',
    outputDevice: 'default',
    inputVolume: 75,
    outputVolume: 75,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 44100,
    bitrate: 128,
    channels: 'stereo'
  });
  
  const [videoSettings, setVideoSettings] = useState<VideoSettings>({
    enabled: true,
    device: 'default',
    resolution: '1280x720',
    frameRate: 30,
    bitrate: 2000,
    codec: 'H.264',
    quality: 'medium'
  });
  
  // Stats and monitoring
  const [mediaStats, setMediaStats] = useState<MediaStats>({
    audio: {
      inputLevel: 0,
      outputLevel: 0,
      packetsLost: 0,
      latency: 0,
      jitter: 0,
      bitrate: 0
    },
    video: {
      frameRate: 0,
      resolution: '',
      packetsLost: 0,
      latency: 0,
      bitrate: 0,
      droppedFrames: 0
    }
  });
  
  // Test states
  const [isAudioTesting, setIsAudioTesting] = useState(false);
  const [isVideoTesting, setIsVideoTesting] = useState(false);
  const [testStream, setTestStream] = useState<MediaStream | null>(null);
  
  // Refs
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Load available media devices
  const loadDevices = useCallback(async () => {
    setIsLoadingDevices(true);
    try {
      // Request permissions first
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const audioInputs = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
          kind: 'audioinput' as const,
          groupId: device.groupId
        }));
        
      const audioOutputs = devices
        .filter(device => device.kind === 'audiooutput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Speaker ${device.deviceId.slice(0, 8)}`,
          kind: 'audiooutput' as const,
          groupId: device.groupId
        }));
        
      const videoInputs = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
          kind: 'videoinput' as const,
          groupId: device.groupId
        }));
      
      setAudioDevices([...audioInputs, ...audioOutputs]);
      setVideoDevices(videoInputs);
    } catch (error) {
      console.error('Failed to load media devices:', error);
    } finally {
      setIsLoadingDevices(false);
    }
  }, []);

  // Initialize component
  useEffect(() => {
    loadDevices();
    
    // Listen for device changes
    const handleDeviceChange = () => loadDevices();
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (testStream) {
        testStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [loadDevices]);

  // Update stats periodically
  useEffect(() => {
    if (!isConnected || !connection) return;
    
    const updateStats = async () => {
      try {
        const stats = await connection.getMediaStats();
        setMediaStats(stats);
      } catch (error) {
        console.error('Failed to get media stats:', error);
      }
    };
    
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, [isConnected, connection]);

  // Audio level monitoring during tests
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average level
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const level = (average / 255) * 100;
    
    setMediaStats(prev => ({
      ...prev,
      audio: { ...prev.audio, inputLevel: level }
    }));
    
    if (isAudioTesting) {
      animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
    }
  }, [isAudioTesting]);

  // Handle audio setting changes
  const handleAudioSettingChange = async (key: keyof AudioSettings, value: any) => {
    const newSettings = { ...audioSettings, [key]: value };
    setAudioSettings(newSettings);
    
    if (connection && isConnected) {
      try {
        await connection.setAudioSettings({ [key]: value });
      } catch (error) {
        console.error('Failed to update audio setting:', error);
      }
    }
  };

  // Handle video setting changes
  const handleVideoSettingChange = async (key: keyof VideoSettings, value: any) => {
    const newSettings = { ...videoSettings, [key]: value };
    setVideoSettings(newSettings);
    
    if (connection && isConnected) {
      try {
        await connection.setVideoSettings({ [key]: value });
      } catch (error) {
        console.error('Failed to update video setting:', error);
      }
    }
  };

  // Start audio test
  const startAudioTest = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: audioSettings.inputDevice !== 'default' ? audioSettings.inputDevice : undefined,
          echoCancellation: audioSettings.echoCancellation,
          noiseSuppression: audioSettings.noiseSuppression,
          autoGainControl: audioSettings.autoGainControl
        }
      });
      
      setTestStream(stream);
      setIsAudioTesting(true);
      
      // Set up audio analysis
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      monitorAudioLevel();
      
      if (connection && isConnected) {
        await connection.startAudioTest();
      }
    } catch (error) {
      console.error('Failed to start audio test:', error);
    }
  };

  // Stop audio test
  const stopAudioTest = async () => {
    if (testStream) {
      testStream.getTracks().forEach(track => track.stop());
      setTestStream(null);
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setIsAudioTesting(false);
    
    if (connection && isConnected) {
      try {
        await connection.stopAudioTest();
      } catch (error) {
        console.error('Failed to stop audio test:', error);
      }
    }
  };

  // Start video test
  const startVideoTest = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: videoSettings.device !== 'default' ? videoSettings.device : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: videoSettings.frameRate }
        }
      });
      
      setTestStream(stream);
      setIsVideoTesting(true);
      
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
      
      if (connection && isConnected) {
        await connection.startVideoTest();
      }
    } catch (error) {
      console.error('Failed to start video test:', error);
    }
  };

  // Stop video test
  const stopVideoTest = async () => {
    if (testStream) {
      testStream.getTracks().forEach(track => track.stop());
      setTestStream(null);
    }
    
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
    
    setIsVideoTesting(false);
    
    if (connection && isConnected) {
      try {
        await connection.stopVideoTest();
      } catch (error) {
        console.error('Failed to stop video test:', error);
      }
    }
  };

  // Reset settings to defaults
  const resetToDefaults = () => {
    const defaultAudio: AudioSettings = {
      enabled: true,
      inputDevice: 'default',
      outputDevice: 'default',
      inputVolume: 75,
      outputVolume: 75,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 44100,
      bitrate: 128,
      channels: 'stereo'
    };
    
    const defaultVideo: VideoSettings = {
      enabled: true,
      device: 'default',
      resolution: '1280x720',
      frameRate: 30,
      bitrate: 2000,
      codec: 'H.264',
      quality: 'medium'
    };
    
    setAudioSettings(defaultAudio);
    setVideoSettings(defaultVideo);
  };

  // Format bitrate
  const formatBitrate = (bitrate: number): string => {
    if (bitrate >= 1000) {
      return `${(bitrate / 1000).toFixed(1)} Mbps`;
    }
    return `${bitrate} kbps`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Audio & Video Settings</h4>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={loadDevices} disabled={isLoadingDevices}>
            <RotateCcw className={cn("h-3 w-3", isLoadingDevices && "animate-spin")} />
          </Button>
          <Button size="sm" variant="outline" onClick={resetToDefaults}>
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="audio" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="test">Test</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        {/* Audio Settings Tab */}
        <TabsContent value="audio" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Volume2 className="h-4 w-4" />
                Audio Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Audio Enable/Disable */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {audioSettings.enabled ? (
                    <Volume2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-red-500" />
                  )}
                  <Label>Enable Audio</Label>
                </div>
                <Switch
                  checked={audioSettings.enabled}
                  onCheckedChange={(checked) => handleAudioSettingChange('enabled', checked)}
                />
              </div>

              {/* Input Device */}
              <div className="space-y-2">
                <Label>Microphone</Label>
                <Select
                  value={audioSettings.inputDevice}
                  onValueChange={(value) => handleAudioSettingChange('inputDevice', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select microphone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Microphone</SelectItem>
                    {audioDevices
                      .filter(device => device.kind === 'audioinput')
                      .map(device => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Output Device */}
              <div className="space-y-2">
                <Label>Speakers</Label>
                <Select
                  value={audioSettings.outputDevice}
                  onValueChange={(value) => handleAudioSettingChange('outputDevice', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select speakers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Speakers</SelectItem>
                    {audioDevices
                      .filter(device => device.kind === 'audiooutput')
                      .map(device => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Volume Controls */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Microphone Volume</Label>
                    <span className="text-sm text-muted-foreground">{audioSettings.inputVolume}%</span>
                  </div>
                  <Slider
                    value={[audioSettings.inputVolume]}
                    onValueChange={(value) => handleAudioSettingChange('inputVolume', value[0])}
                    max={100}
                    step={1}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Speaker Volume</Label>
                    <span className="text-sm text-muted-foreground">{audioSettings.outputVolume}%</span>
                  </div>
                  <Slider
                    value={[audioSettings.outputVolume]}
                    onValueChange={(value) => handleAudioSettingChange('outputVolume', value[0])}
                    max={100}
                    step={1}
                  />
                </div>
              </div>

              {/* Audio Processing */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Audio Processing</Label>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Echo Cancellation</Label>
                  <Switch
                    checked={audioSettings.echoCancellation}
                    onCheckedChange={(checked) => handleAudioSettingChange('echoCancellation', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Noise Suppression</Label>
                  <Switch
                    checked={audioSettings.noiseSuppression}
                    onCheckedChange={(checked) => handleAudioSettingChange('noiseSuppression', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Auto Gain Control</Label>
                  <Switch
                    checked={audioSettings.autoGainControl}
                    onCheckedChange={(checked) => handleAudioSettingChange('autoGainControl', checked)}
                  />
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Advanced Settings</Label>
                
                <div className="space-y-2">
                  <Label className="text-sm">Sample Rate</Label>
                  <Select
                    value={audioSettings.sampleRate.toString()}
                    onValueChange={(value) => handleAudioSettingChange('sampleRate', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="22050">22.05 kHz</SelectItem>
                      <SelectItem value="44100">44.1 kHz</SelectItem>
                      <SelectItem value="48000">48 kHz</SelectItem>
                      <SelectItem value="96000">96 kHz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Channels</Label>
                  <Select
                    value={audioSettings.channels}
                    onValueChange={(value) => handleAudioSettingChange('channels', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mono">Mono</SelectItem>
                      <SelectItem value="stereo">Stereo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Bitrate</Label>
                    <span className="text-sm text-muted-foreground">{audioSettings.bitrate} kbps</span>
                  </div>
                  <Slider
                    value={[audioSettings.bitrate]}
                    onValueChange={(value) => handleAudioSettingChange('bitrate', value[0])}
                    min={64}
                    max={320}
                    step={32}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Settings Tab */}
        <TabsContent value="video" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Video className="h-4 w-4" />
                Video Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video Enable/Disable */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {videoSettings.enabled ? (
                    <Video className="h-4 w-4 text-green-500" />
                  ) : (
                    <VideoOff className="h-4 w-4 text-red-500" />
                  )}
                  <Label>Enable Video</Label>
                </div>
                <Switch
                  checked={videoSettings.enabled}
                  onCheckedChange={(checked) => handleVideoSettingChange('enabled', checked)}
                />
              </div>

              {/* Camera Device */}
              <div className="space-y-2">
                <Label>Camera</Label>
                <Select
                  value={videoSettings.device}
                  onValueChange={(value) => handleVideoSettingChange('device', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select camera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Camera</SelectItem>
                    {videoDevices.map(device => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Resolution */}
              <div className="space-y-2">
                <Label>Resolution</Label>
                <Select
                  value={videoSettings.resolution}
                  onValueChange={(value) => handleVideoSettingChange('resolution', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="640x480">640x480 (SD)</SelectItem>
                    <SelectItem value="1280x720">1280x720 (HD)</SelectItem>
                    <SelectItem value="1920x1080">1920x1080 (Full HD)</SelectItem>
                    <SelectItem value="2560x1440">2560x1440 (QHD)</SelectItem>
                    <SelectItem value="3840x2160">3840x2160 (4K)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Frame Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Frame Rate</Label>
                  <span className="text-sm text-muted-foreground">{videoSettings.frameRate} fps</span>
                </div>
                <Slider
                  value={[videoSettings.frameRate]}
                  onValueChange={(value) => handleVideoSettingChange('frameRate', value[0])}
                  min={15}
                  max={60}
                  step={15}
                />
              </div>

              {/* Quality Preset */}
              <div className="space-y-2">
                <Label>Quality Preset</Label>
                <Select
                  value={videoSettings.quality}
                  onValueChange={(value) => handleVideoSettingChange('quality', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Faster)</SelectItem>
                    <SelectItem value="medium">Medium (Balanced)</SelectItem>
                    <SelectItem value="high">High (Better Quality)</SelectItem>
                    <SelectItem value="ultra">Ultra (Best Quality)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bitrate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Bitrate</Label>
                  <span className="text-sm text-muted-foreground">{formatBitrate(videoSettings.bitrate)}</span>
                </div>
                <Slider
                  value={[videoSettings.bitrate]}
                  onValueChange={(value) => handleVideoSettingChange('bitrate', value[0])}
                  min={500}
                  max={10000}
                  step={500}
                />
              </div>

              {/* Codec */}
              <div className="space-y-2">
                <Label>Codec</Label>
                <Select
                  value={videoSettings.codec}
                  onValueChange={(value) => handleVideoSettingChange('codec', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="H.264">H.264 (Widely Compatible)</SelectItem>
                    <SelectItem value="H.265">H.265 (More Efficient)</SelectItem>
                    <SelectItem value="VP8">VP8 (Open Source)</SelectItem>
                    <SelectItem value="VP9">VP9 (Open Source)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Tab */}
        <TabsContent value="test" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Audio Test */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Mic className="h-4 w-4" />
                  Audio Test
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Microphone Level</Label>
                  <Progress value={mediaStats.audio.inputLevel} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {mediaStats.audio.inputLevel.toFixed(0)}%
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!isAudioTesting ? (
                    <Button onClick={startAudioTest} size="sm" className="flex-1">
                      <Play className="h-3 w-3 mr-1" />
                      Start Test
                    </Button>
                  ) : (
                    <Button onClick={stopAudioTest} size="sm" variant="destructive" className="flex-1">
                      <Pause className="h-3 w-3 mr-1" />
                      Stop Test
                    </Button>
                  )}
                </div>
                
                {isAudioTesting && (
                  <div className="text-xs text-green-600 dark:text-green-400">
                    ✓ Microphone is working. Speak to see the level indicator.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video Test */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Video className="h-4 w-4" />
                  Video Test
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Camera Preview</Label>
                  <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    {isVideoTesting ? (
                      <video
                        ref={videoPreviewRef}
                        autoPlay
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <VideoOff className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!isVideoTesting ? (
                    <Button onClick={startVideoTest} size="sm" className="flex-1">
                      <Play className="h-3 w-3 mr-1" />
                      Start Test
                    </Button>
                  ) : (
                    <Button onClick={stopVideoTest} size="sm" variant="destructive" className="flex-1">
                      <Pause className="h-3 w-3 mr-1" />
                      Stop Test
                    </Button>
                  )}
                </div>
                
                {isVideoTesting && (
                  <div className="text-xs text-green-600 dark:text-green-400">
                    ✓ Camera is working. You should see the preview above.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Audio Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4" />
                  Audio Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Latency</span>
                  <Badge variant="outline">{mediaStats.audio.latency}ms</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Jitter</span>
                  <Badge variant="outline">{mediaStats.audio.jitter}ms</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Bitrate</span>
                  <Badge variant="outline">{mediaStats.audio.bitrate} kbps</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Packets Lost</span>
                  <Badge variant={mediaStats.audio.packetsLost > 0 ? "destructive" : "outline"}>
                    {mediaStats.audio.packetsLost}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Input Level</span>
                    <span className="text-sm">{mediaStats.audio.inputLevel.toFixed(0)}%</span>
                  </div>
                  <Progress value={mediaStats.audio.inputLevel} className="h-1" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Output Level</span>
                    <span className="text-sm">{mediaStats.audio.outputLevel.toFixed(0)}%</span>
                  </div>
                  <Progress value={mediaStats.audio.outputLevel} className="h-1" />
                </div>
              </CardContent>
            </Card>

            {/* Video Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Monitor className="h-4 w-4" />
                  Video Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Frame Rate</span>
                  <Badge variant="outline">{mediaStats.video.frameRate} fps</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Resolution</span>
                  <Badge variant="outline">{mediaStats.video.resolution || 'N/A'}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Latency</span>
                  <Badge variant="outline">{mediaStats.video.latency}ms</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Bitrate</span>
                  <Badge variant="outline">{formatBitrate(mediaStats.video.bitrate)}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Packets Lost</span>
                  <Badge variant={mediaStats.video.packetsLost > 0 ? "destructive" : "outline"}>
                    {mediaStats.video.packetsLost}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Dropped Frames</span>
                  <Badge variant={mediaStats.video.droppedFrames > 0 ? "destructive" : "outline"}>
                    {mediaStats.video.droppedFrames}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Network Quality Indicator */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Wifi className="h-4 w-4" />
                Network Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Overall Quality</span>
                    <span className="text-sm font-medium">
                      {(() => {
                        const avgLatency = (mediaStats.audio.latency + mediaStats.video.latency) / 2;
                        const totalPacketsLost = mediaStats.audio.packetsLost + mediaStats.video.packetsLost;
                        
                        if (avgLatency < 50 && totalPacketsLost === 0) return "Excellent";
                        if (avgLatency < 100 && totalPacketsLost < 5) return "Good";
                        if (avgLatency < 200 && totalPacketsLost < 10) return "Fair";
                        return "Poor";
                      })()}
                    </span>
                  </div>
                  <Progress 
                    value={(() => {
                      const avgLatency = (mediaStats.audio.latency + mediaStats.video.latency) / 2;
                      const totalPacketsLost = mediaStats.audio.packetsLost + mediaStats.video.packetsLost;
                      
                      if (avgLatency < 50 && totalPacketsLost === 0) return 90;
                      if (avgLatency < 100 && totalPacketsLost < 5) return 70;
                      if (avgLatency < 200 && totalPacketsLost < 10) return 50;
                      return 25;
                    })()} 
                    className="h-2"
                  />
                </div>
                
                <div className="flex gap-2">
                  {(() => {
                    const avgLatency = (mediaStats.audio.latency + mediaStats.video.latency) / 2;
                    const totalPacketsLost = mediaStats.audio.packetsLost + mediaStats.video.packetsLost;
                    
                    if (avgLatency < 50 && totalPacketsLost === 0) {
                      return <CheckCircle className="h-5 w-5 text-green-500" />;
                    }
                    if (avgLatency < 200 && totalPacketsLost < 10) {
                      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
                    }
                    return <AlertCircle className="h-5 w-5 text-red-500" />;
                  })()}
                </div>
              </div>
              
              <div className="mt-4 text-xs text-muted-foreground">
                Quality is based on latency, packet loss, and connection stability.
                {isConnected ? " Real-time data from active session." : " Connect to view live statistics."}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Connection Status */}
      {!isConnected && (
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">
                Connect to DCV session to enable audio/video functionality and view real-time statistics.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};