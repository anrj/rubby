console.log("Duck window loaded!");

const duck = document.getElementById("duck") as HTMLElement;

if (!duck) {
  console.error("Duck element not found!");
} else {
  console.log("Duck element found, setting up simple drag behavior");

  // Add the drag region attribute to the duck element
  duck.setAttribute("data-tauri-drag-region", "");

  // Click detection for chat interface (if needed in future)
  duck.addEventListener("click", () => {
    console.log("Duck clicked!");
    // TODO: Open chat interface when clicked
  });
}
