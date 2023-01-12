type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

type Color = RGB | RGBA | HEX;

abstract class Colors {
    static MAIN: Color = '#65bbf4';
    static STATE: Color = '#1f2b38';
    static USER: Color = '#2b5378';
    static LOGIC: Color = '#768c9e';
    static BOT: Color = '#182533';
    static KB: Color = '#1e2c3a';
    static RB: Color = '#b580e2';
    static CB: Color = '#7595ff';
}

let allShapes: Shape[] = [];

let mouseIsDown: boolean = false;
let mouseIsCtxmenu: boolean = false;
let mouseOnRectPnt: boolean = false;
let mouseOnPoint: boolean = false;
let ctxmenuOnShape: boolean = false;
let lineIsActive: boolean = false;
let mouseIsDbl: boolean = false;

let diffMouseX: number = 0;
let diffMouseY: number = 0;

let mouseXMove: number = 0;
let mouseYMove: number = 0;

let generalDiffMouseX: number = 0;
let generalDiffMouseY: number = 0;

let clearRectX: number = 0;
let clearRectY: number = 0;

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

    public include(array, element) {
        let result = false;

        array.forEach(elem => {
            if(elem == element) {
                result = true;
            }
        })
        
        return result;
    }

    public drawShape(shape: Shape) {
        if(shape instanceof RectPnt) {             
                let text: string[] = [];

                for(let i = 0; i < shape.text.length; i++) {
                    text.push(shape.text[i]);

                    let lastLine = text.join('').split('\n')[text.join('').split('\n').length - 1];

                    if(this.context.measureText(lastLine).width > shape.width - 20) {
                        let words = text.join('').split(' ');
                        let new_text = [];

                        for(let j = 0; j < words.length; j++) {
                            if(j != words.length - 1) {
                                new_text.push(words[j] + " ");
                            } else {
                                new_text.push('\n');
                                new_text.push(words[j]);
                            }
                        }

                        text = new_text;
                    }
                }         

                text = text.join('').split('\n');
                shape.setText(text);

                this.context.fillStyle = String(shape.color);
                this.context.fillRect(shape.posX, shape.posY, shape.width, shape.height);

                this.context.fillStyle = String(shape.pntColor);
                this.context.fillRect(shape.point.posX, shape.point.posY, shape.point.width, shape.point.height);

                this.context.font = "12px OpenSans";
                this.context.fillStyle = "#ffffff";

                if(shape instanceof TextAlignStart) {
                    for(let i = 0; i < text.length; i++) {
                        this.context.fillText(text[i], shape.posX + 10, shape.posY + (i * 17) + 20);
                    }
                } else if (shape instanceof TextAlignCenter) {
                    for(let i = 0; i < text.length; i++) {
                        this.context.fillText(text[i],
                            shape.posX + ((shape.width - this.context.measureText(text[i]).width) / 2),
                            shape.posY + (i * 17) + 20);
                    }
                }
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

    public connection_above: Rect[] = [];
    public connection_below: Rect[] = [];

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

    public connections: Rect[] = [];
}

class RectPnt extends Rect {
    public point: Point = new Point();
    public pntColor: Colors = Colors.MAIN;
    public text: string = "";
    
    constructor(posX: number = 100, posY: number = 100, width: number = 100, height: number = 100, color: Colors = Colors.USER) {
        super(posX, posY, width, height, color);
        this.point.width = 10;
        this.point.height = 10;

        // this.point.posX = posX + width / 2 - this.point.width / 2 - generalDiffMouseX / 2;
        this.point.posX = this.posX + this.width / 2 - this.point.width / 2;
        this.point.posY = this.posY + this.height;
    }

    public setText(text: string[]) {
        this.text = text.join('');

        let diffHeight: number = text.length * 17 + 20;

        this.height = diffHeight;
        this.point.posY = this.point.posY + diffHeight - this.height;

        this.path2d = new Path2D();
        this.path2d.rect(
            this.posX,
            this.posY,
            this.width,
            diffHeight
        )

        this.point.posY = this.posY + diffHeight;

        this.point.path2d = new Path2D();
        this.point.path2d.rect(
            this.posX + this.width / 2 - this.point.width / 2,
            this.posY + diffHeight,
            this.point.width,
            this.point.height
        )
        
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

class TextAlignStart extends RectPnt {}
class TextAlignCenter extends RectPnt {}

class State extends TextAlignCenter {
    public color: Colors = Colors.STATE;
    public text: string = 'STATE';
}

class User extends TextAlignStart {
    public color: Colors = Colors.USER;
    public text: string = 'USER';
}

class Logic extends TextAlignCenter {
    public color: Colors = Colors.LOGIC;
    public text: string = 'LOGIC';
}

class Bot extends TextAlignStart {
    public color: Colors = Colors.BOT;
    public text: string = 'BOT';
}

class KeyBoard extends TextAlignCenter {
    public color: Colors = Colors.KB;
    public text: string = 'KB';
}

class ReplyButton extends TextAlignCenter {
    public color: Colors = Colors.RB;
    public text: string = 'RB';
}

class CallbackButton extends TextAlignCenter {
    public color: Colors = Colors.CB;
    public text: string = 'CB';
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

    allShapes.forEach(shape => {
        if(!(shape instanceof Line)) {
            if(canvas.context.isPointInPath(shape.path2d, ev.offsetX, ev.offsetY)
                && (mouseOnRectPnt || mouseOnPoint)
                && lineIsActive
                && shape != selectedShape) {
                if(shape instanceof RectPnt || shape instanceof Point) {
                    if(lastElemInArray instanceof Line) {
                        lastElemInArray.move(null, null, ev.offsetX, ev.offsetY, shape);                

                        if(selectedShape instanceof Rect) {
                            shape.linesTo.push(lastElemInArray);
                            selectedShape.linesFrom.push(lastElemInArray);

                            function getAllConnectionsOfPoint(connections: Rect[]): Rect[] {
                                let allNestings: Rect[] = [];
                                
                                for(let i = 0; i < connections.length; i++) {
                                    let connection_i = connections[i];
                                    if(connection_i instanceof RectPnt) {
                                        allNestings.push(connection_i);
                                    } else if(connection_i instanceof Point) {
                                        allNestings.push(...getAllConnectionsOfPoint(connection_i.connections));
                                    }
                                }

                                return allNestings;
                            }

                            if(selectedShape instanceof RectPnt && shape instanceof Point) {
                                shape.connections.push(selectedShape);
                                selectedShape.connection_below.push(...getAllConnectionsOfPoint(shape.connections));
                                selectedShape.connection_below.splice(selectedShape.connection_below.indexOf(selectedShape), 1); 
                            }

                            if(selectedShape instanceof Point && shape instanceof Point) {
                                shape.connections.push(...getAllConnectionsOfPoint(selectedShape.connections));
                                selectedShape.connections.push(...getAllConnectionsOfPoint(shape.connections));

                                let connectionsOfSelectedShape: Rect[] = getAllConnectionsOfPoint(selectedShape.connections);
                                let connectionsOfShape: Rect[] = getAllConnectionsOfPoint(shape.connections);

                                

                                shape.connections = Array.from(new Set(shape.connections));
                                selectedShape.connections = Array.from(new Set(selectedShape.connections));

                                //shape.connections.splice(shape.connections.indexOf(shape, 1));
                                //selectedShape.connections.splice(selectedShape.connections.indexOf(selectedShape), 1);
                            }

                            if(selectedShape instanceof Point && shape instanceof RectPnt) {
                                shape.connection_above.push(...getAllConnectionsOfPoint(selectedShape.connections));
                                selectedShape.connections.push(selectedShape);
                            }

                            if(selectedShape instanceof RectPnt && shape instanceof RectPnt) {
                                shape.connection_above.push(selectedShape);
                                selectedShape.connection_below.push(shape);
                            }
                        }
                    }
                    emptyMouseUp = false;
                }
            } else if(canvas.context.isPointInPath(shape.path2d, ev.offsetX, ev.offsetY)
                && (mouseOnRectPnt || mouseOnPoint)
                && lineIsActive) {
                if(shape instanceof Point) {
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
        }
    })

    if(emptyMouseUp && lineIsActive && (mouseOnRectPnt || mouseOnPoint)) {
        allShapes.pop();
    }

    mouseIsDown = false;
    mouseOnRectPnt = false;
    mouseOnPoint = false;
    mouseIsDbl = false;
    mouseIsCtxmenu = false;
    ctxmenuOnShape = false;
    selectedShape = null;
})

canvas.canvas.addEventListener('mousedown', function(ev: MouseEvent) {
    allShapes.forEach(shape => {
        if(canvas.context.isPointInPath(shape.path2d, ev.offsetX, ev.offsetY) && shape.clickdownable) {
            mouseIsDown = true;
            if(!mouseIsDbl) {
                selectedShape = shape;
            }
            
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
                    ev.offsetX - generalDiffMouseX, ev.offsetY - generalDiffMouseY
                    ))

                lineIsActive = true;
            }
        }
    })
})

canvas.canvas.addEventListener('mousemove', function(ev: MouseEvent) {
    if(mouseOnRectPnt) {
        let lastElemInArray = allShapes[allShapes.length - 1];
        if(lastElemInArray instanceof Line) {
            lastElemInArray.move(null, null, ev.offsetX - generalDiffMouseX, ev.offsetY - generalDiffMouseY);
        }
    }
    if(mouseIsDown && mouseOnPoint) {
        let lastElemInArray = allShapes[allShapes.length - 1];
        if(lastElemInArray instanceof Line) {
            lastElemInArray.move(null, null, ev.offsetX - generalDiffMouseX, ev.offsetY - generalDiffMouseY);
        }
    }
    if(mouseIsDown && !mouseOnPoint) {
        if(selectedShape instanceof RectPnt || selectedShape instanceof Point) {
            selectedShape.move(selectedShape, ev);
            if(selectedShape instanceof RectPnt) { 
                selectedShape.point.move(selectedShape, ev);
            }
        }
    }
    if(mouseIsDown && !ctxmenuOnShape && mouseIsCtxmenu) {      
        let diffMouseXMove = (mouseXMove - ev.offsetX) * (-1);
        let diffMouseYMove = (mouseYMove - ev.offsetY) * (-1);

        generalDiffMouseX += diffMouseXMove;
        generalDiffMouseY += diffMouseYMove;

        canvas.context.translate(diffMouseXMove, diffMouseYMove);

        mouseXMove = ev.offsetX;
        mouseYMove = ev.offsetY;

        clearRectX -= diffMouseXMove;
        clearRectY -= diffMouseYMove;
    }
})

canvas.canvas.addEventListener('contextmenu', function(ev: MouseEvent) {
    let rectWasDeleted: boolean = false;
    
    let slf: Line[] = []; // shape.linesFrom
    let slt: Line[] = []; // shape.linesTo

    let sca: Rect[] = []; // shape.connection_above
    let scb: Rect[] = []; // shape.connection_below
    let deletedShape: Rect;

    allShapes.forEach(shape => {
        if(canvas.context.isPointInPath(shape.path2d, ev.offsetX, ev.offsetY) && shape.contextmenuable) {
            ctxmenuOnShape = true;
            rectWasDeleted = true;
            if(shape instanceof Rect) {
                slf = shape.linesFrom;
                slt = shape.linesTo;

                sca = shape.connection_above;
                scb = shape.connection_below;

                deletedShape = shape;

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
            if(canvas.context.isPointInStroke(shape.path2d, ev.offsetX, ev.offsetY)) {
                allShapes.splice(allShapes.indexOf(shape), 1);

                let jsca: RectPnt;
                let jscb: RectPnt;

                allShapes.forEach(jshape => {
                    if(jshape instanceof RectPnt) {
                        jshape.linesFrom.forEach(jline => {
                            if(jline == shape) {
                                jsca = jshape;
                            }
                        })
                        jshape.linesTo.forEach(jline => {
                            if(jline == shape) {
                                jscb = jshape;
                            }
                        })
                    }
                })

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

                jsca.connection_below.splice(jsca.connection_below.indexOf(jscb), 1);
                jscb.connection_above.splice(jscb.connection_above.indexOf(jsca), 1);
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

    sca.forEach(rect => {
        allShapes.forEach(shape => {
            if(shape instanceof Rect) {
                shape.connection_below.forEach(ca => {
                    if(shape == rect && ca == deletedShape) {
                        shape.connection_below.splice(shape.connection_below.indexOf(ca), 1);
                    }
                })
            }
        }) 
    })

    scb.forEach(rect => {
        allShapes.forEach(shape => {
            if(shape instanceof Rect) {
                shape.connection_above.forEach(cb => {
                    if(shape == rect && cb == deletedShape) {
                        shape.connection_above.splice(shape.connection_above.indexOf(cb), 1);
                    }
                })
            }
        }) 
    })

    if(!ctxmenuOnShape) {
        mouseIsDown = true;
        mouseIsCtxmenu = true;

        mouseXMove = ev.offsetX;
        mouseYMove = ev.offsetY;
    }
})

canvas.canvas.addEventListener('dblclick', function(ev: MouseEvent) {
    allShapes.forEach(shape => {
        if(shape instanceof Point) {
            if(canvas.context.isPointInPath(shape.path2d, ev.offsetX, ev.offsetY) && shape.dblclickable) {
                if(shape instanceof Point) {
                    mouseIsDown = true;
                    mouseOnPoint = true;
                    mouseIsDbl = true;
                    selectedShape = shape;
    
                    allShapes.push(new Line(
                        shape.posX + shape.width / 2,
                        shape.posY + shape.height / 2,
                        ev.offsetX - generalDiffMouseX,
                        ev.offsetY - generalDiffMouseY))
    
                    lineIsActive = true;
                }
            }
        }
    })
})

let countAllShapes = 0;

function renderCanvas() { 
    canvas.context.clearRect(clearRectX, clearRectY, canvas.canvas.width, canvas.canvas.height);

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

function addState() {
    canvas.addShape(new State(100 - generalDiffMouseX, 100 - generalDiffMouseY, 100, 100));
}

function addUser() {
    canvas.addShape(new User(100 - generalDiffMouseX, 100 - generalDiffMouseY, 100, 100));
}

function addLogic() {
    canvas.addShape(new Logic(100 - generalDiffMouseX, 100 - generalDiffMouseY, 100, 100));
}

function addBot() {
    canvas.addShape(new Bot(100 - generalDiffMouseX, 100 - generalDiffMouseY, 100, 100));
}

function addPoint() {
    canvas.addShape(new Point(100 - generalDiffMouseX, 100 - generalDiffMouseY, 10, 10, Colors.MAIN));
}

function addKeyBoard() {
    canvas.addShape(new KeyBoard(100 - generalDiffMouseX, 100 - generalDiffMouseY, 100, 100));
}

function addReplyButton() {
    canvas.addShape(new ReplyButton(100 - generalDiffMouseX, 100 - generalDiffMouseY, 100, 100));
}

function addCallbackButton() {
    canvas.addShape(new CallbackButton(100 - generalDiffMouseX, 100 - generalDiffMouseY, 100, 100));
}