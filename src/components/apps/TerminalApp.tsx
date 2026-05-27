import { useState, useRef, useEffect } from 'react';

export function TerminalApp() {
  const [lines, setLines] = useState<string[]>([
    'Windows Terminal [Version 11.0.22631]',
    '(c) WebOS. All rights reserved.',
    '',
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [lines]);

  const handleCommand = (cmd: string) => {
    const newLines = [...lines, `C:\\Users\\User> ${cmd}`];
    const c = cmd.trim().toLowerCase();
    if (c === 'help') {
      newLines.push('Available commands: help, date, time, cls, echo, whoami, ver, dir, color');
    } else if (c === 'date') {
      newLines.push(new Date().toLocaleDateString());
    } else if (c === 'time') {
      newLines.push(new Date().toLocaleTimeString());
    } else if (c === 'cls') {
      setLines([]); setInput(''); return;
    } else if (c.startsWith('echo ')) {
      newLines.push(cmd.slice(5));
    } else if (c === 'whoami') {
      newLines.push('User');
    } else if (c === 'ver') {
      newLines.push('WebOS [Version 11.0.22631]');
    } else if (c === 'dir') {
      newLines.push(' Volume in drive C has no label.');
      newLines.push(' Directory of C:\\Users\\User');
      newLines.push('');
      newLines.push(' <DIR>  Desktop');
      newLines.push(' <DIR>  Documents');
      newLines.push(' <DIR>  Downloads');
      newLines.push(' <DIR>  Music');
      newLines.push(' <DIR>  Pictures');
      newLines.push(' <DIR>  Videos');
    } else if (c) {
      newLines.push(`'${cmd}' is not recognized as an internal or external command.`);
    }
    newLines.push('');
    setLines(newLines);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full font-mono text-xs" style={{ background: 'hsl(220, 20%, 8%)' }}>
      <div className="flex-1 overflow-y-auto p-3 win-scrollbar" style={{ color: 'hsl(0, 0%, 85%)' }}>
        {lines.map((line, i) => (
          <div key={i} className="whitespace-pre leading-5">{line}</div>
        ))}
        <div className="flex items-center">
          <span>C:\Users\User&gt; </span>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCommand(input)}
            className="flex-1 bg-transparent outline-none border-none"
            style={{ color: 'hsl(0, 0%, 85%)' }}
            autoFocus
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
