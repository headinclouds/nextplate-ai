'use client';

import { useState } from 'react';

import { improveRecipe } from '@/app/actions/improve-recipe';
import classes from './page.module.css';

type ImprovementAction = 'detailed' | 'emojis' | 'fix';

interface RecipeInstructionsProps {
  value: string;
  onChange: (value: string) => void;
}

const improvementButtons: Array<{ action: ImprovementAction; label: string }> = [
  { action: 'detailed', label: 'Improve with AI' },
  { action: 'emojis', label: 'Add emojis' },
  { action: 'fix', label: 'Fix grammar' },
];

export default function RecipeInstructions({ value, onChange }: RecipeInstructionsProps) {
  const [message, setMessage] = useState('');
  const [isImproving, setIsImproving] = useState(false);

  async function handleImprove(action: ImprovementAction) {
    if (!value.trim()) {
      setMessage('Please add instructions before improving them with AI.');
      return;
    }

    setMessage('');
    setIsImproving(true);

    try {
      onChange(await improveRecipe(value, action));
    } catch {
      setMessage('Unable to improve the instructions. Please try again.');
    } finally {
      setIsImproving(false);
    }
  }

  return (
    <p>
      <label htmlFor="instructions">Instructions</label>
      <textarea
        id="instructions"
        name="instructions"
        rows={10}
        required
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setMessage('');
        }}
      ></textarea>
      <span className={classes.improveActions}>
        {improvementButtons.map(({ action, label }) => (
          <button
            key={action}
            type="button"
            onClick={() => handleImprove(action)}
            disabled={isImproving}
            aria-busy={isImproving}
          >
            {label}
          </button>
        ))}
      </span>
      {message && (
        <span className={classes.error} role="alert">
          {message}
        </span>
      )}
    </p>
  );
}
