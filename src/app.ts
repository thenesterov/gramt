type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

type Color = RGB | RGBA | HEX;

abstract class Colors {
    static MAIN: Color = "#65bbf4";
}

class Canvas {
    private canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;

    constructor() {
        let canvas = document.getElementById('canvas') as HTMLCanvasElement;

        canvas.width = (document.getElementsByClassName('right')[0] as HTMLElement).offsetWidth;
        canvas.height = window.innerHeight - 10;

        let context = canvas.getContext('2d') as CanvasRenderingContext2D;

        this.canvas = canvas;
        this.context = context;
    }

    public drawShape(shape: Path2D, backgroundColor: Colors) {
        this.context.fillStyle = String(backgroundColor);
        this.context.fill(shape);
    }
}

const canvas: Canvas = new Canvas();