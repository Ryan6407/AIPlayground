# AI Playground

A Scratch/graph-like **website** where you can plug and play with **layers** and **model building blocks** (LayerNorm, Linear, Conv2d, etc.) and design models to train with.

## Run the app

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## Build for production

```bash
npm run build
npm run preview
```

## UI overview

- **Left sidebar (Blocks palette)**  
  Click any layer to add it to the canvas: Input, Linear, Conv2d, LayerNorm, BatchNorm, ReLU, GELU, Dropout, MaxPool, AdaptiveAvgPool, Flatten, Output.

- **Canvas**  
  - **Scroll** to move around a large canvas.  
  - **Drag** a block to reposition it.  
  - **Connect blocks**: Click a block’s **output** port (green), then click another block’s **input** port (blue). A line is drawn between them.  
  - **Clear**: Use the header “Clear” button to remove all blocks and connections.

## Tech

- **Vite** + **React 18** + **TypeScript**
- No Expo/React Native – runs in the browser only
