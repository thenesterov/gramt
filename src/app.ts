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
let mouseOnRectPnt: boolean = false;
let lineIsActive: boolean = false;

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
        else if(shape instanceof Line) {
            this.context.strokeStyle = String(shape.color);
            this.context.beginPath();
            this.context.lineWidth = 3;
            this.context.moveTo(shape.fromPosX, shape.fromPosY);
            this.context.lineTo(shape.toPosX, shape.toPosY);
            this.context.stroke();
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

    public connection_above: RectPnt[] = [];
    public connection_below: RectPnt[] = [];

    public linesFrom: Line[] = [];
    public linesTo: Line[] = [];

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

        this.linesFrom.forEach(line => {
            if(shape instanceof Point) {
                line.move(this.posX + this.width / 2, this.posY + this.height / 2, null, null);
            } else if(shape instanceof RectPnt) {
                let newPosX: number = shape.point.posX + (shape.width / 2);
                let newPosY: number = shape.point.posY + (shape.point.height / 2);
                line.move(newPosX, newPosY, null, null);
            }
        })

        this.linesTo.forEach(line => {
            line.move(null, null, this.posX + this.width / 2, this.posY + this.height / 2);
        })
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

    public move(shape: RectPnt | Point, ev: MouseEvent) {
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

        this.linesFrom.forEach(line => {
            if(shape instanceof Point) {
                line.move(this.posX + this.width / 2, this.posY + this.height / 2, null, null);
            } else if(shape instanceof RectPnt) {
                let newPosX: number = this.point.posX + (this.point.width / 2);
                let newPosY: number = this.point.posY + (this.point.height / 2);
                line.move(newPosX, newPosY, null, null);
            }
        })

        this.linesTo.forEach(line => {
            line.move(null, null, this.posX + this.width / 2, this.posY + this.height / 2);
        })
    }
}

class Line implements Shape {
    public color: Colors = Colors.MAIN;

    public fromPosX: number;
    public fromPosY: number;
    public toPosX: number;
    public toPosY: number;

    public movable: boolean = false;
    public clickdownable: boolean = false;
    public dblclickable: boolean = false;
    public contextmenuable: boolean = true;

    public path2d: Path2D = new Path2D();

    constructor(fromPosX: number, fromPosY: number, toPosX: number, toPosY: number, color: Colors = Colors.MAIN) {
        this.fromPosX = fromPosX;
        this.fromPosY = fromPosY;
        this.toPosX = toPosX;
        this.toPosY = toPosY;

        this.color = color;

        this.path2d.moveTo(fromPosX, fromPosY);
        this.path2d.lineTo(toPosX, toPosY);
    }

    public move(offsetFromX: number| null = null,
            offsetFromY: number | null = null,
            offsetToX: number | null = null,
            offsetToY: number | null = null, targetRect: Rect | null = null) {
        if (offsetFromX == null && offsetFromY == null) {
            if(targetRect == null) {
                this.toPosX = offsetToX;
                this.toPosY = offsetToY;
            } else {
                this.toPosX = targetRect.posX + targetRect.width / 2;
                this.toPosY = targetRect.posY + targetRect.height / 2;
            }
        } else if(offsetToX == null && offsetToY == null) {
            if(targetRect == null) {
                this.fromPosX = offsetFromX;
                this.fromPosY = offsetFromY;
            }
        }
       
            
        this.path2d = new Path2D();
            
        this.path2d.moveTo(
            this.fromPosX,
            this.fromPosY
        )

        this.path2d.lineTo(
            this.toPosX,
            this.toPosY
        )
    }
}

const canvas: Canvas = new Canvas();

canvas.canvas.addEventListener('click', function(ev: MouseEvent) {
    console.log(`click ${ev.offsetX}, ${ev.offsetY}`);
})

canvas.canvas.addEventListener('mouseup', function(ev: MouseEvent) {
    let emptyMouseUp: boolean = true;
    let lastElemInArray: Shape = allShapes[allShapes.length - 1];

    function include(array, element) {
        let result = false;

        array.forEach(elem => {
            if(elem == element) {
                result = true;
            }
        })
        
        return result;
    }

    allShapes.forEach(shape => {
        if(canvas.context.isPointInPath(shape.path2d, ev.offsetX, ev.offsetY)
            && mouseOnRectPnt
            && lineIsActive
            && shape != selectedShape) {
            if(shape instanceof RectPnt || shape instanceof Point) {
                if(lastElemInArray instanceof Line) {
                    lastElemInArray.move(null, null, ev.offsetX, ev.offsetY, shape);                

                    if(selectedShape instanceof Rect) {
                        shape.linesTo.push(lastElemInArray);
                        selectedShape.linesFrom.push(lastElemInArray);
                    }
                }
                emptyMouseUp = false;
            }
        }
    })

    if(emptyMouseUp && lineIsActive && mouseOnRectPnt) {
        let deletedLine = allShapes.pop();
    }

    mouseIsDown = false;
    mouseOnRectPnt = false;
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
        else if(shape instanceof RectPnt) {
            if(canvas.context.isPointInPath(shape.point.path2d, ev.offsetX, ev.offsetY) && shape.clickdownable) {
                mouseOnRectPnt = true;
                selectedShape = shape;

                allShapes.push(new Line(
                    shape.point.posX + shape.point.width / 2,
                    shape.point.posY + shape.point.height / 2,
                    ev.offsetX,
                    ev.offsetY))

                lineIsActive = true;
            }
        }
    })
})

