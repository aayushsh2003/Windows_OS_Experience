import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Copy,
  Check,
  Link,
  QrCode,
  Sparkles,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

export function QrCodeApp() {
  const [text, setText] = useState("https://aayushkimehnat.vercel.app/");
  const [size, setSize] = useState(260);
  const [color, setColor] = useState("#111827");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [copied, setCopied] = useState(false);

  const qrUrl = useMemo(() => {
    const fg = color.replace("#", "");
    const bg = bgColor.replace("#", "");
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
      text
    )}&color=${fg}&bgcolor=${bg}`;
  }, [text, size, color, bgColor]);

  const presets = [
    { name: "Dark", fg: "#111827", bg: "#ffffff" },
    { name: "Ocean", fg: "#0f172a", bg: "#dbeafe" },
    { name: "Purple", fg: "#581c87", bg: "#f3e8ff" },
    { name: "Emerald", fg: "#064e3b", bg: "#d1fae5" },
  ];

  const downloadQRCode = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qr-code.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error(error);
    }
  };

  const resetAll = () => {
    setSize(260);
    setColor("#111827");
    setBgColor("#ffffff");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col overflow-hidden font-sans">
      {/* HEADER */}
      <header className="p-6 sticky top-0 bg-gray-900 z-20 border-b border-gray-700 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-3 mb-4 md:mb-0">
          <div className="h-12 w-12 flex items-center justify-center bg-gray-800 rounded-full border border-gray-700 shadow-lg">
            <QrCode className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">QR Code Generator</h1>
            <p className="text-sm text-gray-400">Stylish & Responsive QR Creator</p>
          </div>
        </div>
        {/* Input & Buttons */}
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <input
            type="text"
            placeholder="Enter URL or Text..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-gray-400"
            onKeyDown={(e) => e.key === "Enter" && downloadQRCode()}
          />
          <Button onClick={downloadQRCode} className="h-10 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400">
            <Download className="h-4 w-4 mr-2" /> Download
          </Button>
          <Button onClick={copyContent} className="h-10 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 relative">
            {copied ? (
              <Check className="h-4 w-4 mr-2 text-green-400" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button onClick={resetAll} className="h-10 px-4 rounded-lg border border-gray-600 hover:bg-gray-700">
            <RotateCcw className="h-4 w-4 mr-2" /> Reset
          </Button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 md:grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* LEFT PANEL */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-700"
        >
          {/* Textarea */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Link className="h-4 w-4" /> URL or Text
            </label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="https://example.com"
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          {/* Size Slider */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-gray-300">QR Size</label>
              <span className="text-sm font-semibold bg-cyan-500/20 px-3 py-1 rounded-full">{size}px</span>
            </div>
            <Slider
              value={[size]}
              min={180}
              max={500}
              step={10}
              onValueChange={(value) => setSize(value[0])}
            />
          </div>
          {/* Colors */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Foreground Color */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-300">Foreground</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-12 w-full cursor-pointer rounded-lg border border-gray-600"
              />
            </div>
            {/* Background Color */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-300">Background</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-12 w-full cursor-pointer rounded-lg border border-gray-600"
              />
            </div>
          </div>
          {/* Preset Themes */}
          <div className="mb-4">
            <div className="flex items-center mb-2 text-sm font-semibold text-gray-300">
              <Sparkles className="h-4 w-4 mr-2" /> Themes
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setColor(preset.fg);
                    setBgColor(preset.bg);
                  }}
                  className="rounded-lg border border-gray-600 p-3 hover:bg-gray-700 transition"
                >
                  <div className="flex justify-center mb-2">
                    <div
                      className="h-4 w-4 rounded-full border border-gray-500"
                      style={{ backgroundColor: preset.fg }}
                    />
                    <div
                      className="h-4 w-4 rounded-full border border-gray-500 ml-2"
                      style={{ backgroundColor: preset.bg }}
                    />
                  </div>
                  <p className="text-xs text-gray-300 text-center">{preset.name}</p>
                </button>
              ))}
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={downloadQRCode}
              className="flex-1 h-11 rounded-lg bg-cyan-500 hover:bg-cyan-400"
            >
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
            <Button
              onClick={copyContent}
              className="flex-1 h-11 rounded-lg bg-gray-700 hover:bg-gray-600"
            >
              {copied ? (
                <Check className="mr-2 h-4 w-4 text-green-400" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              onClick={resetAll}
              className="flex-1 h-11 rounded-lg border border-gray-600 hover:bg-gray-700"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </motion.div>

        {/* RIGHT PANEL - Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-center items-center"
        >
          <div className="w-full max-w-md bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-700">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold">Live Preview</h2>
              <p className="mt-2 text-sm text-gray-400">QR updates instantly</p>
            </div>
            {/* QR Code Image */}
            <div className="flex justify-center mb-4">
              <motion.div
                key={qrUrl}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="bg-white p-4 rounded-[28px] shadow-xl"
              >
                <img
                  src={qrUrl}
                  alt="QR Code"
                  className="rounded-xl object-contain"
                  style={{
                    width: Math.min(size, 320),
                    height: Math.min(size, 320),
                  }}
                />
              </motion.div>
            </div>
            {/* Display URL / Text */}
            <div className="bg-gray-700 rounded-lg p-3 text-sm text-gray-300 truncate">
              {text}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}