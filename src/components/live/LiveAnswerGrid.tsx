interface LiveAnswerGridProps {
  options: { text: string }[];
  onAnswer: (index: number) => void;
  disabled: boolean;
  selectedOption: number | null;
  correctOptionIndex?: number | null; // shown after question closes
}

const OPTION_COLORS = [
  { bg: 'bg-red-500/20 border-red-500/40 hover:bg-red-500/30', selected: 'bg-red-500/40 border-red-500' },
  { bg: 'bg-blue-500/20 border-blue-500/40 hover:bg-blue-500/30', selected: 'bg-blue-500/40 border-blue-500' },
  { bg: 'bg-yellow-500/20 border-yellow-500/40 hover:bg-yellow-500/30', selected: 'bg-yellow-500/40 border-yellow-500' },
  { bg: 'bg-green-500/20 border-green-500/40 hover:bg-green-500/30', selected: 'bg-green-500/40 border-green-500' },
];

const LiveAnswerGrid = ({ options, onAnswer, disabled, selectedOption, correctOptionIndex }: LiveAnswerGridProps) => {
  const showResults = correctOptionIndex !== null && correctOptionIndex !== undefined;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
      {options.map((option, i) => {
        const colors = OPTION_COLORS[i % OPTION_COLORS.length];
        const isSelected = selectedOption === i;
        const isCorrect = showResults && i === correctOptionIndex;
        const isWrong = showResults && isSelected && i !== correctOptionIndex;

        let className = `relative px-6 py-5 rounded-xl border-2 text-left transition-all duration-200 font-body text-white `;

        if (showResults) {
          if (isCorrect) {
            className += 'bg-green-500/30 border-green-400 ring-2 ring-green-400/50';
          } else if (isWrong) {
            className += 'bg-red-500/30 border-red-400';
          } else {
            className += 'bg-white/5 border-white/10 opacity-50';
          }
        } else if (isSelected) {
          className += `${colors.selected} ring-2 ring-white/30`;
        } else if (disabled) {
          className += 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed';
        } else {
          className += `${colors.bg} cursor-pointer`;
        }

        return (
          <button
            key={i}
            onClick={() => !disabled && onAnswer(i)}
            disabled={disabled}
            className={className}
          >
            <span className="text-base sm:text-lg">{option.text}</span>
          </button>
        );
      })}
    </div>
  );
};

export default LiveAnswerGrid;
