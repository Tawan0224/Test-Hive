interface LiveQuestionCardProps {
  index: number;
  totalQuestions: number;
  questionText: string;
}

const LiveQuestionCard = ({ index, totalQuestions, questionText }: LiveQuestionCardProps) => {
  return (
    <div className="w-full text-center">
      <p className="text-white/40 text-sm font-body mb-3">
        Question {index + 1} of {totalQuestions}
      </p>
      <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white leading-snug">
        {questionText}
      </h2>
    </div>
  );
};

export default LiveQuestionCard;
