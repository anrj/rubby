import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { PhysicalPosition, PhysicalSize } from "@tauri-apps/api/dpi";
import { listen } from "@tauri-apps/api/event";
import type { UnlistenFn } from "@tauri-apps/api/event";

const moveListeners = new Map<string, UnlistenFn>();
const resizeListeners = new Map<string, UnlistenFn>();
const windowCache = new Map<string, WebviewWindow>();

const activeBubbleOffsets = new Map<string, { x: number; y: number }>();

const DEFAULT_OFFSET_X = 150;
const DEFAULT_OFFSET_Y = 41;

const openWin = (
  id: string,
  url: string,
  width: number,
  height: number,
  initX: number,
  initY: number,
) => {
  return new WebviewWindow(id, {
    url,
    width,
    height,
    x: initX,
    y: initY,
    decorations: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    hiddenTitle: true,
    shadow: false,
    skipTaskbar: true,
    visible: false,
  });
};

let positionUpdateQueue = new Map<string, { x: number; y: number }>();
let animationFrameId: number | null = null;

const throttledPositionUpdate = () => {
  if (animationFrameId === null) {
    animationFrameId = requestAnimationFrame(async () => {
      for (const [id, duckPos] of positionUpdateQueue.entries()) {
        try {
          const bubbleWin = windowCache.get(id);
          const offsets = activeBubbleOffsets.get(id);

          if (bubbleWin && offsets) {
            const size = await bubbleWin.outerSize();

            const targetX = Math.round(duckPos.x + offsets.x);
            const targetY = Math.round(duckPos.y + offsets.y - size.height);

            await bubbleWin.setPosition(new PhysicalPosition(targetX, targetY));
          }
        } catch (e) {
          console.error("Movement error:", e);
        }
      }
      positionUpdateQueue.clear();
      animationFrameId = null;
    });
  }
};

export const openBubble = async (
  text: string = "",
  id: string = "bubble",
  logicalOffsetX: number = DEFAULT_OFFSET_X,
  logicalOffsetY: number = DEFAULT_OFFSET_Y,
) => {
  // console.log(
  //   `Opening bubble with offsets: X=${logicalOffsetX}, Y=${logicalOffsetY}`,
  // );
  await closeBubble(id);

  const encoded = encodeURIComponent(text);
  const mainWindow = getCurrentWebviewWindow();
  const currentPos = await mainWindow.outerPosition();
  const scaleFactor = await mainWindow.scaleFactor();

  const physicalOffsetX = Math.round(logicalOffsetX * scaleFactor);
  const physicalOffsetY = Math.round(logicalOffsetY * scaleFactor);
  activeBubbleOffsets.set(id, { x: physicalOffsetX, y: physicalOffsetY });

  const initWidth = 500;
  const initHeight = 200;

  const physicalX = Math.round(currentPos.x + physicalOffsetX);
  const physicalY = Math.round(currentPos.y + physicalOffsetY - initHeight);

  const logicalX = physicalX / scaleFactor;
  const logicalY = physicalY / scaleFactor;

  const win = openWin(
    id,
    `/chat-bubble.html?text=${encoded}&id=${id}`,
    initWidth,
    initHeight,
    logicalX,
    logicalY,
  );
  windowCache.set(id, win);

  const unlistenResize = await listen("bubble_resize", async (event: any) => {
    const payload = event.payload as {
      width: number;
      height: number;
      id: string;
    };
    if (payload.id !== id) return;

    try {
      const finalWidth = Math.ceil(payload.width * scaleFactor);
      const finalHeight = Math.ceil(payload.height * scaleFactor);

      const freshPos = await mainWindow.outerPosition();
      const offsets = activeBubbleOffsets.get(id) || {
        x: physicalOffsetX,
        y: physicalOffsetY,
      };

      const anchorX = Math.round(freshPos.x + offsets.x);
      const anchorY = Math.round(freshPos.y + offsets.y);

      const finalX = anchorX;
      const finalY = anchorY - finalHeight;

      await win.setSize(new PhysicalSize(finalWidth, finalHeight));
      await win.setPosition(new PhysicalPosition(finalX, finalY));

      await win.setResizable(false);
      await win.show();
      await win.setFocus();
    } catch (e) {
      console.error("Resize error:", e);
      await win.show();
    }
  });
  resizeListeners.set(id, unlistenResize);

  const unlistenMove = await mainWindow.listen(
    "tauri://move",
    async (event) => {
      const { x, y } = event.payload as { x: number; y: number };
      positionUpdateQueue.set(id, { x, y });
      throttledPositionUpdate();
    },
  );
  moveListeners.set(id, unlistenMove);

  return id;
};

export const closeBubble = async (id: string) => {
  activeBubbleOffsets.delete(id);

  const moveListener = moveListeners.get(id);
  if (moveListener) {
    moveListener();
    moveListeners.delete(id);
  }

  const resizeListener = resizeListeners.get(id);
  if (resizeListener) {
    resizeListener();
    resizeListeners.delete(id);
  }

  try {
    const win = windowCache.get(id);
    if (win) {
      await win.close();
      windowCache.delete(id);
    } else {
      const w = await WebviewWindow.getByLabel(id);
      if (w) await w.close();
    }
  } catch (e) {}
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
