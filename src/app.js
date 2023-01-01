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
        this.width = 100;
        this.posY = 100;
        this.posX = 100;
        this.height = 100;
        this.color = Colors.MAIN;
        this.movable = true;
        this.clickdownable = true;
        this.dblclickable = true;
        this.path2d = new Path2D;
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
        this.color = color;
        this.path2d.rect(this.posX, this.posY, this.width, this.height);
    }
    return Rect;
}());
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
            diffMouseX = ev.offsetX - shape.posX;
            diffMouseY = ev.offsetY - shape.posY;
        }
    });
});
canvas.canvas.addEventListener('mousemove', function (ev) {
    if (mouseIsDown) {
        allShapes[allShapes.indexOf(selectedShape)].posX = ev.offsetX - diffMouseX;
        allShapes[allShapes.indexOf(selectedShape)].posY = ev.offsetY - diffMouseY;
        allShapes[allShapes.indexOf(selectedShape)].path2d = new Path2D();
        allShapes[allShapes.indexOf(selectedShape)].path2d.rect(allShapes[allShapes.indexOf(selectedShape)].posX, allShapes[allShapes.indexOf(selectedShape)].posY, allShapes[allShapes.indexOf(selectedShape)].width, allShapes[allShapes.indexOf(selectedShape)].height);
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
