import { invoke } from "@tauri-apps/api/core";

console.log("Duck window loaded!");

const duck = document.getElementById("duck") as HTMLElement;

if (!duck) {
  console.error("Duck element not found!");
} else {
  console.log("Duck element found, setting up event listeners");

  let monitorInitialized = false;
  let hitMask: boolean[][] | null = null;
  let hitMaskReady = false;

  // Load duck image and create hit mask for pixel-perfect detection
  const createHitMask = async (): Promise<boolean[][]> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        console.log("Duck image loaded, creating hit mask...");

        // Create offscreen canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image to canvas
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Create 2D boolean array for hit detection
        // true = opaque (clickable), false = transparent (pass-through)
        const mask: boolean[][] = [];
        const alphaThreshold = 50; // Pixels with alpha > 50 are considered opaque

        for (let y = 0; y < canvas.height; y++) {
          mask[y] = [];
          for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            const alpha = data[index + 3];
            mask[y][x] = alpha > alphaThreshold;
          }
        }

        console.log(
          `Hit mask created: ${canvas.width}x${canvas.height} pixels`,
        );
        resolve(mask);
      };

      img.onerror = () => {
        reject(new Error("Failed to load duck image"));
      };

      // Load the duck image
      img.src = "./src/assets/duck.png";
    });
  };

  // Check if a point is within the opaque area of the duck
  const isPointOverDuck = (x: number, y: number): boolean => {
    if (!hitMask || !hitMaskReady) return false;

    const rect = duck.getBoundingClientRect();

    // Convert window coordinates to element-relative coordinates
    const relativeX = x - rect.left;
    const relativeY = y - rect.top;

    // Convert to image coordinates (accounting for CSS scaling)
    const scaleX = hitMask[0]?.length || 1;
    const scaleY = hitMask.length;
    const imageX = Math.floor((relativeX / rect.width) * scaleX);
    const imageY = Math.floor((relativeY / rect.height) * scaleY);

    // Check bounds
    if (imageY < 0 || imageY >= hitMask.length) return false;
    if (imageX < 0 || imageX >= hitMask[imageY].length) return false;

    return hitMask[imageY][imageX];
  };

  // Send hit mask to Rust backend for pixel-perfect click-through
  const sendHitMaskToBackend = async () => {
    if (!hitMask || !hitMaskReady) return;

    // Flatten 2D array to 1D for efficient transfer
    const flatData: boolean[] = [];
    for (let y = 0; y < hitMask.length; y++) {
      for (let x = 0; x < hitMask[y].length; x++) {
        flatData.push(hitMask[y][x]);
      }
    }

    const hitMaskData = {
      width: hitMask[0]?.length || 0,
      height: hitMask.length,
      data: flatData,
    };

    try {
      await invoke("set_hit_mask", { hitMask: hitMaskData });
      console.log("Hit mask sent to backend for pixel-perfect detection");
    } catch (error) {
      console.error("Failed to send hit mask to backend:", error);
    }
  };

  /* ============================================================================
     DEBUG VISUALIZATION
     ============================================================================

     Instructions: Uncomment the sections below to enable:
     1. visualizeHitMask() - Shows green (draggable) and red (pass-through) overlay
     2. createCursorFeedback() - Shows real-time cursor position and hit detection
     3. Press 'D' key to toggle visualization on/off

     ============================================================================ */

  // DEBUG: Visualize the hit mask overlay
  const visualizeHitMask = () => {
    if (!hitMask || !hitMaskReady) {
      console.log("Hit mask not ready for visualization");
      return;
    }

    console.log("Creating hit mask visualization...");

    const rect = duck.getBoundingClientRect();

    // Create canvas overlay - positioned exactly over the duck element
    const canvas = document.createElement("canvas");
    canvas.id = "hit-mask-debug";
    canvas.style.position = "absolute";
    canvas.style.top = rect.top + "px";
    canvas.style.left = rect.left + "px";
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    canvas.style.pointerEvents = "none"; // Don't interfere with mouse events
    canvas.style.zIndex = "1000";
    canvas.width = hitMask[0]?.length || 0;
    canvas.height = hitMask.length;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create image data for visualization
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    // Draw hit mask (green = draggable, red = pass-through)
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        if (hitMask[y][x]) {
          // Opaque areas in semi-transparent green
          data[index] = 0; // R
          data[index + 1] = 255; // G
          data[index + 2] = 0; // B
          data[index + 3] = 100; // A (semi-transparent)
        } else {
          // Transparent areas in semi-transparent red
          data[index] = 255; // R
          data[index + 1] = 0; // G
          data[index + 2] = 0; // B
          data[index + 3] = 50; // A (more transparent)
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    document.body.appendChild(canvas);

    console.log(
      "Hit mask visualized! Green = draggable, Red = pass-through. Press 'D' to toggle.",
    );
  };

  // Add real-time cursor feedback overlay
  const createCursorFeedback = () => {
    const feedback = document.createElement("div");
    feedback.id = "cursor-feedback";
    feedback.style.position = "absolute";
    feedback.style.top = "5px";
    feedback.style.left = "5px";
    feedback.style.background = "rgba(0, 0, 0, 0.8)";
    feedback.style.color = "white";
    feedback.style.padding = "5px";
    feedback.style.fontSize = "10px";
    feedback.style.fontFamily = "monospace";
    feedback.style.pointerEvents = "none";
    feedback.style.zIndex = "10000";
    feedback.style.borderRadius = "3px";
    document.body.appendChild(feedback);
    return feedback;
  };

  let feedbackElement: HTMLElement | null = null;

  // Update cursor feedback on mouse move
  duck.addEventListener("mousemove", (e: MouseEvent) => {
    if (!feedbackElement) {
      feedbackElement = createCursorFeedback();
    }

    const isOver = isPointOverDuck(e.clientX, e.clientY);
    const rect = duck.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;

    feedbackElement.innerHTML = `
      Cursor: ${e.clientX}, ${e.clientY}<br>
      Relative: ${Math.round(relativeX)}, ${Math.round(relativeY)}<br>
      <span style="color: ${isOver ? "#00ff00" : "#ff0000"}">
        ${isOver ? "✓ DRAGGABLE" : "✗ PASS-THROUGH"}
      </span>
    `;
    feedbackElement.style.display = "block";
  });

  duck.addEventListener("mouseleave", () => {
    if (feedbackElement) {
      feedbackElement.style.display = "none";
    }
  });

  // Toggle visualization with 'D' key
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "d") {
      const existing = document.getElementById("hit-mask-debug");
      if (existing) {
        existing.remove();
        console.log("Hit mask visualization hidden");
      } else {
        visualizeHitMask();
      }
    }
  });

  /* ============================================================================
     END DEBUG VISUALIZATION
     ============================================================================ */

  // Initialize hit mask and click-through monitor
  const initClickThroughMonitor = async () => {
    if (monitorInitialized) return;

    try {
      // Create hit mask from duck image
      hitMask = await createHitMask();
      hitMaskReady = true;

      const rect = duck.getBoundingClientRect();

      // Send full duck bounds to Rust backend
      // The backend will handle coarse detection, frontend handles fine-grained
      const duckBounds = {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      };

      // Start click-through monitor with hit mask for pixel-perfect detection
      const flatData: boolean[] = [];
      for (let y = 0; y < hitMask.length; y++) {
        for (let x = 0; x < hitMask[y].length; x++) {
          flatData.push(hitMask[y][x]);
        }
      }

      const hitMaskData = {
        width: hitMask[0]?.length || 0,
        height: hitMask.length,
        data: flatData,
      };

      await invoke("start_click_through_monitor", {
        duckBounds,
        hitMask: hitMaskData,
      });
      monitorInitialized = true;
      console.log("Click-through monitor started with pixel-perfect detection");
      console.log("Press 'D' to toggle hit mask visualization");

      // Auto-show visualization for debugging
      setTimeout(visualizeHitMask, 500);
    } catch (error) {
      console.error("Failed to start click-through monitor:", error);
      // Fallback: use simple bounds-based detection
      hitMaskReady = false;
    }
  };

  // Initialize after a short delay to ensure window is ready
  setTimeout(initClickThroughMonitor, 100);

  // Check if click is on opaque part before dragging
  duck.addEventListener("mousedown", async (e: MouseEvent) => {
    e.preventDefault();
    console.log("Starting drag");

    try {
      await invoke("start_window_drag");
      console.log("Drag completed");
    } catch (error) {
      console.error("Error during drag:", error);
    }
  });

  // Click detection for chat interface
  duck.addEventListener("click", (e: MouseEvent) => {
    console.log("Duck clicked!");
    // TODO: Open chat interface when clicked
  });

  console.log("All event listeners attached");
}
