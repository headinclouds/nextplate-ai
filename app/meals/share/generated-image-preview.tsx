import LoadingOverlay from '@/components/ui/loading-overlay';
import classes from './page.module.css';

interface GeneratedImagePreviewProps {
  imagePath: string;
  isGenerating: boolean;
  imageFormAction: (formData: FormData) => void;
  onApply: () => void;
}

export default function GeneratedImagePreview({
  imagePath,
  isGenerating,
  imageFormAction,
  onApply,
}: GeneratedImagePreviewProps) {
  return (
    <div className={classes.generatedImagePreview}>
      <div className={classes.generatedImageFrame}>
        <img src={imagePath} alt="AI generated meal" />
        {isGenerating && <LoadingOverlay message="Generating image..." />}
      </div>
      <p className={classes.generatedActions}>
        <button type="button" onClick={onApply}>
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
  );
}
