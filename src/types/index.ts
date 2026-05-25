// Tool types
export type ToolType = 'select' | 'draw' | 'line' | 'rectangle' | 'circle' | 'triangle' | 'polygon' | 'text' | 'eraser' | 'dimension' | 'pan';

// Point on canvas
export interface Point {
  x: number;
  y: number;
}

// Base shape interface
export interface BaseShape {
  id: string;
  type: ToolType;
  x: number;
  y: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
  layer: number;
  selected: boolean;
}

// Line shape
export interface LineShape extends BaseShape {
  type: 'line';
  x2: number;
  y2: number;
}

// Rectangle shape
export interface RectangleShape extends BaseShape {
  type: 'rectangle';
  width: number;
  height: number;
  rx: number;
  ry: number;
}

// Circle shape
export interface CircleShape extends BaseShape {
  type: 'circle';
  radius: number;
}

// Triangle shape
export interface TriangleShape extends BaseShape {
  type: 'triangle';
  points: Point[];
}

// Polygon shape
export interface PolygonShape extends BaseShape {
  type: 'polygon';
  points: Point[];
  sides: number;
}

// Free draw shape
export interface DrawShape extends BaseShape {
  type: 'draw';
  points: Point[];
}

// Text shape
export interface TextShape extends BaseShape {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  textAlign: CanvasTextAlign;
}

// Dimension shape
export interface DimensionShape extends BaseShape {
  type: 'dimension';
  x2: number;
  y2: number;
  length: number;
  angle: number;
}

// Union of all shapes
export type Shape = LineShape | RectangleShape | CircleShape | TriangleShape | PolygonShape | DrawShape | TextShape | DimensionShape;

// Canvas viewport state
export interface ViewportState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

// Drawing state
export interface DrawingState {
  isDrawing: boolean;
  startPoint: Point | null;
  currentPoint: Point | null;
  tempShape: Shape | null;
}

// Snap state
export interface SnapState {
  enabled: boolean;
  snapToGrid: boolean;
  snapToPoint: boolean;
  snapDistance: number;
  gridSize: number;
}

// Layer
export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
}

// App state
export interface AppState {
  tool: ToolType;
  shapes: Shape[];
  viewport: ViewportState;
  snap: SnapState;
  layers: Layer[];
  activeLayer: string;
  selectedShapeIds: string[];
  history: Shape[][];
  historyIndex: number;
  showGrid: boolean;
  showSidebar: boolean;
  showProperties: boolean;
  showLayers: boolean;
  darkMode: boolean;
}
