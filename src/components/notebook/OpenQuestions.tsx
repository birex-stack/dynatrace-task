import { Plus } from 'lucide-react';
import type { OpenQuestion } from '../../data/notebookData';
import './OpenQuestions.css';

interface OpenQuestionsProps {
  questions: OpenQuestion[];
  onAdd?: () => void;
}

export function OpenQuestions({ questions, onAdd }: OpenQuestionsProps) {
  return (
    <section className="open-questions">
      <div className="section-head section-head--with-action">
        <h2 className="section-head__title">Open questions</h2>
        <button type="button" className="section-head__add" onClick={onAdd}>
          <Plus size={12} strokeWidth={2} />
          Add question
        </button>
      </div>
      <div className="open-questions__box">
        <ol className="open-questions__list">
          {questions.map((question, index) => (
            <li key={question.id}>
              <span className="open-questions__num">{index + 1}.</span>
              <span>{question.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
