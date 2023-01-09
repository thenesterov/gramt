var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Colors = (function () {
    function Colors() {
    }
    Colors.MAIN = '#65bbf4';
    Colors.USER = '#2b5378';
    return Colors;
}());
var allShapes = [];
var mouseIsDown = false;
var mouseIsCtxmenu = false;
var mouseOnRectPnt = false;
var mouseOnPoint = false;
var ctxmenuOnShape = false;
var lineIsActive = false;
var mouseIsDbl = false;
var diffMouseX = 0;
var diffMouseY = 0;
var mouseXMove = 0;
var mouseYMove = 0;
var generalDiffMouseX = 0;
var generalDiffMouseY = 0;
var clearRectX = 0;
var clearRectY = 0;
var selectedShape;
var Canvas = (function () {
    function Canvas() {
        var canvas = document.getElementById('canvas');
        canvas.width = document.getElementsByClassName('right')[0].offsetWidth;
        canvas.height = window.innerHeight - 10;
        var context = canvas.getContext('2d');
        this.canvas = canvas;
        this.context = context;
    }
    Canvas.prototype.addShape = function (shape) {
        allShapes.push(shape);
    };
    Canvas.prototype.include = function (array, element) {
        var result = false;
        array.forEach(function (elem) {
            if (elem == element) {
                result = true;
            }
        });
        return result;
    };
    Canvas.prototype.drawShape = function (shape) {
        if (shape instanceof RectPnt) {
            this.context.fillStyle = String(shape.color);
            this.context.fillRect(shape.posX, shape.posY, shape.width, shape.height);
            this.context.fillStyle = String(shape.pntColor);
            this.context.fillRect(shape.point.posX, shape.point.posY, shape.point.width, shape.point.height);
            if (shape instanceof Rect) {
                this.context.font = "12px OpenSans";
                this.context.fillStyle = "#ffffff";
                var text = [];
                for (var i = 0; i < shape.text.length; i++) {
                    text.push(shape.text[i]);
                    var lastLine = text.join('').split('\n')[text.join('').split('\n').length - 1];
                    if (this.context.measureText(lastLine).width > shape.width - 10) {
                        var words = text.join('').split(' ');
                        var new_text = [];
                        for (var j = 0; j < words.length; j++) {
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
                for (var i = 0; i < text.length; i++) {
                    this.context.fillText(text[i], shape.posX + 10, shape.posY + (i * 17) + 20);
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
    };
    return Canvas;
}());
var Shape = (function () {
    function Shape() {
    }
    return Shape;
}());
var Rect = (function () {
    function Rect(posX, posY, width, height, color) {
        if (posX === void 0) { posX = 100; }
        if (posY === void 0) { posY = 100; }
        if (width === void 0) { width = 100; }
        if (height === void 0) { height = 100; }
        if (color === void 0) { color = Colors.USER; }
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
    Rect.prototype.move = function (shape, ev) {
        var _this = this;
        shape.posX = ev.offsetX - diffMouseX;
        shape.posY = ev.offsetY - diffMouseY;
        shape.path2d = new Path2D();
        shape.path2d.rect(shape.posX, shape.posY, shape.width, shape.height);
        this.linesFrom.forEach(function (line) {
            if (shape instanceof Point) {
                line.move(_this.posX + _this.width / 2, _this.posY + _this.height / 2, null, null);
            }
            else if (shape instanceof RectPnt) {
                var newPosX = shape.point.posX + (shape.width / 2);
                var newPosY = shape.point.posY + (shape.point.height / 2);
                line.move(newPosX, newPosY, null, null);
            }
        });
        this.linesTo.forEach(function (line) {
            line.move(null, null, _this.posX + _this.width / 2, _this.posY + _this.height / 2);
        });
    };
    return Rect;
}());
var Point = (function (_super) {
    __extends(Point, _super);
    function Point() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Point;
}(Rect));
var RectPnt = (function (_super) {
    __extends(RectPnt, _super);
    function RectPnt(posX, posY, width, height, color) {
        if (posX === void 0) { posX = 100; }
        if (posY === void 0) { posY = 100; }
        if (width === void 0) { width = 100; }
        if (height === void 0) { height = 100; }
        if (color === void 0) { color = Colors.USER; }
        var _this = _super.call(this, posX, posY, width, height, color) || this;
        _this.point = new Point();
        _this.pntColor = Colors.MAIN;
        _this.text = "Ты и я пуста квартира свечи розы шоколад";
        _this.point.width = 10;
        _this.point.height = 10;
        _this.point.posX = _this.posX / 2 + _this.width - _this.point.width / 2 - generalDiffMouseX / 2;
        _this.point.posY = _this.posY + _this.height;
        return _this;
    }
    RectPnt.prototype.move = function (shape, ev) {
        var _this = this;
        shape.posX = ev.offsetX - diffMouseX;
        shape.posY = ev.offsetY - diffMouseY;
        shape.path2d = new Path2D();
        shape.path2d.rect(shape.posX, shape.posY, shape.width, shape.height);
        this.point.posX = this.posX + this.width / 2 - this.point.width / 2;
        this.point.posY = this.posY + this.height;
        this.point.path2d = new Path2D();
        this.point.path2d.rect(this.point.posX, this.point.posY, this.point.width, this.point.height);
        this.linesFrom.forEach(function (line) {
            if (shape instanceof Point) {
                line.move(_this.posX + _this.width / 2, _this.posY + _this.height / 2, null, null);
            }
            else if (shape instanceof RectPnt) {
                var newPosX = _this.point.posX + (_this.point.width / 2);
                var newPosY = _this.point.posY + (_this.point.height / 2);
                line.move(newPosX, newPosY, null, null);
            }
        });
        this.linesTo.forEach(function (line) {
            line.move(null, null, _this.posX + _this.width / 2, _this.posY + _this.height / 2);
        });
    };
    return RectPnt;
}(Rect));
var Line = (function () {
    function Line(fromPosX, fromPosY, toPosX, toPosY, color) {
        if (color === void 0) { color = Colors.MAIN; }
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
    Line.prototype.move = function (offsetFromX, offsetFromY, offsetToX, offsetToY, targetRect) {
        if (offsetFromX === void 0) { offsetFromX = null; }
        if (offsetFromY === void 0) { offsetFromY = null; }
        if (offsetToX === void 0) { offsetToX = null; }
        if (offsetToY === void 0) { offsetToY = null; }
        if (targetRect === void 0) { targetRect = null; }
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
    };
    return Line;
}());
var canvas = new Canvas();
canvas.canvas.addEventListener('click', function (ev) {
    console.log("click ".concat(ev.offsetX, ", ").concat(ev.offsetY));
});
canvas.canvas.addEventListener('mouseup', function (ev) {
    var emptyMouseUp = true;
    var lastElemInArray = allShapes[allShapes.length - 1];
    allShapes.forEach(function (shape) {
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
    allShapes.forEach(function (shape) {
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
        var lastElemInArray = allShapes[allShapes.length - 1];
        if (lastElemInArray instanceof Line) {
            lastElemInArray.move(null, null, ev.offsetX - generalDiffMouseX, ev.offsetY - generalDiffMouseY);
        }
    }
    if (mouseIsDown && mouseOnPoint) {
        var lastElemInArray = allShapes[allShapes.length - 1];
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
        var diffMouseXMove = (mouseXMove - ev.offsetX) * (-1);
        var diffMouseYMove = (mouseYMove - ev.offsetY) * (-1);
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
    var rectWasDeleted = false;
    var slf = [];
    var slt = [];
    allShapes.forEach(function (shape) {
        if (canvas.context.isPointInPath(shape.path2d, ev.offsetX, ev.offsetY) && shape.contextmenuable) {
            ctxmenuOnShape = true;
            rectWasDeleted = true;
            if (shape instanceof Rect) {
                slf = shape.linesFrom;
                slt = shape.linesTo;
                allShapes.splice(allShapes.indexOf(shape), 1);
                shape.linesFrom.forEach(function (line) {
                    allShapes.splice(allShapes.indexOf(line), 1);
                });
                shape.linesTo.forEach(function (line) {
                    allShapes.splice(allShapes.indexOf(line), 1);
                });
            }
        }
        if (shape instanceof Line && !rectWasDeleted) {
            var entry_left = (ev.offsetX - generalDiffMouseX - shape.fromPosX) / (shape.toPosX - shape.fromPosX);
            var entry_right = (ev.offsetY - generalDiffMouseY - shape.fromPosY) / (shape.toPosY - shape.fromPosY);
            if (Math.abs(entry_left - entry_right) <= 0.05) {
                allShapes.splice(allShapes.indexOf(shape), 1);
                allShapes.forEach(function (jshape) {
                    if (jshape instanceof Rect) {
                        jshape.linesFrom.forEach(function (jline) {
                            if (jline == shape) {
                                jshape.linesFrom.splice(jshape.linesFrom.indexOf(jline), 1);
                            }
                        });
                    }
                });
                allShapes.forEach(function (jshape) {
                    if (jshape instanceof Rect) {
                        jshape.linesTo.forEach(function (jline) {
                            if (jline == shape) {
                                jshape.linesTo.splice(jshape.linesTo.indexOf(jline), 1);
                            }
                        });
                    }
                });
            }
        }
    });
    slf.forEach(function (line) {
        allShapes.forEach(function (shape) {
            if (shape instanceof Rect) {
                shape.linesTo.forEach(function (lf) {
                    if (lf == line) {
                        shape.linesTo.splice(shape.linesTo.indexOf(lf), 1);
                    }
                });
            }
        });
    });
    slt.forEach(function (line) {
        allShapes.forEach(function (shape) {
            if (shape instanceof Rect) {
                shape.linesFrom.forEach(function (lt) {
                    if (lt == line) {
                        shape.linesFrom.splice(shape.linesFrom.indexOf(lt), 1);
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
    allShapes.forEach(function (shape) {
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
var countAllShapes = 0;
function renderCanvas() {
    canvas.context.clearRect(clearRectX, clearRectY, canvas.canvas.width, canvas.canvas.height);
    if (countAllShapes != allShapes.length) {
        console.log('cb');
    }
    countAllShapes = allShapes.length;
    allShapes.forEach(function (shape) {
        if (shape instanceof Line) {
            canvas.drawShape(shape);
        }
    });
    allShapes.forEach(function (shape) {
        if (shape instanceof Rect) {
            canvas.drawShape(shape);
        }
    });
    window.requestAnimationFrame(renderCanvas);
}
window.requestAnimationFrame(renderCanvas);
function addState() {
    canvas.addShape(new RectPnt(100 - generalDiffMouseX, 100 - generalDiffMouseY, 100, 100, Colors.USER));
}
function addPoint() {
    canvas.addShape(new Point(100 - generalDiffMouseX, 100 - generalDiffMouseY, 10, 10, Colors.MAIN));
}
