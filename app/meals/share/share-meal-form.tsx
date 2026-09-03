'use client';

import { useEffect, useState } from 'react';
import { improveRecipe } from '@/app/actions/improve-recipe';
import { useFormState } from 'react-dom';

import ImagePicker from '@/components/meals/image-picker';
import LoadingOverlay from '@/components/ui/loading-overlay';
import { generateMealImage, shareMeal } from '@/app/actions/meals';
import classes from './page.module.css';

const initialState = {
  message: null,
};

const initialImageState = {
  message: null,
  imagePath: '',
  requestId: 0,
};

export default function ShareMealForm() {
  const [state, formAction] = useFormState(shareMeal, initialState);
  const [imageState, imageFormAction] = useFormState(generateMealImage, initialImageState);
  const [recipe, setRecipe] = useState('');
  const [appliedImagePath, setAppliedImagePath] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmittingMeal, setIsSubmittingMeal] = useState(false);
  const [generateClientMessage, setGenerateClientMessage] = useState('');
  const [shareClientMessage, setShareClientMessage] = useState('');

  const handleImprove = async () => {
    const improvedText = await improveRecipe(recipe, 'detailed');
    setRecipe(improvedText);
  };
  const hasGeneratedCandidate = !!imageState.imagePath && imageState.imagePath !== appliedImagePath;

  function handleApplyGeneratedImage() {
    setAppliedImagePath(imageState.imagePath);
  }

  function handleManualImagePick() {
    setAppliedImagePath('');
  }

  function handleFormSubmit(event) {
    const form = event.currentTarget;
    const submitter = event.nativeEvent?.submitter;
    const actionIntent = submitter?.dataset?.intent;

    if (actionIntent === 'generate') {
      const title = form.elements.namedItem('title')?.value?.trim() || '';
      const summary = form.elements.namedItem('summary')?.value?.trim() || '';

      if (!title || !summary) {
        event.preventDefault();
        setGenerateClientMessage('Please fill in title and summary before generating an image.');
        setIsGenerating(false);
        setIsSubmittingMeal(false);
        return;
      }

      setGenerateClientMessage('');
      setShareClientMessage('');
      setIsGenerating(true);
      setIsSubmittingMeal(false);
      return;
    }

    // Share flow
    if (!form.checkValidity()) {
      setIsSubmittingMeal(false);
      return;
    }

    const imageInput = form.elements.namedItem('image');
    const hasUploadedImage = !!imageInput?.files?.[0];
    const hasGeneratedImage =
      typeof appliedImagePath === 'string' && appliedImagePath.trim() !== '';

    if (!hasUploadedImage && !hasGeneratedImage) {
      event.preventDefault();
      setShareClientMessage('Please pick an image or generate one with AI.');
      setIsSubmittingMeal(false);
      return;
    }

    setGenerateClientMessage('');
    setShareClientMessage('');
    setIsSubmittingMeal(true);
    setIsGenerating(false);
  }

  useEffect(() => {
    // Stop the generate loader only after image action response is received.
    setIsGenerating(false);
    setGenerateClientMessage('');
  }, [imageState.requestId]);

  useEffect(() => {
    if (isSubmittingMeal && state.message) {
      setIsSubmittingMeal(false);
    }
  }, [state, isSubmittingMeal]);

  return (
    <form className={classes.form} action={formAction} onSubmit={handleFormSubmit}>
      <p>
        <label htmlFor="title">Title</label>
        <input type="text" id="title" name="title" required />
      </p>
      <p>
        <label htmlFor="summary">Short Summary</label>
        <input type="text" id="summary" name="summary" required />
      </p>
      <p>
        <label htmlFor="instructions">Instructions</label>
        <textarea
          id="instructions"
          name="instructions"
          rows={10}
          required
          value={recipe}
          onChange={(e) => setRecipe(e.target.value)}
        ></textarea>
        <button type="button" onClick={handleImprove}>
          Improve with AI
        </button>
      </p>
      <input type="hidden" name="generatedImage" value={appliedImagePath} />

      <ImagePicker
        label="Your image"
        name="image"
        required={!appliedImagePath}
        externalPreview={appliedImagePath}
        onImagePick={handleManualImagePick}
        isLoading={isGenerating && !hasGeneratedCandidate}
      />

      {!hasGeneratedCandidate && (
        <p className={classes.actions}>
          <button
            type="submit"
            data-intent="generate"
            formAction={imageFormAction}
            formNoValidate
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate with AI'}
          </button>
        </p>
      )}

      {(generateClientMessage || imageState.message) && (
        <p className={classes.info} aria-live="polite">
          {generateClientMessage || imageState.message}
        </p>
      )}

      {hasGeneratedCandidate && (
        <div className={classes.generatedImagePreview}>
          <div className={classes.generatedImageFrame}>
            <img src={imageState.imagePath} alt="AI generated meal" />
            {isGenerating && <LoadingOverlay message="Generating image..." />}
          </div>
          <p className={classes.generatedActions}>
            <button type="button" onClick={handleApplyGeneratedImage}>
              Apply
            </button>
            <button
              type="submit"
              data-intent="generate"
              formAction={imageFormAction}
              formNoValidate
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Retry'}
            </button>
          </p>
        </div>
      )}

      {state.message && (
        <p className={classes.error} aria-live="polite">
          {state.message}
        </p>
      )}
      {shareClientMessage && (
        <p className={classes.error} aria-live="polite">
          {shareClientMessage}
        </p>
      )}
      <p className={classes.actions}>
        <button type="submit" disabled={isGenerating || isSubmittingMeal}>
          {isSubmittingMeal ? 'Submitting...' : 'Share Meal'}
        </button>
      </p>
    </form>
  );
}
