'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import LoadingOverlay from '@/components/ui/loading-overlay';
import classes from './image-picker.module.css';

type ImagePickerProps = {
  label: string;
  name: string;
  required?: boolean;
  externalPreview?: string;
  onImagePick?: () => void;
  isLoading?: boolean;
};

export default function ImagePicker({
  label,
  name,
  required = true,
  externalPreview,
  onImagePick,
  isLoading = false,
}: ImagePickerProps) {
  const imageInput = useRef<HTMLInputElement>(null);
  const [pickedImage, setPickedImage] = useState<string | null>(null);

  function handlePickClick() {
    imageInput.current?.click();
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setPickedImage(null);
      return;
    }

    if (onImagePick) {
      onImagePick();
    }

    const fileReader = new FileReader();
    fileReader.onload = () => {
      if (typeof fileReader.result === 'string') {
        setPickedImage(fileReader.result);
      } else {
        setPickedImage(null);
      }
    };
    fileReader.readAsDataURL(file);
  }

  return (
    <div className={classes.picker}>
      <label htmlFor={name}>{label}</label>
      <div className={classes.controls}>
        <div className={classes.preview}>
          {!pickedImage && !externalPreview && <p>No image picked yet.</p>}
          {pickedImage && (
            <img src={pickedImage} alt="The image selected by the user." />
          )}
          {!pickedImage && externalPreview && (
            <img src={externalPreview} alt="The applied generated image." />
          )}
          {isLoading && <LoadingOverlay message="Generating..." />}
        </div>
        <input
          className={classes.input}
          type="file"
          id={name}
          accept="image/png, image/jpeg"
          name={name}
          ref={imageInput}
          onChange={handleImageChange}
          aria-required={required}
        />
        <button type="button" onClick={handlePickClick}>
          Pick an Image
        </button>
      </div>
    </div>
  );
}
