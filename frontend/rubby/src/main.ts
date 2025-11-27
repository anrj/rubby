console.log("Duck window loaded!");

window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

const duck = document.getElementById("duck") as HTMLElement;

if (!duck) {
  console.error("Duck element not found!");
} else {
  console.log("Duck element found, setting up simple drag behavior");

  duck.setAttribute("data-tauri-drag-region", "");

  duck.addEventListener("click", () => {
    console.log("Duck clicked!");
    // TODO: Open chat interface when clicked
  });
}
