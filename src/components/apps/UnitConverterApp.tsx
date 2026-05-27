import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Category = 'length' | 'weight' | 'temperature' | 'volume' | 'time' | 'data' | 'speed';

const units: Record<Category, Record<string, number>> = {
  length: { Meter: 1, Kilometer: 1000, Centimeter: 0.01, Millimeter: 0.001, Mile: 1609.34, Yard: 0.9144, Foot: 0.3048, Inch: 0.0254 },
  weight: { Kilogram: 1, Gram: 0.001, Pound: 0.453592, Ounce: 0.0283495, Ton: 1000 },
  volume: { Liter: 1, Milliliter: 0.001, Gallon: 3.78541, Cup: 0.24, 'Fluid Oz': 0.0295735 },
  time: { Second: 1, Minute: 60, Hour: 3600, Day: 86400, Week: 604800 },
  data: { Byte: 1, Kilobyte: 1024, Megabyte: 1048576, Gigabyte: 1073741824, Terabyte: 1099511627776 },
  speed: { 'm/s': 1, 'km/h': 0.277778, mph: 0.44704, knot: 0.514444 },
  temperature: { Celsius: 1, Fahrenheit: 1, Kelvin: 1 },
};

function convertTemp(val: number, from: string, to: string): number {
  let c = val;
  if (from === 'Fahrenheit') c = (val - 32) * 5 / 9;
  if (from === 'Kelvin') c = val - 273.15;
  if (to === 'Celsius') return c;
  if (to === 'Fahrenheit') return c * 9 / 5 + 32;
  return c + 273.15;
}

export function UnitConverterApp() {
  const [cat, setCat] = useState<Category>('length');
  const [from, setFrom] = useState('Meter');
  const [to, setTo] = useState('Kilometer');
  const [value, setValue] = useState('1');

  const handleCat = (c: Category) => {
    setCat(c);
    const keys = Object.keys(units[c]);
    setFrom(keys[0]);
    setTo(keys[1] || keys[0]);
  };

  const num = parseFloat(value) || 0;
  const result = cat === 'temperature'
    ? convertTemp(num, from, to)
    : (num * units[cat][from]) / units[cat][to];

  return (
    <div className="h-full flex flex-col bg-background p-4 overflow-auto">
      <h2 className="text-lg font-semibold mb-4">Unit Converter</h2>
      <Tabs value={cat} onValueChange={(v) => handleCat(v as Category)}>
        <TabsList className="grid grid-cols-7 w-full">
          {Object.keys(units).map(c => (
            <TabsTrigger key={c} value={c} className="capitalize text-xs">{c}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={cat} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">From</label>
            <div className="flex gap-2">
              <Input type="number" value={value} onChange={e => setValue(e.target.value)} />
              <Select value={from} onValueChange={setFrom}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(units[cat]).map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-center">
            <Button variant="ghost" size="icon" onClick={() => { const t = from; setFrom(to); setTo(t); }}>
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">To</label>
            <div className="flex gap-2">
              <Input value={result.toLocaleString(undefined, { maximumFractionDigits: 6 })} readOnly />
              <Select value={to} onValueChange={setTo}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(units[cat]).map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-6 p-4 rounded-lg bg-muted text-center">
            <div className="text-2xl font-bold">{result.toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
            <div className="text-xs text-muted-foreground mt-1">{value} {from} = {result.toLocaleString(undefined, { maximumFractionDigits: 6 })} {to}</div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
