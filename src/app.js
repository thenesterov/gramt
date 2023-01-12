class Colors {
}
Colors.MAIN = '#65bbf4';
Colors.STATE = '#1f2b38';
Colors.USER = '#2b5378';
Colors.LOGIC = '#768c9e';
Colors.BOT = '#182533';
Colors.KB = '#1e2c3a';
Colors.RB = '#b580e2';
Colors.CB = '#7595ff';
let allShapes = [];
let mouseIsDown = false;
let mouseIsCtxmenu = false;
let mouseOnRectPnt = false;
let mouseOnPoint = false;
let ctxmenuOnShape = false;
let lineIsActive = false;
let mouseIsDbl = false;
let diffMouseX = 0;
let diffMouseY = 0;
let mouseXMove = 0;
let mouseYMove = 0;
let generalDiffMouseX = 0;
let generalDiffMouseY = 0;
let clearRectX = 0;
let clearRectY = 0;
let selectedShape;
class Canvas {
    constructor() {
        let canvas = document.getElementById('canvas');
        canvas.width = document.getElementsByClassName('right')[0].offsetWidth;
        canvas.height = window.innerHeight - 10;
        let context = canvas.getContext('2d');
        this.canvas = canvas;
        this.context = context;
    }
    addShape(shape) {
        allShapes.push(shape);
    }
    include(array, element) {
        let result = false;
        array.forEach(elem => {
            if (elem == element) {
                result = true;
            }
        });
        return result;
    }
    drawShape(shape) {
        if (shape instanceof RectPnt) {
            let text = [];
            for (let i = 0; i < shape.text.length; i++) {
                text.push(shape.text[i]);
                let lastLine = text.join('').split('\n')[text.join('').split('\n').length - 1];
                if (this.context.measureText(lastLine).width > shape.width - 20) {
                    let words = text.join('').split(' ');
                    let new_text = [];
                    for (let j = 0; j < words.length; j++) {
                        if (j != words.length - 1) {
                            new_text.push(words[j] + " ");
                        }
                        else {
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
            if (shape instanceof TextAlignStart) {
                for (let i = 0; i < text.length; i++) {
                    this.context.fillText(text[i], shape.posX + 10, shape.posY + (i * 17) + 20);
                }
            }
            else if (shape instanceof TextAlignCenter) {
                for (let i = 0; i < text.length; i++) {
                    this.context.fillText(text[i], shape.posX + ((shape.width - this.context.measureText(text[i]).width) / 2), shape.posY + (i * 17) + 20);
                }
            }
        }
        else if (shape instanceof Point) {
            this.context.fillStyle = String(shape.color);
            this.context.fillRect(shape.posX, shape.posY, shape.width, shape.height);
        }
        else if (shape instanceof Line) {
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
}
class Rect {
    constructor(posX = 100, posY = 100, width = 100, height = 100, color = Colors.USER) {
        this.posX = 100;
        this.posY = 100;
        this.width = 100;
        this.height = 100;
        this.color = Colors.USER;
        this.movable = true;
        this.clickdownable = true;
        this.dblclickable = true;
        this.contextmenuable = true;
        this.path2d = new Path2D;
        this.connection_above = [];
        this.connection_below = [];
        this.linesFrom = [];
        this.linesTo = [];
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
        this.color = color;
        this.path2d.rect(this.posX, this.posY, this.width, this.height);
    }
    move(shape, ev) {
        shape.posX = ev.offsetX - diffMouseX;
        shape.posY = ev.offsetY - diffMouseY;
        shape.path2d = new Path2D();
        shape.path2d.rect(shape.posX, shape.posY, shape.width, shape.height);
        this.linesFrom.forEach(line => {
            if (shape instanceof Point) {
                line.move(this.posX + this.width / 2, this.posY + this.height / 2, null, null);
            }
            else if (shape instanceof RectPnt) {
                let newPosX = shape.point.posX + (shape.width / 2);
                let newPosY = shape.point.posY + (shape.point.height / 2);
                line.move(newPosX, newPosY, null, null);
            }
        });
        this.linesTo.forEach(line => {
            line.move(null, null, this.posX + this.width / 2, this.posY + this.height / 2);
        });
    }
}
class Point extends Rect {
    constructor() {
        super(...arguments);
        this.connections = [];
    }
}
class RectPnt extends Rect {
    constructor(posX = 100, posY = 100, width = 100, height = 100, color = Colors.USER) {
        super(posX, posY, width, height, color);
        this.point = new Point();
        this.pntColor = Colors.MAIN;
        this.text = "";
        this.point.width = 10;
        this.point.height = 10;
        this.point.posX = this.posX + this.width / 2 - this.point.width / 2;
        this.point.posY = this.posY + this.height;
    }
    setText(text) {
        this.text = text.join('');
        let diffHeight = text.length * 17 + 20;
        this.height = diffHeight;
        this.point.posY = this.point.posY + diffHeight - this.height;
        this.path2d = new Path2D();
        this.path2d.rect(this.posX, this.posY, this.width, diffHeight);
        this.point.posY = this.posY + diffHeight;
        this.point.path2d = new Path2D();
        this.point.path2d.rect(this.posX + this.width / 2 - this.point.width / 2, this.posY + diffHeight, this.point.width, this.point.height);
    }
    move(shape, ev) {
        shape.posX = ev.offsetX - diffMouseX;
        shape.posY = ev.offsetY - diffMouseY;
        shape.path2d = new Path2D();
        shape.path2d.rect(shape.posX, shape.posY, shape.width, shape.height);
        this.point.posX = this.posX + this.width / 2 - this.point.width / 2;
        this.point.posY = this.posY + this.height;
        this.point.path2d = new Path2D();
        this.point.path2d.rect(this.point.posX, this.point.posY, this.point.width, this.point.height);
        this.linesFrom.forEach(line => {
            if (shape instanceof Point) {
                line.move(this.posX + this.width / 2, this.posY + this.height / 2, null, null);
            }
            else if (shape instanceof RectPnt) {
                let newPosX = this.point.posX + (this.point.width / 2);
                let newPosY = this.point.posY + (this.point.height / 2);
                line.move(newPosX, newPosY, null, null);
            }
        });
        this.linesTo.forEach(line => {
            line.move(null, null, this.posX + this.width / 2, this.posY + this.height / 2);
        });
    }
}
class TextAlignStart extends RectPnt {
}
class TextAlignCenter extends RectPnt {
}
class State extends TextAlignCenter {
    constructor() {
        super(...arguments);
        this.color = Colors.STATE;
        this.text = 'STATE';
    }
}
class User extends TextAlignStart {
    constructor() {
        super(...arguments);
        this.color = Colors.USER;
        this.text = 'USER';
    }
}
class Logic extends TextAlignCenter {
    constructor() {
        super(...arguments);
        this.color = Colors.LOGIC;
        this.text = 'LOGIC';
    }
}
class Bot extends TextAlignStart {
    constructor() {
        super(...arguments);
        this.color = Colors.BOT;
        this.text = 'BOT';
    }
}
class KeyBoard extends TextAlignCenter {
    constructor() {
        super(...arguments);
        this.color = Colors.KB;
        this.text = 'KB';
    }
}
class ReplyButton extends TextAlignCenter {
    constructor() {
        super(...arguments);
        this.color = Colors.RB;
        this.text = 'RB';
    }
}
class CallbackButton extends TextAlignCenter {
    constructor() {
        super(...arguments);
        this.color = Colors.CB;
        this.text = 'CB';
    }
}
class Line {
    constructor(fromPosX, fromPosY, toPosX, toPosY, color = Colors.MAIN) {
        this.color = Colors.MAIN;
        this.movable = false;
        this.clickdownable = false;
        this.dblclickable = false;
        this.contextmenuable = true;
        this.path2d = new Path2D();
        this.fromPosX = fromPosX;
        this.fromPosY = fromPosY;
        this.toPosX = toPosX;
        this.toPosY = toPosY;
        this.color = color;
        this.path2d.moveTo(fromPosX, fromPosY);
        this.path2d.lineTo(toPosX, toPosY);
    }
    move(offsetFromX = null, offsetFromY = null, offsetToX = null, offsetToY = null, targetRect = null) {
        if (offsetFromX == null && offsetFromY == null) {
            if (targetRect == null) {
                this.toPosX = offsetToX;
                this.toPosY = offsetToY;
            }
            else {
                this.toPosX = targetRect.posX + targetRect.width / 2;
                this.toPosY = targetRect.posY + targetRect.height / 2;
            }
        }
        else if (offsetToX == null && offsetToY == null) {
            if (targetRect == null) {
                this.fromPosX = offsetFromX;
                this.fromPosY = offsetFromY;
            }
        }
        this.path2d = new Path2D();
        this.path2d.moveTo(this.fromPosX, this.fromPosY);
        this.path2d.lineTo(this.toPosX, this.toPosY);
    }
}
const canvas = new Canvas();
canvas.canvas.addEventListener('click', function (ev) {
    console.log(`click ${ev.offsetX}, ${ev.offsetY}`);
});
canvas.canvas.addEventListener('mouseup', function (ev) {
    let emptyMouseUp = true;
    let lastElemInArray = allShapes[allShapes.length - 1];
    allShapes.forEach(shape => {
        if (!(shape instanceof Line)) {
            if (canvas.context.isPointInPath(shape.path2d, ev.offsetX, ev.offsetY)
                && (mouseOnRectPnt || mouseOnPoint)
                && lineIsActive
                && shape != selectedShape) {
                if (shape instanceof RectPnt || shape instanceof Point) {
                    if (lastElemInArray instanceof Line) {
                        lastElemInArray.move(null, null, ev.offsetX, ev.offsetY, shape);
                        if (selectedShape instanceof Rect) {
                            shape.linesTo.push(lastElemInArray);
                            selectedShape.linesFrom.push(lastElemInArray);
                            function getAllConnectionsOfPoint(connections) {
                                let allNestings = [];
                                for (let i = 0; i < connections.length; i++) {
                                    let connection_i = connections[i];
                                    if (connection_i instanceof RectPnt) {
                                        allNestings.push(connection_i);
                                    }
                                    else if (connection_i instanceof Point) {
                                        allNestings.push(...getAllConnectionsOfPoint(connection_i.connections));
                                    }
                                }
                                return allNestings;
                            }
                            if (selectedShape instanceof RectPnt && shape instanceof Point) {
                                shape.connections.push(selectedShape);
                                selectedShape.connection_below.push(...getAllConnectionsOfPoint(shape.connections));
                                selectedShape.connection_below.splice(selectedShape.connection_below.indexOf(selectedShape), 1);
                            }
                            if (selectedShape instanceof Point && shape instanceof Point) {
                                shape.connections.push(...getAllConnectionsOfPoint(selectedShape.connections));
                                selectedShape.connections.push(...getAllConnectionsOfPoint(shape.connections));
                                let connectionsOfSelectedShape = getAllConnectionsOfPoint(selectedShape.connections);
                                let connectionsOfShape = getAllConnectionsOfPoint(shape.connections);
                                shape.connections = Array.from(new Set(shape.connections));
                                selectedShape.connections = Array.from(new Set(selectedShape.connections));
                            }
                            if (selectedShape instanceof Point && shape instanceof RectPnt) {
                                shape.connection_above.push(...getAllConnectionsOfPoint(selectedShape.connections));
                                selectedShape.connections.push(selectedShape);
                            }
                            if (selectedShape instanceof RectPnt && shape instanceof RectPnt) {
                                shape.connection_above.push(selectedShape);
                                selectedShape.connection_below.push(shape);
                            }
                        }
                    }
                    emptyMouseUp = false;
                }
            }
            else if (canvas.context.isPointInPath(shape.path2d, ev.offsetX, ev.offsetY)
                && (mouseOnRectPnt || mouseOnPoint)
                && lineIsActive) {
                if (shape instanceof Point) {
                    if (lastElemInArray instanceof Line) {
                        lastElemInArray.move(null, null, ev.offsetX, ev.offsetY, shape);
                        if (selectedShape instanceof Rect) {
                            shape.linesTo.push(lastElemInArray);
                            selectedShape.linesFrom.push(lastElemInArray);
                        }
                    }
                    emptyMouseUp = false;
                }
            }
        }
    });
    if (emptyMouseUp && lineIsActive && (mouseOnRectPnt || mouseOnPoint)) {
        allShapes.pop();
    }
    mouseIsDown = false;
    mouseOnRectPnt = false;
    mouseOnPoint = false;
    mouseIsDbl = false;
    mouseIsCtxmenu = false;
    ctxmenuOnShape = false;
    selectedShape = null;
});
canvas.canvas.addEventListener('mousedown', function (ev) {
    allShapes.forEach(shape => {
        if (canvas.context.isPointInPath(shape.path2d, ev.offsetX, ev.offsetY) && shape.clickdownable) {
            mouseIsDown = true;
            if (!mouseIsDbl) {
                selectedShape = shape;
            }
            if (shape instanceof RectPnt || shape instanceof Point) {
                diffMouseX = ev.offsetX - shape.posX;
                diffMouseY = ev.offsetY - shape.posY;
            }
        }
        else if (shape instanceof RectPnt) {
            if (canvas.context.isPointInPath(shape.point.path2d, ev.offsetX, ev.offsetY) && shape.clickdownable) {
                mouseOnRectPnt = true;
                selectedShape = shape;
                allShapes.push(new Line(shape.point.posX + shape.point.width / 2, shape.point.posY + shape.point.height / 2, ev.offsetX - generalDiffMouseX, ev.offsetY - generalDiffMouseY));
                lineIsActive = true;
            }
        }
    });
});
canvas.canvas.addEventListener('mousemove', function (ev) {
    if (mouseOnRectPnt) {
        let lastElemInArray = allShapes[allShapes.length - 1];
        if (lastElemInArray instanceof Line) {
            lastElemInArray.move(null, null, ev.offsetX - generalDiffMouseX, ev.offsetY - generalDiffMouseY);
        }
    }
    if (mouseIsDown && mouseOnPoint) {
        let lastElemInArray = allShapes[allShapes.length - 1];
        if (lastElemInArray instanceof Line) {
            lastElemInArray.move(null, null, ev.offsetX - generalDiffMouseX, ev.offsetY - generalDiffMouseY);
        }
    }
    if (mouseIsDown && !mouseOnPoint) {
        if (selectedShape instanceof RectPnt || selectedShape instanceof Point) {
            selectedShape.move(selectedShape, ev);
            if (selectedShape instanceof RectPnt) {
                selectedShape.point.move(selectedShape, ev);
            }
        }
    }
    if (mouseIsDown && !ctxmenuOnShape && mouseIsCtxmenu) {
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
});
canvas.canvas.addEventListener('contextmenu', function (ev) {
    let rectWasDeleted = false;
    let slf = [];
    let slt = [];
    let sca = [];
    let scb = [];
    let deletedShape;
    allShapes.forEach(shape => {
        if (canvas.context.isPointInPath(shape.path2d, ev.offsetX, ev.offsetY) && shape.contextmenuable) {
            ctxmenuOnShape = true;
            rectWasDeleted = true;
            if (shape instanceof Rect) {
                slf = shape.linesFrom;
                slt = shape.linesTo;
                sca = shape.connection_above;
                scb = shape.connection_below;
                deletedShape = shape;
                allShapes.splice(allShapes.indexOf(shape), 1);
                shape.linesFrom.forEach(line => {
                    allShapes.splice(allShapes.indexOf(line), 1);
                });
                shape.linesTo.forEach(line => {
                    allShapes.splice(allShapes.indexOf(line), 1);
                });
            }
        }
        if (shape instanceof Line && !rectWasDeleted) {
            if (canvas.context.isPointInStroke(shape.path2d, ev.offsetX, ev.offsetY)) {
                allShapes.splice(allShapes.indexOf(shape), 1);
                let jsca;
                let jscb;
                allShapes.forEach(jshape => {
                    if (jshape instanceof RectPnt) {
                        jshape.linesFrom.forEach(jline => {
                            if (jline == shape) {
                                jsca = jshape;
                            }
                        });
                        jshape.linesTo.forEach(jline => {
                            if (jline == shape) {
                                jscb = jshape;
                            }
                        });
                    }
                });
                allShapes.forEach(jshape => {
                    if (jshape instanceof Rect) {
                        jshape.linesFrom.forEach(jline => {
                            if (jline == shape) {
                                jshape.linesFrom.splice(jshape.linesFrom.indexOf(jline), 1);
                            }
                        });
                    }
                });
                allShapes.forEach(jshape => {
                    if (jshape instanceof Rect) {
                        jshape.linesTo.forEach(jline => {
                            if (jline == shape) {
                                jshape.linesTo.splice(jshape.linesTo.indexOf(jline), 1);
                            }
                        });
                    }
                });
                jsca.connection_below.splice(jsca.connection_below.indexOf(jscb), 1);
                jscb.connection_above.splice(jscb.connection_above.indexOf(jsca), 1);
            }
        }
    });
    slf.forEach(line => {
        allShapes.forEach(shape => {
            if (shape instanceof Rect) {
                shape.linesTo.forEach(lf => {
                    if (lf == line) {
                        shape.linesTo.splice(shape.linesTo.indexOf(lf), 1);
                    }
                });
            }
        });
    });
    slt.forEach(line => {
        allShapes.forEach(shape => {
            if (shape instanceof Rect) {
                shape.linesFrom.forEach(lt => {
                    if (lt == line) {
                        shape.linesFrom.splice(shape.linesFrom.indexOf(lt), 1);
                    }
                });
            }
        });
    });
    sca.forEach(rect => {
        allShapes.forEach(shape => {
            if (shape instanceof Rect) {
                shape.connection_below.forEach(ca => {
                    if (shape == rect && ca == deletedShape) {
                        shape.connection_below.splice(shape.connection_below.indexOf(ca), 1);
                    }
                });
            }
        });
    });
    scb.forEach(rect => {
        allShapes.forEach(shape => {
            if (shape instanceof Rect) {
                shape.connection_above.forEach(cb => {
                    if (shape == rect && cb == deletedShape) {
                        shape.connection_above.splice(shape.connection_above.indexOf(cb), 1);
                    }
                });
            }
        });
    });
    if (!ctxmenuOnShape) {
        mouseIsDown = true;
        mouseIsCtxmenu = true;
        mouseXMove = ev.offsetX;
        mouseYMove = ev.offsetY;
    }
});
canvas.canvas.addEventListener('dblclick', function (ev) {
    allShapes.forEach(shape => {
        if (shape instanceof Point) {
            if (canvas.context.isPointInPath(shape.path2d, ev.offsetX, ev.offsetY) && shape.dblclickable) {
                if (shape instanceof Point) {
                    mouseIsDown = true;
                    mouseOnPoint = true;
                    mouseIsDbl = true;
                    selectedShape = shape;
                    allShapes.push(new Line(shape.posX + shape.width / 2, shape.posY + shape.height / 2, ev.offsetX - generalDiffMouseX, ev.offsetY - generalDiffMouseY));
                    lineIsActive = true;
                }
            }
        }
    });
});
let countAllShapes = 0;
function renderCanvas() {
    canvas.context.clearRect(clearRectX, clearRectY, canvas.canvas.width, canvas.canvas.height);
    if (countAllShapes != allShapes.length) {
        console.log('cb');
    }
    countAllShapes = allShapes.length;
    allShapes.forEach(shape => {
        if (shape instanceof Line) {
            canvas.drawShape(shape);
        }
    });
    allShapes.forEach(shape => {
        if (shape instanceof Rect) {
            canvas.drawShape(shape);
        }
    });
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
