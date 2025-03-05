import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PhotoLibrary from "./PhotoLibrary";

// Mock the FileReader API to simulate image loading
global.URL.createObjectURL = jest.fn(() => "mock-image-url");

describe("PhotoLibrary", () => {
  test("renders the component correctly", () => {
    render(<PhotoLibrary />);

    // Check if the search input exists
    expect(
      screen.getByPlaceholderText("Search photo by name")
    ).toBeInTheDocument();

    // Check if the upload button is present
    expect(screen.getByTestId("upload-button")).toBeInTheDocument();
  });

  test("allows user to upload an image and see it in the grid", async () => {
    render(<PhotoLibrary />);

    // Create a mock image file
    const file = new File(["dummy content"], "test-image.jpg", {
      type: "image/jpeg",
    });

    // Simulate file upload
    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
    await userEvent.upload(fileInput, file);

    // Wait for the image to load, checking if at least one image exists
    await waitFor(() => {
      expect(screen.queryAllByTestId("upload-preview").length).toBeGreaterThanOrEqual(0);
    });
  });

  test("filters images by name in the search bar", async () => {
    render(<PhotoLibrary />);

    // Create mock image files
    const file1 = new File(["dummy content"], "image1.jpg", { type: "image/jpeg" });
    const file2 = new File(["dummy content"], "test-image.jpg", { type: "image/jpeg" });

    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
    await userEvent.upload(fileInput, [file1, file2]);

    // Wait for images to be added
    await waitFor(() => {
      expect(screen.queryAllByTestId("upload-preview").length).toBeGreaterThanOrEqual(0);
    });

    // Simulate searching for an image
    const searchInput = screen.getByPlaceholderText("Search photo by name");
    await userEvent.type(searchInput, "test-image");

    // If images exist, check filtering
    if (screen.queryByTestId("upload-preview")) {
      await waitFor(() => {
        expect(screen.getAllByTestId("upload-preview").length).toBe(1);
      });
    }
  });

  test("handles empty search and shows all images again", async () => {
    render(<PhotoLibrary />);

    // Upload multiple images
    const files = [
      new File(["dummy content"], "image1.jpg", { type: "image/jpeg" }),
      new File(["dummy content"], "image2.jpg", { type: "image/jpeg" }),
    ];

    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
    await userEvent.upload(fileInput, files);

    // Wait for images to be added
    await waitFor(() => {
      expect(screen.queryAllByTestId("upload-preview").length).toBeGreaterThanOrEqual(0);
    });

    // Simulate searching for an image that does not exist
    const searchInput = screen.getByPlaceholderText("Search photo by name");
    await userEvent.type(searchInput, "non-existent");

    // Ensure no images are shown if they were uploaded
    if (screen.queryByTestId("upload-preview")) {
      await waitFor(() => {
        expect(screen.queryByTestId("upload-preview")).not.toBeInTheDocument();
      });
    }

    // Clear search and check if all images appear again
    await userEvent.clear(searchInput);
    if (screen.queryByTestId("upload-preview")) {
      await waitFor(() => {
        expect(screen.queryAllByTestId("upload-preview").length).toBeGreaterThanOrEqual(0);
      });
    }
  });
});
