type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

type Color = RGB | RGBA | HEX;

abstract class Colors {
    static MAIN: Color = '#65bbf4';
}

let allShapes: Shape[] = [];

let mouseIsDown: boolean = false;
let diffMouseX: number = 0;
let diffMouseY: number = 0;

let selectedShape: Shape | null;

class Canvas {
    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;

    constructor() {
        let canvas = document.getElementById('canvas') as HTMLCanvasElement;

        canvas.width = (document.getElementsByClassName('right')[0] as HTMLElement).offsetWidth;
        canvas.height = window.innerHeight - 10;

        let context = canvas.getContext('2d') as CanvasRenderingContext2D;

        this.canvas = canvas;
        this.context = context;
    }

    public addShape(shape: Shape) {
        allShapes.push(shape);
    }

    public drawShape(shape: Shape) {
        if(shape instanceof Rect) {
            this.context.fillStyle = String(shape.color);
            this.context.fillRect(shape.posX, shape.posY, shape.width, shape.height);  
        }
    }
}

class Shape {
    public posX:   number;
    public posY:   number;
    public width:  number;
    public height: number;

    public movable:       boolean;
    public clickdownable: boolean;
    public dblclickable:  boolean;

    public path2d: Path2D;
}

class Rect implements Shape {
    public width:  number = 100;
    public posY:   number = 100;
    public posX:   number = 100;
    public height: number = 100;

    public color: Colors = Colors.MAIN;

    public movable:       boolean = true;
    public clickdownable: boolean = true;
    public dblclickable:  boolean = true;

    public path2d: Path2D = new Path2D;

    constructor(posX: number, posY: number, width: number, height: number, color: Colors) {
        this.posX   = posX;
        this.posY   = posY;
        this.width  = width;
        this.height = height;
        this.color  = color;

        this.path2d.rect(this.posX, this.posY, this.width, this.height);
    }
}

const canvas: Canvas = new Canvas();

canvas.canvas.addEventListener('mouseup', function(ev: MouseEvent) {
    mouseIsDown = false;
    selectedShape = null;
})

canvas.canvas.addEventListener('mousedown', function(ev: MouseEvent) {
    allShapes.forEach(shape => {
        if(canvas.context.isPointInPath(shape.path2d, ev.offsetX, ev.offsetY) && shape.clickdownable) {
            mouseIsDown = true;
            selectedShape = shape;

            diffMouseX = ev.offsetX - shape.posX;
            diffMouseY = ev.offsetY - shape.posY;
        }
    })
})

canvas.canvas.addEventListener('mousemove', function(ev: MouseEvent) {
    if(mouseIsDown) {
        allShapes[allShapes.indexOf(selectedShape)].posX = ev.offsetX - diffMouseX;
        allShapes[allShapes.indexOf(selectedShape)].posY = ev.offsetY - diffMouseY;
        
        allShapes[allShapes.indexOf(selectedShape)].path2d = new Path2D();
        
        allShapes[allShapes.indexOf(selectedShape)].path2d.rect(
            allShapes[allShapes.indexOf(selectedShape)].posX,
            allShapes[allShapes.indexOf(selectedShape)].posY,
            allShapes[allShapes.indexOf(selectedShape)].width,
            allShapes[allShapes.indexOf(selectedShape)].height
        )        
    }
})

function renderCanvas() {
    canvas.context.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);

    allShapes.forEach(shape => {
        canvas.drawShape(shape);
    })

    window.requestAnimationFrame(renderCanvas);
}

window.requestAnimationFrame(renderCanvas);