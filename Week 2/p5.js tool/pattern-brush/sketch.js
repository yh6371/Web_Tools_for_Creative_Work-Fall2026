let brushSize = 30;
let brushColor = "#111111";
let density = 4;

let brushSizeInput;
let densityInput;
let brushColorInput;

function setup() {
  const canvas = createCanvas(700, 500);
  canvas.parent("canvas-container");

  background(255);
  noStroke();

  brushSizeInput = document.getElementById("brush-size");
  densityInput = document.getElementById("density");
  brushColorInput = document.getElementById("brush-color");

  brushSizeInput.addEventListener("input", updateControls);
  densityInput.addEventListener("input", updateControls);
  brushColorInput.addEventListener("input", updateControls);

  document.getElementById("clear-button").addEventListener("click", clearCanvas);
  document.getElementById("download-button").addEventListener("click", downloadCanvas);
}

function draw() {
  if (
    mouseIsPressed &&
    mouseX >= 0 &&
    mouseX <= width &&
    mouseY >= 0 &&
    mouseY <= height
  ) {
    fill(brushColor);

    for (let i = 0; i < density; i++) {
      const offsetX = random(-brushSize * 0.35, brushSize * 0.35);
      const offsetY = random(-brushSize * 0.35, brushSize * 0.35);

      circle(
        mouseX + offsetX,
        mouseY + offsetY,
        brushSize
      );
    }
  }
}

function updateControls() {
  brushSize = Number(brushSizeInput.value);
  density = Number(densityInput.value);
  brushColor = brushColorInput.value;

  document.getElementById("size-value").textContent = brushSize;
  document.getElementById("density-value").textContent = density;
}

function clearCanvas() {
  background(255);
}

function downloadCanvas() {
  saveCanvas("pattern-brush", "png");
}
