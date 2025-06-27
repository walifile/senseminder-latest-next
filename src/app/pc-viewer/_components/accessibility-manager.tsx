// _components/accessibility-manager.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  Eye,
  EyeOff,
  Ear,
  EarOff,
  MousePointer,
  Keyboard,
  Type,
  Contrast,
  ZoomIn,
  ZoomOut,
  Volume2,
  VolumeX,
  Accessibility,
  Focus,
  Hand,
  Move,
  RotateCcw,
  Settings,
  Play,
  Pause,
  Square,
  Mic,
  MicOff,
  Speaker,
  Languages,
  Clock,
  AlertCircle,
  CheckCircle,
  Moon,
  Sun,
  Palette,
  Filter,
  Target,
  Gauge
} from "lucide-react";
import { cn } from "@/lib/utils";

// Accessibility Types
interface VisualSettings {
  highContrast: boolean;
  colorScheme: 'auto' | 'light' | 'dark' | 'custom';
  fontSize: number;
  fontFamily: string;
  lineSpacing: number;
  magnificationLevel: number;
  magnifierEnabled: boolean;
  colorFilters: {
    enabled: boolean;
    type: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'grayscale' | 'invert';
    intensity: number;
  };
  cursorSize: number;
  cursorHighlight: boolean;
  focusIndicator: boolean;
  animationsReduced: boolean;
}

interface AudioSettings {
  screenReaderEnabled: boolean;
  soundNotifications: boolean;
  soundVolume: number;
  speechRate: number;
  speechPitch: number;
  speechVoice: string;
  captionsEnabled: boolean;
  audioDescriptions: boolean;
  keyboardSounds: boolean;
  alertSounds: boolean;
}

interface MotorSettings {
  stickyKeys: boolean;
  slowKeys: boolean;
  bounceKeys: boolean;
  filterKeys: boolean;
  mouseKeys: boolean;
  clickAssist: boolean;
  dwellClick: boolean;
  dwellTime: number;
  dragLock: boolean;
  gestureRecognition: boolean;
  voiceControl: boolean;
  eyeTracking: boolean;
}

interface CognitiveSettings {
  readingMode: boolean;
  focusMode: boolean;
  distractionFilter: boolean;
  reminders: boolean;
  simplifiedInterface: boolean;
  taskBreakdown: boolean;
  progressIndicators: boolean;
  autoSave: boolean;
  sessionTimeout: number;
  guidedNavigation: boolean;
}

interface AccessibilityProfile {
  id: string;
  name: string;
  description: string;
  visual: VisualSettings;
  audio: AudioSettings;
  motor: MotorSettings;
  cognitive: CognitiveSettings;
  isActive: boolean;
  isCustom: boolean;
}

interface DcvConnection {
  // Visual accessibility
  setHighContrast: (enabled: boolean) => Promise<void>;
  setMagnification: (level: number) => Promise<void>;
  setColorFilter: (type: string, intensity: number) => Promise<void>;
  setCursorSettings: (size: number, highlight: boolean) => Promise<void>;
  
  // Audio accessibility
  enableScreenReader: (enabled: boolean) => Promise<void>;
  setSpeechSettings: (rate: number, pitch: number, voice: string) => Promise<void>;
  enableCaptions: (enabled: boolean) => Promise<void>;
  
  // Motor accessibility
  enableStickyKeys: (enabled: boolean) => Promise<void>;
  enableMouseKeys: (enabled: boolean) => Promise<void>;
  setDwellClick: (enabled: boolean, time: number) => Promise<void>;
  enableVoiceControl: (enabled: boolean) => Promise<void>;
  
  // Cognitive accessibility
  enableFocusMode: (enabled: boolean) => Promise<void>;
  setSessionTimeout: (timeout: number) => Promise<void>;
  enableGuidedNavigation: (enabled: boolean) => Promise<void>;
  
  // Profile management
  saveAccessibilityProfile: (profile: AccessibilityProfile) => Promise<void>;
  loadAccessibilityProfile: (profileId: string) => Promise<void>;
}

interface AccessibilityManagerProps {
  connection: any | null;
  isConnected: boolean;
}

