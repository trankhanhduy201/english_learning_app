import { memo, useCallback, useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../configs/apiConfig";

const DEFAULT_PLACEHOLDER_URL = "https://ui-avatars.com/api/?name=User&background=0D6EFD&color=fff&size=200";

const UploadImageInput = memo(({ 
  name,
  imageUrl = null,
  placeholderUrl = DEFAULT_PLACEHOLDER_URL,
  width = 200,
  height = 200,
  shape = "rounded", // "rounded" | "circle"
}) => {
  const [ preview, setPreview ] = useState(null);
  const [ defaultImage, setDefaultImage ] = useState(null);
  const [ isHover, setIsHover ] = useState(false);
  const [ removeRequested, setRemoveRequested ] = useState(false);
  const inputRef = useRef(null);

  const onChangeImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      const blobImageUrl = URL.createObjectURL(file);
      setPreview(blobImageUrl);
      setRemoveRequested(false);
    }
  }

  const onRemoveImage = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
      return;
    }

    if (defaultImage) {
      setDefaultImage(null);
      setRemoveRequested(true);
    }
  }, [preview, defaultImage]);

  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  useEffect(() => {
    if (!imageUrl) {
      setDefaultImage(null);
      setRemoveRequested(false);
      return;
    }
    setDefaultImage(API_BASE_URL + imageUrl);
    setRemoveRequested(false);
  }, [imageUrl]);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const displayedSrc = preview || defaultImage || placeholderUrl;
  const shapeClassName = shape === "circle" ? "rounded-circle" : "rounded";
  const canRemove = Boolean(preview || defaultImage);

  return (
    <>
      <input 
        ref={inputRef}
        type="file" 
        className="form-control" 
        name={name}
        accept="image/*"
        onChange={onChangeImage}
        style={{ display: "none" }}
      />

      {removeRequested && (
        <input type="hidden" name={`${name}_remove`} value="1" />
      )}

      {displayedSrc && (
        <div className="d-flex justify-content-center">
          <div
            className={`position-relative border ${shapeClassName} overflow-hidden`}
            style={{ width: `${width}px`, height: `${height}px`, cursor: "pointer" }}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            onClick={openFileDialog}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openFileDialog();
              }
            }}
          >
            <img
              className={`img-fluid ${shapeClassName}`}
              src={displayedSrc}
              alt="Selected image"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />

            <div
              className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
              style={{
                background: "rgba(0,0,0,0.35)",
                opacity: isHover ? 1 : 0,
                transition: "opacity 0.15s ease-in-out",
              }}
            >
              <div className="d-flex align-items-center" style={{ gap: "14px" }}>
                <i className="bi bi-camera-fill text-white" style={{ fontSize: "1.5rem" }}></i>
                {canRemove && (
                  <button
                    type="button"
                    className="btn p-0 border-0 bg-transparent text-white"
                    onClick={onRemoveImage}
                    aria-label="Remove image"
                  >
                    <i className="bi bi-trash-fill" style={{ fontSize: "1.4rem" }}></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!displayedSrc && (
        <div className="d-flex justify-content-center">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={openFileDialog}
          >
            <i className="bi bi-camera-fill"></i> Choose image
          </button>
        </div>
      )}
    </>
  )
});

export default UploadImageInput;