canvas.canvas.addEventListener('mousemove', function(ev: MouseEvent) {
    if(mouseOnRectPnt) {
        let lastElemInArray = allShapes[allShapes.length - 1];
        if(lastElemInArray instanceof Line) {
            lastElemInArray.toPosX = ev.offsetX;
            lastElemInArray.toPosY = ev.offsetY;
            lastElemInArray.move(null, null, ev.offsetX, ev.offsetY);
        }
    }
    if(mouseIsDown) {
        if(selectedShape instanceof RectPnt || selectedShape instanceof Point) {
            selectedShape.move(selectedShape, ev);
            if(selectedShape instanceof RectPnt) { 
                selectedShape.point.move(selectedShape, ev);
            }
        }
    } 
})

canvas.canvas.addEventListener('contextmenu', function(ev: MouseEvent) {
    let rectWasDeleted: boolean = false;
    
    let slf: Line[] = []; // shape.linesFrom
    let slt: Line[] = []; // shape.linesTo

    allShapes.forEach(shape => {
        if(canvas.context.isPointInPath(shape.path2d, ev.offsetX, ev.offsetY) && shape.contextmenuable) {
            rectWasDeleted = true;
            if(shape instanceof Rect) {
                slf = shape.linesFrom;
                slt = shape.linesTo;

                allShapes.splice(allShapes.indexOf(shape), 1);

                shape.linesFrom.forEach(line => {
                    allShapes.splice(allShapes.indexOf(line), 1);
                })
                shape.linesTo.forEach(line => {
                    allShapes.splice(allShapes.indexOf(line), 1);
                })
            }
        }
        if(shape instanceof Line && !rectWasDeleted) {
            let entry_left = (ev.offsetX - shape.fromPosX) / (shape.toPosX - shape.fromPosX);
            let entry_right = (ev.offsetY - shape.fromPosY) / (shape.toPosY - shape.fromPosY);
            if(Math.abs(entry_left - entry_right) <= 0.05) {
                allShapes.splice(allShapes.indexOf(shape), 1);

                allShapes.forEach(jshape => {
                    if(jshape instanceof Rect) {
                        jshape.linesFrom.forEach(jline => {
                            if(jline == shape) {
                                jshape.linesFrom.splice(jshape.linesFrom.indexOf(jline), 1);
                            }
                        })
                    }
                })
                allShapes.forEach(jshape => {
                    if(jshape instanceof Rect) {
                        jshape.linesTo.forEach(jline => {
                            if(jline == shape) {
                                jshape.linesTo.splice(jshape.linesTo.indexOf(jline), 1);
                            }
                        })
                    }
                })
            }
        }
    })

    slf.forEach(line => {
        allShapes.forEach(shape => {
            if(shape instanceof Rect) {
                shape.linesTo.forEach(lf => {

                    if(lf == line) {
                        shape.linesTo.splice(shape.linesTo.indexOf(lf), 1);
                    }
                })
            }
        })
    })

    slt.forEach(line => {
        allShapes.forEach(shape => {
            if(shape instanceof Rect) {
                shape.linesFrom.forEach(lt => {
                    if(lt == line) {
                        shape.linesFrom.splice(shape.linesFrom.indexOf(lt), 1);
                    }
                })
            }
        })
    })
})

let countAllShapes = 0;

function renderCanvas() {
    canvas.context.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);

    if(countAllShapes != allShapes.length) {
        console.log('cb');
    }
    
        countAllShapes = allShapes.length;
    

    allShapes.forEach(shape => {
        if(shape instanceof Line) {
            canvas.drawShape(shape);
        }
    })
    allShapes.forEach(shape => {
        if(shape instanceof Rect) {
            canvas.drawShape(shape);
        }   
    })

    window.requestAnimationFrame(renderCanvas);
}

window.requestAnimationFrame(renderCanvas);