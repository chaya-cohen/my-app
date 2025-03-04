import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhotoLibrary from './PhotoLibrary'; // Update this path if necessary

// Mock the FileReader API to simulate image loading
global.URL.createObjectURL = jest.fn(() => 'mock-image-url');

describe('PhotoLibrary', () => {
  test('renders the component correctly', () => {
    render(<PhotoLibrary />);

    // Check if the search input exists
    expect(screen.getByPlaceholderText('Search photo by name')).toBeInTheDocument();

    // Check if the upload button is present
    expect(screen.getByTestId("upload-button")).toBeInTheDocument();

  });

  test('allows user to upload images and see them in the grid', async () => {
    render(<PhotoLibrary />);

    // Simulate a file input change event (e.g., uploading an image)
    const file = new File(["dummy content"], "test-image.jpg", { type: "image/jpeg" });

    const fileInput = screen.getByTestId("file-input");
    fireEvent.change(fileInput, {
        target: { files: [file] },
    });

    // Wait for image to load and check if the image preview appears
    await waitFor(() => {
      expect(screen.getByTestId("upload-preview")).toBeInTheDocument();
    });

  });

  test("filters images by name in the search bar", async () => {
    render(<PhotoLibrary />);
  
    // Create a mock image file
    const file = new File(["dummy content"], "test-image.jpg", { type: "image/jpeg" });

    const fileInput = screen.getByTestId("file-input");
    fireEvent.change(fileInput, {
        target: { files: [file] },
    });
  
    // Wait for the image to be added to the state and rendered in the DOM
    await waitFor(() => {
      expect(screen.getByTestId("upload-preview")).toBeInTheDocument();
    });
  
    // Simulate searching for the image
    const searchInput = screen.getByPlaceholderText("Search photo by name");
    userEvent.type(searchInput, "test-image");
  
    // Wait for the image to still be displayed after filtering
    await waitFor(() => {
      expect(screen.getByTestId("upload-preview")).toBeInTheDocument();
    });
  });
});
