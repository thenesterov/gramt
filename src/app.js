var Colors = (function () {
    function Colors() {
    }
    Colors.MAIN = "#65bbf4";
    return Colors;
}());
var Canvas = (function () {
    function Canvas() {
        var canvas = document.getElementById('canvas');
        canvas.width = document.getElementsByClassName('right')[0].offsetWidth;
        canvas.height = window.innerHeight - 10;
        var context = canvas.getContext('2d');
        this.canvas = canvas;
        this.context = context;
    }
    Canvas.prototype.drawShape = function (shape, backgroundColor) {
        this.context.fillStyle = String(backgroundColor);
        this.context.fill(shape);
    };
    return Canvas;
}());
var canvas = new Canvas();
