import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Upload, 
  Type, 
  Palette, 
  MoveHorizontal, 
  MoveVertical,
  FlipHorizontal,
  Maximize,
  Minimize,
  Edit3,
  X,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useDropzone } from 'react-dropzone';
import { parseFile } from '@/lib/file-parser';
import { cn } from '@/lib/utils';

export default function App() {
  // State
  const [text, setText] = useState<string>("Bem-vindo ao Teleprompter Pro. Importe um arquivo ou comece a digitar aqui para começar.");
  const [isScrolling, setIsScrolling] = useState(false);
  const [speed, setSpeed] = useState(5); // 1-20
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#000000");
  const [isMirrored, setIsMirrored] = useState(false);
  const [isVertical, setIsVertical] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [scrollPos, setScrollPos] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Scroll logic
  const animate = (time: number) => {
    if (lastTimeRef.current !== null) {
      const deltaTime = time - lastTimeRef.current;
      const pixelsPerSecond = speed * 20;
      const moveAmount = (pixelsPerSecond * deltaTime) / 1000;
      
      setScrollPos(prev => prev + moveAmount);
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isScrolling) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      lastTimeRef.current = null;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isScrolling, speed]);

  // Reset scroll
  const handleReset = () => {
    setIsScrolling(false);
    setScrollPos(0);
  };

  // File drop
  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      try {
        const content = await parseFile(file);
        setText(content);
      } catch (err) {
        console.error("Error parsing file:", err);
        alert("Erro ao importar arquivo. Verifique o formato.");
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    multiple: false
  } as any);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const SettingsContent = () => (
    <div className="flex flex-col gap-8 py-4">
      <section className="space-y-4">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
          <Palette className="w-3 h-3" /> Cores
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] text-neutral-500">Texto</Label>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={textColor} 
                onChange={(e) => setTextColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
              />
              <span className="text-[10px] font-mono uppercase">{textColor}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] text-neutral-500">Fundo</Label>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={bgColor} 
                onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
              />
              <span className="text-[10px] font-mono uppercase">{bgColor}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
          <FlipHorizontal className="w-3 h-3" /> Espelhamento
        </h3>
        <div className="flex items-center justify-between">
          <Label htmlFor="mirror" className="text-sm">Modo Espelho</Label>
          <Switch id="mirror" checked={isMirrored} onCheckedChange={setIsMirrored} />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
          {isVertical ? <MoveVertical className="w-3 h-3" /> : <MoveHorizontal className="w-3 h-3" />} Orientação
        </h3>
        <div className="flex items-center justify-between">
          <Label htmlFor="orientation" className="text-sm">Vertical (90°)</Label>
          <Switch id="orientation" checked={isVertical} onCheckedChange={setIsVertical} />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
          <Type className="w-3 h-3" /> Texto
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm">Tamanho</Label>
              <span className="text-xs font-mono">{fontSize}px</span>
            </div>
            <Slider 
              value={[fontSize]} 
              onValueChange={(v) => setFontSize(v[0])} 
              max={150} 
              min={10} 
              step={2}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm">Velocidade</Label>
              <div className="flex items-center gap-3 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-white hover:bg-neutral-800"
                  onClick={() => setSpeed(Math.max(0.5, speed - 1))}
                >
                  <span className="text-xl font-bold">−</span>
                </Button>
                <span className="text-sm font-mono w-8 text-center">{speed}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-white hover:bg-neutral-800"
                  onClick={() => setSpeed(Math.min(20, speed + 1))}
                >
                  <span className="text-xl font-bold">+</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-auto pt-8">
        <Button variant="outline" className="w-full border-neutral-800 hover:bg-neutral-900 h-12" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" /> Resetar Posição
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-neutral-900 text-white overflow-hidden font-sans select-none touch-none">
      {/* Header / Controls Bar */}
      {!isScrolling && (
        <motion.header 
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="flex items-center justify-between px-4 md:px-6 py-4 bg-neutral-950 border-b border-neutral-800 z-50 shrink-0"
        >
          <div className="flex items-center gap-2 md:gap-4">
            <h1 className="text-lg md:text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent truncate max-w-[120px] md:max-w-none">
              Teleprompter Pro
            </h1>
            <div className="hidden md:block h-6 w-px bg-neutral-800" />
            <div className="flex items-center gap-1 md:gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditing(!isEditing)}
                className={cn("h-9 px-3", isEditing && "bg-neutral-800")}
              >
                <Edit3 className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">{isEditing ? "Visualizar" : "Editar"}</span>
              </Button>
              <Dialog>
                <DialogTrigger render={<Button variant="ghost" size="sm" className="h-9 px-3" />}>
                  <Upload className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Importar</span>
                </DialogTrigger>
                <DialogContent className="bg-neutral-900 border-neutral-800 text-white w-[90vw] max-w-lg rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Importar Texto</DialogTitle>
                  </DialogHeader>
                  <div 
                    {...getRootProps()} 
                    className={cn(
                      "mt-4 p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer",
                      isDragActive ? "border-blue-500 bg-blue-500/10" : "border-neutral-700 hover:border-neutral-500"
                    )}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-10 h-10 text-neutral-500" />
                    <p className="text-center text-neutral-400 text-sm">
                      Arraste arquivos .txt, .pdf ou .docx aqui<br/>
                      ou toque para selecionar
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-[10px] text-neutral-500 uppercase tracking-widest">Velocidade</Label>
                <Slider 
                  value={[speed]} 
                  onValueChange={(v) => setSpeed(v[0])} 
                  max={20} 
                  min={0.5} 
                  step={0.5}
                  className="w-24"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-[10px] text-neutral-500 uppercase tracking-widest">Tamanho</Label>
                <Slider 
                  value={[fontSize]} 
                  onValueChange={(v) => setFontSize(v[0])} 
                  max={150} 
                  min={10} 
                  step={2}
                  className="w-24"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger render={<Button variant="outline" size="icon" className="bg-transparent border-neutral-700 h-9 w-9" />}>
                  <Settings className="w-4 h-4" />
                </SheetTrigger>
                <SheetContent side="right" className="bg-neutral-950 border-neutral-800 text-white w-[85vw] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle className="text-white">Configurações</SheetTitle>
                  </SheetHeader>
                  <SettingsContent />
                </SheetContent>
              </Sheet>
              
              <Button variant="outline" size="icon" onClick={toggleFullscreen} className="hidden md:flex bg-transparent border-neutral-700 h-9 w-9">
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </Button>

              <Button 
                variant={isScrolling ? "destructive" : "default"} 
                onClick={() => setIsScrolling(!isScrolling)}
                className="h-9 px-4 md:px-6 font-bold"
              >
                {isScrolling ? <Pause className="w-4 h-4 md:mr-2" /> : <Play className="w-4 h-4 md:mr-2" />}
                <span className="hidden sm:inline">{isScrolling ? "Parar" : "Iniciar"}</span>
              </Button>
            </div>
          </div>
        </motion.header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex bg-black">
        {/* Sidebar Settings (Hidden on mobile or when scrolling) */}
        <AnimatePresence>
          {!isScrolling && (
            <motion.aside 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="hidden lg:flex w-72 bg-neutral-950 border-r border-neutral-800 p-6 flex-col gap-8 overflow-y-auto shrink-0"
            >
              <SettingsContent />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Display Area */}
        <div 
          className="flex-1 relative flex items-center justify-center transition-all duration-500 cursor-pointer"
          style={{ backgroundColor: bgColor }}
          onClick={() => !isEditing && setIsScrolling(!isScrolling)}
        >
          {isEditing ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-full p-6 md:p-12 bg-transparent border-none outline-none resize-none font-sans"
              style={{ color: textColor, fontSize: `${fontSize}px` }}
              placeholder="Digite seu texto aqui..."
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div 
              className={cn(
                "w-full h-full overflow-hidden relative",
                isMirrored && "scale-x-[-1]",
                isVertical && "rotate-90"
              )}
            >
              {/* Reading Guide Line */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20 z-10 pointer-events-none" />
              <div className="absolute top-[calc(50%-20px)] left-0 w-4 h-10 bg-blue-500/50 rounded-r z-10" />
              
              <div 
                ref={scrollRef}
                className="absolute inset-0 p-6 md:p-12 whitespace-pre-wrap text-center leading-relaxed"
                style={{ 
                  color: textColor, 
                  fontSize: `${fontSize}px`,
                  transform: `translateY(-${scrollPos}px)`,
                  transition: isScrolling ? 'none' : 'transform 0.3s ease-out'
                }}
              >
                <div style={{ height: '45vh' }} />
                {text}
                <div style={{ height: '55vh' }} />
              </div>
            </div>
          )}

          {/* Unified Floating Controls when scrolling */}
          <AnimatePresence>
            {isScrolling && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl p-2 rounded-full border border-white/10 shadow-2xl">
                  {/* Speed Controls */}
                  <div className="flex items-center gap-1 px-2 border-r border-white/10">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="w-10 h-10 rounded-full text-white hover:bg-white/10"
                      onClick={() => setSpeed(Math.max(0.5, speed - 1))}
                    >
                      <span className="text-xl font-bold">−</span>
                    </Button>
                    <div className="flex flex-col items-center min-w-[40px]">
                      <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-tighter">Vel</span>
                      <span className="text-sm font-mono font-bold leading-none">{speed}</span>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="w-10 h-10 rounded-full text-white hover:bg-white/10"
                      onClick={() => setSpeed(Math.min(20, speed + 1))}
                    >
                      <span className="text-xl font-bold">+</span>
                    </Button>
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center gap-3 px-2">
                    <Button 
                      size="lg" 
                      variant="secondary" 
                      className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 border border-white/10"
                      onClick={() => setIsScrolling(false)}
                    >
                      <Pause className="w-6 h-6" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="secondary" 
                      className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 border border-white/10"
                      onClick={handleReset}
                    >
                      <RotateCcw className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer / Status */}
      {!isScrolling && (
        <footer className="px-4 py-2 bg-neutral-950 border-t border-neutral-800 flex justify-between items-center text-[10px] text-neutral-500 uppercase tracking-widest shrink-0">
          <div className="flex gap-4">
            <span>Palavras: {text.trim() ? text.trim().split(/\s+/).length : 0}</span>
            <span className="hidden sm:inline">Caracteres: {text.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Android Ready
          </div>
        </footer>
      )}
    </div>
  );
}
