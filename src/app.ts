type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

type Color = RGB | RGBA | HEX;

abstract class Colors {
    static MAIN: Color = '#65bbf4';
    static USER: Color = '#2b5378';
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
        if(shape instanceof RectPnt) {
            this.context.fillStyle = String(shape.color);
            this.context.fillRect(shape.posX, shape.posY, shape.width, shape.height);

            this.context.fillStyle = String(shape.pntColor);
            this.context.fillRect(shape.point.posX, shape.point.posY, shape.point.width, shape.point.height);
        }
        else if(shape instanceof Point) {
            this.context.fillStyle = String(shape.color);
            this.context.fillRect(shape.posX, shape.posY, shape.width, shape.height);
        }
    }
}

class Shape {
    public color: Colors;

    public movable: boolean;
    public clickdownable: boolean;
    public dblclickable: boolean;
    public contextmenuable: boolean;

    public path2d: Path2D;
}

class Rect implements Shape {
    public posX: number = 100;
    public posY: number = 100;

    public width: number = 100;
    public height: number = 100;

    public color: Colors = Colors.USER;

    public movable: boolean = true;
    public clickdownable: boolean = true;
    public dblclickable: boolean = true;
    public contextmenuable: boolean = true;

    public path2d: Path2D = new Path2D;

    public connection_above: RectPnt[];
    public connection_below: RectPnt[];

    constructor(posX: number = 100, posY: number = 100, width: number = 100, height: number = 100, color: Colors = Colors.USER) {
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
        this.color = color;

        this.path2d.rect(this.posX, this.posY, this.width, this.height);
    }

    public move(shape: Rect, ev: MouseEvent) {
        shape.posX = ev.offsetX - diffMouseX;
            shape.posY = ev.offsetY - diffMouseY;
            
            shape.path2d = new Path2D();
            
            shape.path2d.rect(
                shape.posX,
                shape.posY,
                shape.width,
                shape.height
            ) 
    }
}

class Point extends Rect {
    public width: number;
    public height: number;

    public connections: Rect[];
}

class RectPnt extends Rect {
    public point: Point = new Point();
    public pntColor: Colors = Colors.MAIN;
    
    constructor(posX: number = 100, posY: number = 100, width: number = 100, height: number = 100, color: Colors = Colors.USER) {
        super(posX, posY, width, height, color)
        this.point.width = 10;
        this.point.height = 10;

        this.point.posX = this.posX / 2 + this.width - this.point.width / 2;
        this.point.posY = this.posY + this.height;
    }

    public move(shape: Rect, ev: MouseEvent) {
        shape.posX = ev.offsetX - diffMouseX;
        shape.posY = ev.offsetY - diffMouseY;
            
        shape.path2d = new Path2D();
            
        shape.path2d.rect(
            shape.posX,
            shape.posY,
            shape.width,
            shape.height
        )

        this.point.posX = this.posX + this.width / 2 - this.point.width / 2;
        this.point.posY = this.posY + this.height;

        this.point.path2d = new Path2D();

        this.point.path2d.rect(
            this.point.posX,
            this.point.posY,
            this.point.width,
            this.point.height
        )
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

            if(shape instanceof RectPnt || shape instanceof Point) {
                diffMouseX = ev.offsetX - shape.posX;
                diffMouseY = ev.offsetY - shape.posY;
            }
        }
    })
})

canvas.canvas.addEventListener('mousemove', function(ev: MouseEvent) {
    if(mouseIsDown) {
        let shape = allShapes[allShapes.indexOf(selectedShape)];
        if(shape instanceof RectPnt || shape instanceof Point) {
            shape.move(shape, ev);
            if(shape instanceof RectPnt) {
                shape.point.move(shape, ev);
            }
        }     
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