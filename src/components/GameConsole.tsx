import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const levelClass: Record<string, string> = {
  success: 'text-leaf',
  warning: 'text-amber-light',
  error: 'text-danger',
  info: 'text-sage',
};

const levelPrefix: Record<string, string> = {
  success: '✓',
  warning: '⚠',
  error: '✗',
  info: '›',
};

const GameConsole: React.FC = () => {
  const logs = useSelector((state: RootState) => state.gameLog.logs);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="max-h-48 overflow-y-auto rounded-lg bg-bark/90 p-3 font-mono text-xs text-sage md:max-h-52">
      {logs.length === 0 ? (
        <p className="text-sage/50">No logs yet...</p>
      ) : (
        logs.map((log) => (
          <div key={log.id} className={`py-0.5 ${levelClass[log.level] ?? 'text-sage'}`}>
            <span className="mr-2 opacity-70">{levelPrefix[log.level] ?? '›'}</span>
            {log.message}
          </div>
        ))
      )}
      <div ref={consoleEndRef} />
    </div>
  );
};

export default GameConsole;
