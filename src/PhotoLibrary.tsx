import { useState } from "react";
import { useDropzone } from "react-dropzone";

// Custom type for images with additional details
interface ImageFile {
  file: File; // The actual File object
  preview: string; // Preview URL for image
  title: string;
  description: string;
  lastModified: number;
  lastModifiedDate: Date;
  name: string;
  size: number;
  type: string;
}

export default function PhotoLibrary() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [visibleImages, setVisibleImages] = useState<number>(12);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
  
      try {
        const response = await fetch("http://localhost:5000/upload", {
          method: "POST",
          body: formData,
        });
  
        const result = await response.json();
        if (response.ok) {
          setImages((prev) => [
            ...prev,
            {
              file,
              preview: result.url, // Use S3 URL
              title: "",
              description: "",
              lastModified: file.lastModified,
              lastModifiedDate: new Date(file.lastModified),
              name: file.name,
              size: file.size,
              type: file.type,
            },
          ]);
        } else {
          console.error("Upload failed:", result.error);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    });
  };  

  const { getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
  });

  const loadMore = () => {
    setVisibleImages((prev) => prev + 12);
  };

  const handleButtonClick = () => {
    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    fileInput?.click();
  };

  const filteredImages = images.filter((image) =>
    image.name.toLowerCase().includes(searchQuery.toLowerCase()) // Search by image name
  );

  return (
    <div className="container">
      {/* Dropzone container */}
      <div className="dropzone-container">
        <input {...getInputProps()} data-testid="file-input"/>
        <button className="upload-button" data-testid="upload-button" onClick={handleButtonClick}>
          +
        </button>
        <div className="search-container">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Search photo by name"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div> 

      <div className="image-grid-wrapper">
        <div className="image-grid">
          {filteredImages.slice(0, visibleImages).map((file, index) => (
            <div key={index} className="image-item">
              <img
                src={file.preview}
                data-testid="upload-preview"
                className="image"
              />
            </div>
          ))}
        </div>
      </div>

      {visibleImages < filteredImages.length && (
        <button className="load-more-button" onClick={loadMore}>
          Load More
        </button>
      )}
    </div>
  );
}
