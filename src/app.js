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
var diffMouseX = 0;
var diffMouseY = 0;
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
    Canvas.prototype.drawShape = function (shape) {
        if (shape instanceof RectPnt) {
            this.context.fillStyle = String(shape.color);
            this.context.fillRect(shape.posX, shape.posY, shape.width, shape.height);
            this.context.fillStyle = String(shape.pntColor);
            this.context.fillRect(shape.point.posX, shape.point.posY, shape.point.width, shape.point.height);
        }
        else if (shape instanceof Point) {
            this.context.fillStyle = String(shape.color);
            this.context.fillRect(shape.posX, shape.posY, shape.width, shape.height);
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
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
        this.color = color;
        this.path2d.rect(this.posX, this.posY, this.width, this.height);
    }
    Rect.prototype.move = function (shape, ev) {
        shape.posX = ev.offsetX - diffMouseX;
        shape.posY = ev.offsetY - diffMouseY;
        shape.path2d = new Path2D();
        shape.path2d.rect(shape.posX, shape.posY, shape.width, shape.height);
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
        _this.point.width = 10;
        _this.point.height = 10;
        _this.point.posX = _this.posX / 2 + _this.width - _this.point.width / 2;
        _this.point.posY = _this.posY + _this.height;
        return _this;
    }
    RectPnt.prototype.move = function (shape, ev) {
        shape.posX = ev.offsetX - diffMouseX;
        shape.posY = ev.offsetY - diffMouseY;
        shape.path2d = new Path2D();
        shape.path2d.rect(shape.posX, shape.posY, shape.width, shape.height);
        this.point.posX = this.posX + this.width / 2 - this.point.width / 2;
        this.point.posY = this.posY + this.height;
        this.point.path2d = new Path2D();
        this.point.path2d.rect(this.point.posX, this.point.posY, this.point.width, this.point.height);
    };
    return RectPnt;
}(Rect));
var canvas = new Canvas();
canvas.canvas.addEventListener('mouseup', function (ev) {
    mouseIsDown = false;
    selectedShape = null;
});
canvas.canvas.addEventListener('mousedown', function (ev) {
    allShapes.forEach(function (shape) {
        if (canvas.context.isPointInPath(shape.path2d, ev.offsetX, ev.offsetY) && shape.clickdownable) {
            mouseIsDown = true;
            selectedShape = shape;
            if (shape instanceof RectPnt || shape instanceof Point) {
                diffMouseX = ev.offsetX - shape.posX;
                diffMouseY = ev.offsetY - shape.posY;
            }
        }
    });
});
canvas.canvas.addEventListener('mousemove', function (ev) {
    if (mouseIsDown) {
        var shape = allShapes[allShapes.indexOf(selectedShape)];
        if (shape instanceof RectPnt || shape instanceof Point) {
            shape.move(shape, ev);
            if (shape instanceof RectPnt) {
                shape.point.move(shape, ev);
            }
        }
    }
});
function renderCanvas() {
    canvas.context.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
    allShapes.forEach(function (shape) {
        canvas.drawShape(shape);
    });
    window.requestAnimationFrame(renderCanvas);
}
window.requestAnimationFrame(renderCanvas);
