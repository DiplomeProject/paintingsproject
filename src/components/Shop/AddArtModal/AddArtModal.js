import React, { useState, useEffect, useRef } from 'react';
import styles from './AddArtModal.module.css';
import axios from "axios";
import closeIcon from '../../../assets/closeCross.svg';
import addImageIcon from '../../../assets/image-placeholder-icon.svg';
import url  from '../../../URL';

const getOptions = (config, title) => {
  const section = config.find(f => f.title === title);
  return section?.options[0]?.subOptions || [];
};

const lerp = (current, target, factor) => current * (1 - factor) + target * factor;

const AddArtModal = ({ onClose, categories, filterConfig, existingPaintingId = null }) => {
  const styleOptions = getOptions(filterConfig, "STYLE");
  const formatOptions = getOptions(filterConfig, "FORMAT");

  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0] || '');
  const [style, setStyle] = useState('');
  const [fileFormat, setFileFormat] = useState('');
  const [sizeW, setSizeW] = useState('');
  const [sizeH, setSizeH] = useState('');
  const [about, setAbout] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState([]); 
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const MAX_IMAGES = 10;

  const leftColumnRef = useRef(null);
  const rightFormRef = useRef(null);
  const leftScroll = useRef({ current: 0, target: 0 });
  const rightScroll = useRef({ current: 0, target: 0 });
  const animationFrameId = useRef(null);
  const lerpFactor = 0.1;

  // --- Scroll animation ---
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    startScrollAnimation();
    return () => {
      document.body.style.overflow = 'auto';
      animationFrameId.current && cancelAnimationFrame(animationFrameId.current);
      images.forEach(img => img.file && URL.revokeObjectURL(img.preview));
    };
  }, []);

  const smoothScrollLoop = () => {
    let needsUpdate = false;
    [[leftColumnRef, leftScroll],[rightFormRef, rightScroll]].forEach(([ref, scroll]) => {
      if (!ref.current) return;
      const { current, target } = scroll.current;
      if (Math.abs(target - current) > 0.1) {
        scroll.current.current = lerp(current, target, lerpFactor);
        ref.current.scrollTop = scroll.current.current;
        needsUpdate = true;
      } else if (current !== target) {
        scroll.current.current = target;
        needsUpdate = true;
      }
    });

    if (needsUpdate)
      animationFrameId.current = requestAnimationFrame(smoothScrollLoop);
    else 
      animationFrameId.current = null;
  };

  const startScrollAnimation = () => {
    if (!animationFrameId.current)
      animationFrameId.current = requestAnimationFrame(smoothScrollLoop);
  };

  const handleWheelScroll = e => {
    let didAnimate = false;
    [[leftColumnRef, leftScroll],[rightFormRef, rightScroll]].forEach(([ref, scroll]) => {
      if (!ref.current) return;

      const { scrollHeight, clientHeight } = ref.current;
      if (scrollHeight <= clientHeight) return;

      const maxScroll = scrollHeight - clientHeight;
      const newTarget = Math.max(
        0,
        Math.min(scroll.current.target + e.deltaY, maxScroll)
      );

      if (newTarget !== scroll.current.target) {
        scroll.current.target = newTarget;
        didAnimate = true;
      }
    });

    if (didAnimate) {
      e.preventDefault();
      startScrollAnimation();
    }
  };

  // --- Load existing painting (preview fix kept) ---
  useEffect(() => {
    if (!existingPaintingId) return;

    const fetchPainting = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/paintings/${existingPaintingId}`, { withCredentials: true });

        if (res.data.success) {
          const painting = res.data.painting;

          setName(painting.title || '');
          setAbout(painting.description || '');
          setPrice(painting.price || '');
          setStyle(painting.style || '');
          setCategory(painting.category || categories[0] || '');

          const galleryImages = painting.gallery.map(img => ({
            preview: img,
            isExisting: true
          }));

          if (painting.mainImage) {
            galleryImages.unshift({ preview: painting.mainImage, isExisting: true });
          }

          setImages(galleryImages.slice(0, MAX_IMAGES));
        }
      } catch (err) {
        console.error("Error fetching painting:", err);
      }
    };

    fetchPainting();
  }, [existingPaintingId]);

  // --- Add file FIXED ---
  const handleFileAdd = e => {
    if (!e.target.files.length) return;

    const files = Array.from(e.target.files).slice(0, MAX_IMAGES - images.length);

    const newFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    // FIX — do NOT reverse order, just prepend safely
    setImages(prev => [...newFiles, ...prev]);

    e.target.value = null;
  };

  // --- Delete image FIXED ---
  const handleImageDelete = (e, index) => {
    e.stopPropagation();

    setImages(prev => {
      const toRemove = prev[index];
      if (toRemove?.file) URL.revokeObjectURL(toRemove.preview);

      return prev.filter((_, i) => i !== index);
    });
  };

  // --- Validation ---
  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!category) newErrors.category = "Category is required";
    if (!style) newErrors.style = "Style is required";
    //if (!fileFormat && !existingPaintingId) newErrors.fileFormat = "Format is required";
    if (!sizeW || !sizeH) newErrors.size = "Size is required";
    if (!about.trim()) newErrors.about = "About is required";
    if (!price.trim()) newErrors.price = "Price is required";
    if (!images.length) newErrors.images = "At least one image is required";

    setErrors(newErrors);
    return !Object.keys(newErrors).length;
  };

  // --- Submit stays untouched ---
  const handleAddArt = async () => {
    if (!validate()) return;
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", name);
      formData.append("description", about);
      formData.append("category", category);
      formData.append("style", style);
      formData.append("size", `${sizeW}x${sizeH}`);
      formData.append("format", fileFormat);
      formData.append("price", price);

      images.forEach((img, index) => {
        if (!img.isExisting) {
          formData.append(index === 0 ? "image" : "images", img.file);
        }
      });

      const endpoint = existingPaintingId
        ? `http://localhost:8080/api/paintings/${existingPaintingId}`
        : "http://localhost:8080/upload";

      const response = await axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });

      if (response.data.success) {
        alert("Art saved successfully!");
        onClose();
        window.location.reload();
      } else {
        alert(response.data.message || "Failed to save art");
      }
    } catch (err) {
      console.error(err);
      alert("Server error while saving art");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverlayClick = e => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()} onWheel={handleWheelScroll}>
        
        <button className={styles.closeBtnFixed} onClick={onClose}>
          <img src={closeIcon} alt="Close"/>
        </button>

        {/* LEFT COLUMN */}
        <div className={styles.leftColumn} ref={leftColumnRef}>
          <div className={`${styles.imageUploadArea} ${errors.images ? styles.errorBorder : ''}`}>
            <img src={addImageIcon} alt="Upload" className={styles.uploadIcon}/>
            <input
              type="file"
              accept="image/*"
              className={styles.fileInput}
              onChange={handleFileAdd}
              multiple
              disabled={images.length >= MAX_IMAGES}
            />
          </div>

          {errors.images && !images.length && (
            <span className={styles.error}>{errors.images}</span>
          )}

          <div className={styles.imageStack}>
            {images.map((img, i) => (
              <div key={i} className={styles.stackImagePreview}>
                <img src={img.preview} alt={`preview ${i}`} className={styles.imagePreview}/>
                <div className={styles.deleteOverlay} onClick={(e)=>handleImageDelete(e,i)}>
                  <img src={closeIcon} alt="Delete" className={styles.deleteIcon}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.rightColumn}>
          <div className={styles.scrollableForm} ref={rightFormRef}>

            <div className={styles.formGroup}>
              <p>Name</p>
              <textarea
                className={`${styles.formInput} ${errors.name ? styles.errorBorderInput : ''}`}
                value={name}
                onChange={e => { setName(e.target.value); errors.name && setErrors(prev => ({...prev, name:null})); }}
                maxLength={150}
                rows={2}
                placeholder="Enter art name..."
              />
              <span className={styles.charCounter}>{name.length} / 150</span>
              {errors.name && <span className={styles.error}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <p>Category</p>
              <select className={styles.formSelect} value={category} onChange={e=>setCategory(e.target.value)}>
                {categories.map(c=>(
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <p>Style</p>
              <select className={styles.formSelect} value={style} onChange={e=>setStyle(e.target.value)}>
                <option value="">Select style...</option>
                {styleOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <p>File format</p>
              <select className={styles.formSelect} value={fileFormat} onChange={e=>setFileFormat(e.target.value)}>
                <option value="">Select format...</option>
                {formatOptions.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              {errors.fileFormat && <span className={styles.error}>{errors.fileFormat}</span>}
            </div>

            <div className={styles.formGroup}>
              <p>Size</p>
              <div className={`${styles.sizeInputGroup} ${errors.size ? styles.errorBorderInput : ''}`}>
                <input type="text" value={sizeW} placeholder="W" className={styles.formInput} onChange={e=>setSizeW(e.target.value.replace(/\D/g,''))}/>
                <span>X</span>
                <input type="text" value={sizeH} placeholder="H" className={styles.formInput} onChange={e=>setSizeH(e.target.value.replace(/\D/g,''))}/>
              </div>
              {errors.size && <span className={styles.error}>{errors.size}</span>}
            </div>

            <div className={`${styles.formGroup} ${styles.aboutGroup}`}>
              <p>About</p>
              <textarea 
                className={`${styles.formInput} ${errors.about ? styles.errorBorder : ''}`} 
                value={about} 
                onChange={e=>{setAbout(e.target.value); errors.about && setErrors(prev=>({...prev,about:null}));}}
              />
              {errors.about && <span className={styles.error}>{errors.about}</span>}
            </div>

            <div className={styles.actions}>
              <div className={styles.priceInputWrapper}>
                <input 
                  type="text"
                  value={price}
                  onChange={e=>setPrice(e.target.value.replace(/\D/g,''))}
                  className={`${styles.priceInput} ${errors.price ? styles.errorBorderInput : ''}`}
                  placeholder="Price"
                />
                {errors.price && <span className={styles.errorPrice}>{errors.price}</span>}
              </div>

              <button className={styles.createBtn} onClick={handleAddArt} disabled={submitting}>
                {submitting ? 'Uploading...' : 'Add'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AddArtModal;


