import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhotoLibrary from './PhotoLibrary'; // Update this path if necessary


beforeEach(() => {
  // Mock the fetch to avoid calling real URLs
  jest.spyOn(global, 'fetch').mockImplementation((url: RequestInfo | URL) => {
    if (typeof url === 'string') {
      if (url.includes('upload')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({ url: "mock-upload-url.jpg" }),
            { status: 200, statusText: 'OK' }
          )
        );
      }

      if (url.includes('get-images')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({ images: ["mock-upload-url.jpg", "mock-image-2.jpg"] }), 
            { status: 200, statusText: 'OK' }
          )
        );
      }
    }
    
    return Promise.reject(new Error("Unknown API request"));
  });
});


afterEach(() => {
  jest.restoreAllMocks();
});

describe('PhotoLibrary', () => {
  test('renders the component correctly', () => {
    render(<PhotoLibrary />);

    // Check if the search input exists
    expect(screen.getByPlaceholderText('Search photo by name')).toBeInTheDocument();

    // Check if the upload button is present
    expect(screen.getByTestId("upload-button")).toBeInTheDocument();
  });

  test('mocks upload and displays image in grid', async () => {
    render(<PhotoLibrary />);

    // Mock the image data as if it was uploaded
    const mockImages = ["mock-upload-url.jpg", "mock-image-2.jpg"];

    // Wait for the images to be rendered and check if the image preview appears
    await waitFor(() => {
      const uploadPreviews = screen.getAllByTestId("upload-preview"); // Get all images with the test ID
      expect(uploadPreviews).toHaveLength(mockImages.length); // Ensure the correct number of images are rendered

      // Check if each image's src attribute matches the mock data
      mockImages.forEach((url, index) => {
        expect(uploadPreviews[index]).toHaveAttribute("src", url);
      });
    });
  });

  test("filters images by name in the search bar", async () => {
    render(<PhotoLibrary />);
  
    // Wait for the mocked images to load
    await waitFor(() => {
      const uploadPreviews = screen.getAllByTestId("upload-preview");
      expect(uploadPreviews).toHaveLength(2); // Expecting 2 mocked images to be rendered
    });
  
    // Simulate searching for the image
    const searchInput = screen.getByPlaceholderText("Search photo by name");
    userEvent.type(searchInput, "mock-image");
  
    // Wait for images to be filtered based on the search query
    await waitFor(() => {
      const uploadPreviews = screen.getAllByTestId("upload-preview");
  
      expect(uploadPreviews).toHaveLength(1); // Mocked images should still match "mock-image"
      uploadPreviews.forEach((img) => {
        expect(img).toHaveAttribute("src", expect.stringContaining("mock-image"));
      });
    });
  });  
});