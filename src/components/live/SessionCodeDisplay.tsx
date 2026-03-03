import { useState } from 'react';

interface SessionCodeDisplayProps {
  code: string;
}

const SessionCodeDisplay = ({ code }: SessionCodeDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const joinUrl = `${window.location.origin}/live/join/${code}`;
    await navigator.clipboard.writeText(joinUrl);
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
      <button
        onClick={handleCopy}
        className="mt-4 px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg
                   text-white/70 text-sm font-body transition-all duration-200"
      >
        {copied ? 'Link Copied!' : 'Copy Join Link'}
      </button>
    </div>
  );
};

export default SessionCodeDisplay;
