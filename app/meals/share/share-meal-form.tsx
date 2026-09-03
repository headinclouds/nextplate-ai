'use client';

import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';

import ImagePicker from '@/components/meals/image-picker';
import { generateMealImage, shareMeal } from '@/app/actions/meals';
import GeneratedImagePreview from './generated-image-preview';
import classes from './page.module.css';
import RecipeInstructions from './recipe-instructions';

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
      <RecipeInstructions value={recipe} onChange={setRecipe} />
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
        <GeneratedImagePreview
          imagePath={imageState.imagePath}
          isGenerating={isGenerating}
          imageFormAction={imageFormAction}
          onApply={handleApplyGeneratedImage}
        />
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
