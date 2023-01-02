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
        if (shape instanceof Rect) {
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
        this.posX = 100;
        this.posY = 100;
        this.width = 100;
        this.height = 100;
        this.color = Colors.MAIN;
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
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.width = 10;
        _this.height = 10;
        _this.dblclickable = false;
        return _this;
    }
    return Point;
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
            if (shape instanceof Rect) {
                diffMouseX = ev.offsetX - shape.posX;
                diffMouseY = ev.offsetY - shape.posY;
            }
        }
    });
});
canvas.canvas.addEventListener('mousemove', function (ev) {
    if (mouseIsDown) {
        var shape = allShapes[allShapes.indexOf(selectedShape)];
        if (shape instanceof Rect) {
            shape.move(shape, ev);
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