export const AccessibilityManager: React.FC<AccessibilityManagerProps> = ({
  connection,
  isConnected
}) => {
  // Settings states
  const [visualSettings, setVisualSettings] = useState<VisualSettings>({
    highContrast: false,
    colorScheme: 'auto',
    fontSize: 14,
    fontFamily: 'system-ui',
    lineSpacing: 1.5,
    magnificationLevel: 100,
    magnifierEnabled: false,
    colorFilters: {
      enabled: false,
      type: 'none',
      intensity: 50
    },
    cursorSize: 1,
    cursorHighlight: false,
    focusIndicator: true,
    animationsReduced: false
  });

  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    screenReaderEnabled: false,
    soundNotifications: true,
    soundVolume: 75,
    speechRate: 50,
    speechPitch: 50,
    speechVoice: 'default',
    captionsEnabled: false,
    audioDescriptions: false,
    keyboardSounds: false,
    alertSounds: true
  });

  const [motorSettings, setMotorSettings] = useState<MotorSettings>({
    stickyKeys: false,
    slowKeys: false,
    bounceKeys: false,
    filterKeys: false,
    mouseKeys: false,
    clickAssist: false,
    dwellClick: false,
    dwellTime: 1000,
    dragLock: false,
    gestureRecognition: false,
    voiceControl: false,
    eyeTracking: false
  });

  const [cognitiveSettings, setCognitiveSettings] = useState<CognitiveSettings>({
    readingMode: false,
    focusMode: false,
    distractionFilter: false,
    reminders: true,
    simplifiedInterface: false,
    taskBreakdown: false,
    progressIndicators: true,
    autoSave: true,
    sessionTimeout: 30,
    guidedNavigation: false
  });

  // Profile management
  const [profiles, setProfiles] = useState<AccessibilityProfile[]>([
    {
      id: 'default',
      name: 'Default',
      description: 'Standard accessibility settings',
      visual: visualSettings,
      audio: audioSettings,
      motor: motorSettings,
      cognitive: cognitiveSettings,
      isActive: true,
      isCustom: false
    },
    {
      id: 'visual-impaired',
      name: 'Visual Impairment',
      description: 'Optimized for users with visual impairments',
      visual: { ...visualSettings, highContrast: true, magnificationLevel: 150 },
      audio: { ...audioSettings, screenReaderEnabled: true, soundNotifications: true },
      motor: motorSettings,
      cognitive: cognitiveSettings,
      isActive: false,
      isCustom: false
    },
    {
      id: 'motor-impaired',
      name: 'Motor Impairment',
      description: 'Optimized for users with motor impairments',
      visual: visualSettings,
      audio: audioSettings,
      motor: { ...motorSettings, stickyKeys: true, dwellClick: true, dwellTime: 2000 },
      cognitive: cognitiveSettings,
      isActive: false,
      isCustom: false
    },
    {
      id: 'cognitive-support',
      name: 'Cognitive Support',
      description: 'Simplified interface with cognitive aids',
      visual: { ...visualSettings, animationsReduced: true },
      audio: audioSettings,
      motor: motorSettings,
      cognitive: { ...cognitiveSettings, simplifiedInterface: true, focusMode: true, guidedNavigation: true },
      isActive: false,
      isCustom: false
    }
  ]);

  const [activeProfile, setActiveProfile] = useState('default');
  const [customProfileName, setCustomProfileName] = useState('');
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  // Speech synthesis
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Testing states
  const [testText, setTestText] = useState('This is a test of the screen reader functionality. The quick brown fox jumps over the lazy dog.');
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);

  // Refs
  const magnifierRef = useRef<HTMLDivElement>(null);
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const voices = speechSynthesis.current?.getVoices() || [];
        setAvailableVoices(voices);
      };
      
      loadVoices();
      speechSynthesis.current.addEventListener('voiceschanged', loadVoices);
      
      return () => {
        speechSynthesis.current?.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  // Apply visual settings to DOM
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply font size
    root.style.setProperty('--accessibility-font-size', `${visualSettings.fontSize}px`);
    
    // Apply line spacing
    root.style.setProperty('--accessibility-line-height', visualSettings.lineSpacing.toString());
    
    // Apply cursor size
    root.style.setProperty('--accessibility-cursor-size', `${visualSettings.cursorSize}em`);
    
    // Apply high contrast
    if (visualSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Apply color scheme
    root.setAttribute('data-color-scheme', visualSettings.colorScheme);
    
    // Apply animations
    if (visualSettings.animationsReduced) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  }, [visualSettings]);

  // Handle visual setting changes
  const handleVisualSettingChange = async (key: keyof VisualSettings, value: any) => {
    const newSettings = { ...visualSettings, [key]: value };
    setVisualSettings(newSettings);
    
    if (connection && isConnected) {
      try {
        switch (key) {
          case 'highContrast':
            await connection.setHighContrast(value);
            break;
          case 'magnificationLevel':
            await connection.setMagnification(value);
            break;
          case 'cursorSize':
          case 'cursorHighlight':
            await connection.setCursorSettings(newSettings.cursorSize, newSettings.cursorHighlight);
            break;
        }
      } catch (error) {
        console.error('Failed to update visual setting:', error);
      }
    }
  };

  // Handle audio setting changes
  const handleAudioSettingChange = async (key: keyof AudioSettings, value: any) => {
    const newSettings = { ...audioSettings, [key]: value };
    setAudioSettings(newSettings);
    
    if (connection && isConnected) {
      try {
        switch (key) {
          case 'screenReaderEnabled':
            await connection.enableScreenReader(value);
            break;
          case 'speechRate':
          case 'speechPitch':
          case 'speechVoice':
            await connection.setSpeechSettings(newSettings.speechRate, newSettings.speechPitch, newSettings.speechVoice);
            break;
          case 'captionsEnabled':
            await connection.enableCaptions(value);
            break;
        }
      } catch (error) {
        console.error('Failed to update audio setting:', error);
      }
    }
  };

  // Handle motor setting changes
  const handleMotorSettingChange = async (key: keyof MotorSettings, value: any) => {
    const newSettings = { ...motorSettings, [key]: value };
    setMotorSettings(newSettings);
    
    if (connection && isConnected) {
      try {
        switch (key) {
          case 'stickyKeys':
            await connection.enableStickyKeys(value);
            break;
          case 'mouseKeys':
            await connection.enableMouseKeys(value);
            break;
          case 'dwellClick':
          case 'dwellTime':
            await connection.setDwellClick(newSettings.dwellClick, newSettings.dwellTime);
            break;
          case 'voiceControl':
            await connection.enableVoiceControl(value);
            break;
        }
      } catch (error) {
        console.error('Failed to update motor setting:', error);
      }
    }
  };

  // Handle cognitive setting changes
  const handleCognitiveSettingChange = async (key: keyof CognitiveSettings, value: any) => {
    const newSettings = { ...cognitiveSettings, [key]: value };
    setCognitiveSettings(newSettings);
    
    if (connection && isConnected) {
      try {
        switch (key) {
          case 'focusMode':
            await connection.enableFocusMode(value);
            break;
          case 'sessionTimeout':
            await connection.setSessionTimeout(value);
            break;
          case 'guidedNavigation':
            await connection.enableGuidedNavigation(value);
            break;
        }
      } catch (error) {
        console.error('Failed to update cognitive setting:', error);
      }
    }
  };

  // Load profile
  const loadProfile = async (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    
    setVisualSettings(profile.visual);
    setAudioSettings(profile.audio);
    setMotorSettings(profile.motor);
    setCognitiveSettings(profile.cognitive);
    setActiveProfile(profileId);
    
    // Update profiles to set active state
    setProfiles(prev => prev.map(p => ({ ...p, isActive: p.id === profileId })));
    
    if (connection && isConnected) {
      try {
        await connection.loadAccessibilityProfile(profileId);
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    }
  };

  // Create custom profile
  const createCustomProfile = async () => {
    if (!customProfileName.trim()) return;
    
    const newProfile: AccessibilityProfile = {
      id: `custom-${Date.now()}`,
      name: customProfileName,
      description: 'Custom accessibility profile',
      visual: visualSettings,
      audio: audioSettings,
      motor: motorSettings,
      cognitive: cognitiveSettings,
      isActive: false,
      isCustom: true
    };
    
    setProfiles(prev => [...prev, newProfile]);
    setCustomProfileName('');
    setIsCreatingProfile(false);
    
    if (connection && isConnected) {
      try {
        await connection.saveAccessibilityProfile(newProfile);
      } catch (error) {
        console.error('Failed to save profile:', error);
      }
    }
  };

  // Text-to-speech test
  const testTextToSpeech = () => {
    if (!speechSynthesis.current) return;
    
    if (isSpeaking) {
      speechSynthesis.current.cancel();
      setIsSpeaking(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(testText);
    utterance.rate = audioSettings.speechRate / 50;
    utterance.pitch = audioSettings.speechPitch / 50;
    
    const selectedVoice = availableVoices.find(voice => voice.name === audioSettings.speechVoice);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    speechSynthesis.current.speak(utterance);
  };

  // Mouse tracker for magnifier
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (visualSettings.magnifierEnabled) {
      setMagnifierPosition({ x: e.clientX, y: e.clientY });
      setShowMagnifier(true);
    }
  }, [visualSettings.magnifierEnabled]);

  useEffect(() => {
    if (visualSettings.magnifierEnabled) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    } else {
      setShowMagnifier(false);
    }
  }, [visualSettings.magnifierEnabled, handleMouseMove]);

  // Reset all settings
  const resetAllSettings = () => {
    loadProfile('default');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Accessibility Settings</h4>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={resetAllSettings}>
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Offline"}
          </Badge>
        </div>
      </div>

      {/* Profile Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Accessibility className="h-4 w-4" />
            Accessibility Profiles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Profile</Label>
            <Select value={activeProfile} onValueChange={loadProfile}>
              <SelectTrigger>
                <SelectValue placeholder="Choose accessibility profile" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map(profile => (
                  <SelectItem key={profile.id} value={profile.id}>
                    <div className="flex items-center gap-2">
                      <span>{profile.name}</span>
                      {profile.isActive && <CheckCircle className="h-3 w-3 text-green-500" />}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Create Custom Profile */}
          <div className="space-y-2">
            {!isCreatingProfile ? (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setIsCreatingProfile(true)}
                className="w-full"
              >
                Create Custom Profile
              </Button>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Profile name"
                  value={customProfileName}
                  onChange={(e) => setCustomProfileName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={createCustomProfile} disabled={!customProfileName.trim()}>
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsCreatingProfile(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visual">Visual</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="motor">Motor</TabsTrigger>
          <TabsTrigger value="cognitive">Cognitive</TabsTrigger>
        </TabsList>

        {/* Visual Accessibility Tab */}
        <TabsContent value="visual" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4" />
                Visual Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Contrast className="h-4 w-4 text-muted-foreground" />
                  <Label>High Contrast Mode</Label>
                </div>
                <Switch
                  checked={visualSettings.highContrast}
                  onCheckedChange={(checked) => handleVisualSettingChange('highContrast', checked)}
                />
              </div>

              {/* Color Scheme */}
              <div className="space-y-2">
                <Label>Color Scheme</Label>
                <Select
                  value={visualSettings.colorScheme}
                  onValueChange={(value) => handleVisualSettingChange('colorScheme', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Font Size</Label>
                  <span className="text-sm text-muted-foreground">{visualSettings.fontSize}px</span>
                </div>
                <Slider
                  value={[visualSettings.fontSize]}
                  onValueChange={(value) => handleVisualSettingChange('fontSize', value[0])}
                  min={10}
                  max={24}
                  step={1}
                />
              </div>

              {/* Line Spacing */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Line Spacing</Label>
                  <span className="text-sm text-muted-foreground">{visualSettings.lineSpacing}x</span>
                </div>
                <Slider
                  value={[visualSettings.lineSpacing]}
                  onValueChange={(value) => handleVisualSettingChange('lineSpacing', value[0])}
                  min={1}
                  max={3}
                  step={0.1}
                />
              </div>

              {/* Magnification */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ZoomIn className="h-4 w-4 text-muted-foreground" />
                    <Label>Screen Magnifier</Label>
                  </div>
                  <Switch
                    checked={visualSettings.magnifierEnabled}
                    onCheckedChange={(checked) => handleVisualSettingChange('magnifierEnabled', checked)}
                  />
                </div>
                
                {visualSettings.magnifierEnabled && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Magnification Level</Label>
                      <span className="text-sm text-muted-foreground">{visualSettings.magnificationLevel}%</span>
                    </div>
                    <Slider
                      value={[visualSettings.magnificationLevel]}
                      onValueChange={(value) => handleVisualSettingChange('magnificationLevel', value[0])}
                      min={100}
                      max={500}
                      step={25}
                    />
                  </div>
                )}
              </div>

              {/* Color Filters */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Label>Color Filters</Label>
                  </div>
                  <Switch
                    checked={visualSettings.colorFilters.enabled}
                    onCheckedChange={(checked) => handleVisualSettingChange('colorFilters', { ...visualSettings.colorFilters, enabled: checked })}
                  />
                </div>
                
                {visualSettings.colorFilters.enabled && (
                  <div className="space-y-2">
                    <Label>Filter Type</Label>
                    <Select
                      value={visualSettings.colorFilters.type}
                      onValueChange={(value) => handleVisualSettingChange('colorFilters', { ...visualSettings.colorFilters, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="protanopia">Protanopia (Red-blind)</SelectItem>
                        <SelectItem value="deuteranopia">Deuteranopia (Green-blind)</SelectItem>
                        <SelectItem value="tritanopia">Tritanopia (Blue-blind)</SelectItem>
                        <SelectItem value="grayscale">Grayscale</SelectItem>
                        <SelectItem value="invert">Invert Colors</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Cursor Settings */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Cursor & Focus</Label>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Cursor Size</Label>
                    <span className="text-sm text-muted-foreground">{visualSettings.cursorSize}x</span>
                  </div>
                  <Slider
                    value={[visualSettings.cursorSize]}
                    onValueChange={(value) => handleVisualSettingChange('cursorSize', value[0])}
                    min={1}
                    max={4}
                    step={0.5}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Cursor Highlight</Label>
                  <Switch
                    checked={visualSettings.cursorHighlight}
                    onCheckedChange={(checked) => handleVisualSettingChange('cursorHighlight', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Enhanced Focus Indicator</Label>
                  <Switch
                    checked={visualSettings.focusIndicator}
                    onCheckedChange={(checked) => handleVisualSettingChange('focusIndicator', checked)}
                  />
                </div>
              </div>

              {/* Animation Settings */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Move className="h-4 w-4 text-muted-foreground" />
                  <Label>Reduce Animations</Label>
                </div>
                <Switch
                  checked={visualSettings.animationsReduced}
                  onCheckedChange={(checked) => handleVisualSettingChange('animationsReduced', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audio Accessibility Tab */}
        <TabsContent value="audio" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Ear className="h-4 w-4" />
                Audio Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Screen Reader */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Speaker className="h-4 w-4 text-muted-foreground" />
                  <Label>Screen Reader</Label>
                </div>
                <Switch
                  checked={audioSettings.screenReaderEnabled}
                  onCheckedChange={(checked) => handleAudioSettingChange('screenReaderEnabled', checked)}
                />
              </div>

              {/* Speech Settings */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Speech Settings</Label>
                
                <div className="space-y-2">
                  <Label className="text-sm">Voice</Label>
                  <Select
                    value={audioSettings.speechVoice}
                    onValueChange={(value) => handleAudioSettingChange('speechVoice', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      {availableVoices.map(voice => (
                        <SelectItem key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Speech Rate</Label>
                    <span className="text-sm text-muted-foreground">{audioSettings.speechRate}%</span>
                  </div>
                  <Slider
                    value={[audioSettings.speechRate]}
                    onValueChange={(value) => handleAudioSettingChange('speechRate', value[0])}
                    min={10}
                    max={100}
                    step={5}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Speech Pitch</Label>
                    <span className="text-sm text-muted-foreground">{audioSettings.speechPitch}%</span>
                  </div>
                  <Slider
                    value={[audioSettings.speechPitch]}
                    onValueChange={(value) => handleAudioSettingChange('speechPitch', value[0])}
                    min={10}
                    max={100}
                    step={5}
                  />
                </div>
              </div>

              {/* Text-to-Speech Test */}
              <div className="space-y-2">
                <Label className="text-sm">Test Text-to-Speech</Label>
                <Textarea
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="Enter text to test speech..."
                  rows={3}
                />
                <Button onClick={testTextToSpeech} variant="outline" className="w-full">
                  {isSpeaking ? (
                    <>
                      <Square className="h-4 w-4 mr-2" />
                      Stop Speaking
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Test Speech
                    </>
                  )}
                </Button>
              </div>

              {/* Sound Notifications */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Sound Notifications</Label>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Enable Sound Notifications</Label>
                  <Switch
                    checked={audioSettings.soundNotifications}
                    onCheckedChange={(checked) => handleAudioSettingChange('soundNotifications', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Sound Volume</Label>
                    <span className="text-sm text-muted-foreground">{audioSettings.soundVolume}%</span>
                  </div>
                  <Slider
                    value={[audioSettings.soundVolume]}
                    onValueChange={(value) => handleAudioSettingChange('soundVolume', value[0])}
                    max={100}
                    step={5}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Keyboard Sounds</Label>
                  <Switch
                    checked={audioSettings.keyboardSounds}
                    onCheckedChange={(checked) => handleAudioSettingChange('keyboardSounds', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Alert Sounds</Label>
                  <Switch
                    checked={audioSettings.alertSounds}
                    onCheckedChange={(checked) => handleAudioSettingChange('alertSounds', checked)}
                  />
                </div>
              </div>

              {/* Captions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4 text-muted-foreground" />
                  <Label>Closed Captions</Label>
                </div>
                <Switch
                  checked={audioSettings.captionsEnabled}
                  onCheckedChange={(checked) => handleAudioSettingChange('captionsEnabled', checked)}
                />
              </div>

              {/* Audio Descriptions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-muted-foreground" />
                  <Label>Audio Descriptions</Label>
                </div>
                <Switch
                  checked={audioSettings.audioDescriptions}
                  onCheckedChange={(checked) => handleAudioSettingChange('audioDescriptions', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Motor Accessibility Tab */}
        <TabsContent value="motor" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Hand className="h-4 w-4" />
                Motor Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Keyboard Assistance */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Keyboard Assistance</Label>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Keyboard className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Sticky Keys</Label>
                  </div>
                  <Switch
                    checked={motorSettings.stickyKeys}
                    onCheckedChange={(checked) => handleMotorSettingChange('stickyKeys', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Slow Keys</Label>
                  <Switch
                    checked={motorSettings.slowKeys}
                    onCheckedChange={(checked) => handleMotorSettingChange('slowKeys', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Bounce Keys</Label>
                  <Switch
                    checked={motorSettings.bounceKeys}
                    onCheckedChange={(checked) => handleMotorSettingChange('bounceKeys', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Filter Keys</Label>
                  <Switch
                    checked={motorSettings.filterKeys}
                    onCheckedChange={(checked) => handleMotorSettingChange('filterKeys', checked)}
                  />
                </div>
              </div>

              {/* Mouse Assistance */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Mouse Assistance</Label>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Mouse Keys</Label>
                  </div>
                  <Switch
                    checked={motorSettings.mouseKeys}
                    onCheckedChange={(checked) => handleMotorSettingChange('mouseKeys', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Click Assist</Label>
                  <Switch
                    checked={motorSettings.clickAssist}
                    onCheckedChange={(checked) => handleMotorSettingChange('clickAssist', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Dwell Click</Label>
                    <Switch
                      checked={motorSettings.dwellClick}
                      onCheckedChange={(checked) => handleMotorSettingChange('dwellClick', checked)}
                    />
                  </div>
                  
                  {motorSettings.dwellClick && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Dwell Time</Label>
                        <span className="text-sm text-muted-foreground">{motorSettings.dwellTime}ms</span>
                      </div>
                      <Slider
                        value={[motorSettings.dwellTime]}
                        onValueChange={(value) => handleMotorSettingChange('dwellTime', value[0])}
                        min={500}
                        max={5000}
                        step={250}
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Drag Lock</Label>
                  <Switch
                    checked={motorSettings.dragLock}
                    onCheckedChange={(checked) => handleMotorSettingChange('dragLock', checked)}
                  />
                </div>
              </div>

              {/* Alternative Input Methods */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Alternative Input</Label>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Gesture Recognition</Label>
                  <Switch
                    checked={motorSettings.gestureRecognition}
                    onCheckedChange={(checked) => handleMotorSettingChange('gestureRecognition', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Voice Control</Label>
                  </div>
                  <Switch
                    checked={motorSettings.voiceControl}
                    onCheckedChange={(checked) => handleMotorSettingChange('voiceControl', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Eye Tracking</Label>
                  </div>
                  <Switch
                    checked={motorSettings.eyeTracking}
                    onCheckedChange={(checked) => handleMotorSettingChange('eyeTracking', checked)}
                  />
                </div>
              </div>

              {/* Motor Skills Test */}
              <Card className="bg-gray-50 dark:bg-gray-900">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Motor Skills Test</Label>
                    <p className="text-xs text-muted-foreground">
                      Test your motor skills with click accuracy and timing exercises.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      <Target className="h-4 w-4 mr-2" />
                      Start Motor Skills Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cognitive Accessibility Tab */}
        <TabsContent value="cognitive" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Focus className="h-4 w-4" />
                Cognitive Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Reading & Focus */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Reading & Focus</Label>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Reading Mode</Label>
                  </div>
                  <Switch
                    checked={cognitiveSettings.readingMode}
                    onCheckedChange={(checked) => handleCognitiveSettingChange('readingMode', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Focus Mode</Label>
                  <Switch
                    checked={cognitiveSettings.focusMode}
                    onCheckedChange={(checked) => handleCognitiveSettingChange('focusMode', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Distraction Filter</Label>
                  <Switch
                    checked={cognitiveSettings.distractionFilter}
                    onCheckedChange={(checked) => handleCognitiveSettingChange('distractionFilter', checked)}
                  />
                </div>
              </div>

              {/* Interface Simplification */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Interface</Label>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Simplified Interface</Label>
                  <Switch
                    checked={cognitiveSettings.simplifiedInterface}
                    onCheckedChange={(checked) => handleCognitiveSettingChange('simplifiedInterface', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Guided Navigation</Label>
                  <Switch
                    checked={cognitiveSettings.guidedNavigation}
                    onCheckedChange={(checked) => handleCognitiveSettingChange('guidedNavigation', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Progress Indicators</Label>
                  <Switch
                    checked={cognitiveSettings.progressIndicators}
                    onCheckedChange={(checked) => handleCognitiveSettingChange('progressIndicators', checked)}
                  />
                </div>
              </div>

              {/* Task Management */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Task Management</Label>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Task Breakdown</Label>
                  <Switch
                    checked={cognitiveSettings.taskBreakdown}
                    onCheckedChange={(checked) => handleCognitiveSettingChange('taskBreakdown', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Reminders</Label>
                  </div>
                  <Switch
                    checked={cognitiveSettings.reminders}
                    onCheckedChange={(checked) => handleCognitiveSettingChange('reminders', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Auto Save</Label>
                  <Switch
                    checked={cognitiveSettings.autoSave}
                    onCheckedChange={(checked) => handleCognitiveSettingChange('autoSave', checked)}
                  />
                </div>
              </div>

              {/* Session Management */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Session Timeout</Label>
                  <span className="text-sm text-muted-foreground">{cognitiveSettings.sessionTimeout} min</span>
                </div>
                <Slider
                  value={[cognitiveSettings.sessionTimeout]}
                  onValueChange={(value) => handleCognitiveSettingChange('sessionTimeout', value[0])}
                  min={5}
                  max={120}
                  step={5}
                />
                <p className="text-xs text-muted-foreground">
                  Automatically log out after period of inactivity
                </p>
              </div>

              {/* Cognitive Assessment */}
              <Card className="bg-blue-50 dark:bg-blue-950">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Cognitive Assessment</Label>
                    <p className="text-xs text-muted-foreground">
                      Take a brief assessment to personalize cognitive accessibility features.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      <Gauge className="h-4 w-4 mr-2" />
                      Start Assessment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Screen Magnifier */}
      {showMagnifier && visualSettings.magnifierEnabled && (
        <div
          ref={magnifierRef}
          className="fixed pointer-events-none z-50 border-2 border-blue-500 rounded-full overflow-hidden"
          style={{
            left: magnifierPosition.x - 75,
            top: magnifierPosition.y - 75,
            width: 150,
            height: 150,
            background: `url(data:image/svg+xml;base64,${btoa(`
              <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150">
                <defs>
                  <filter id="magnify">
                    <feOffset dx="0" dy="0"/>
                    <feGaussianBlur stdDeviation="0"/>
                  </filter>
                </defs>
                <rect width="150" height="150" fill="white" opacity="0.9"/>
                <text x="75" y="75" text-anchor="middle" font-size="12" fill="gray">
                  Magnified View
                </text>
              </svg>
            `)})`,
            transform: `scale(${visualSettings.magnificationLevel / 100})`
          }}
        />
      )}

      {/* Connection Status */}
      {!isConnected && (
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">
                Connect to DCV session to enable full accessibility functionality and sync settings.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};