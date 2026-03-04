import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface SessionCodeDisplayProps {
  code: string;
}

const SessionCodeDisplay = ({ code }: SessionCodeDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const joinUrl = `${window.location.origin}/live/join/${code}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="text-center">
      <p className="text-white/50 text-sm font-body mb-2 uppercase tracking-wider">Session Code</p>
      <div className="flex items-center justify-center gap-3">
        <span className="text-5xl sm:text-6xl font-mono font-bold text-white tracking-[0.3em] select-all">
          {code}
        </span>
      </div>

      {/* QR Code */}
      <div className="mt-6 flex justify-center">
        <div className="p-4 bg-white rounded-xl">
          <QRCodeSVG
            value={joinUrl}
            size={160}
            level="M"
          />
        </div>
      </div>
      <p className="mt-2 text-white/30 text-xs font-body">Scan to join</p>

      <button
        onClick={handleCopy}
        className="mt-4 px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg
                   text-white/70 text-sm font-body transition-all duration-200"
      >
        {copied ? 'Code Copied!' : 'Copy Join Code'}
      </button>
    </div>
  );
};

export default SessionCodeDisplay;
