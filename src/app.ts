type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

type Color = RGB | RGBA | HEX;

abstract class Colors {
  static MAIN: Color = "#65bbf4";
  static STATE: Color = "#1f2b38";
  static USER: Color = "#2b5378";
  static LOGIC: Color = "#768c9e";
  static BOT: Color = "#182533";
  static KB: Color = "#1e2c3a";
  static RB: Color = "#b580e2";
  static CB: Color = "#7595ff";
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

let gradient: CanvasGradient | null = null;
let lineHover: Line | null = null;

class Canvas {
  public canvas: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;

  constructor() {
    let canvas = document.getElementById("canvas") as HTMLCanvasElement;

    canvas.width = (
      document.getElementsByClassName("right")[0] as HTMLElement
    ).offsetWidth;
    canvas.height = window.innerHeight - 10;

    let context = canvas.getContext("2d") as CanvasRenderingContext2D;

    this.canvas = canvas;
    this.context = context;
  }

  public addShape(shape: Shape) {
    allShapes.push(shape);
  }

  public include(array, element) {
    let result = false;

    array.forEach((elem) => {
      if (elem == element) {
        result = true;
      }
    });

    return result;
  }

  public getTypeOfRectPnt(rectPnt: RectPnt) {
    if (rectPnt instanceof State) {
      return "State";
    } else if (rectPnt instanceof User) {
      return "User";
    } else if (rectPnt instanceof Logic) {
      return "Logic";
    } else if (rectPnt instanceof Bot) {
      return "Bot";
    } else if (rectPnt instanceof KeyBoard) {
      return "KeyBoard";
    } else if (rectPnt instanceof ReplyButton) {
      return "ReplyButton";
    } else if (rectPnt instanceof CallbackButton) {
      return "CallbackButton";
    }
  }

  public genGramt(): string {
    let gramtFile: any = new Object();

    gramtFile.gramt = { objects: [], logics: [] };

    allShapes.forEach((shape) => {
      if (shape instanceof RectPnt) {
        gramtFile.gramt.objects.push({
          id: allShapes.indexOf(shape),
          type: this.getTypeOfRectPnt(shape),
          props: {
            posX: shape.posX,
            posY: shape.posY,
            width: shape.width,
            height: shape.height,
            color: shape.color,
            connectionsAbove: shape.connection_above.map((value, index) =>
              allShapes.indexOf(value)
            ),
            connectionsBelow: shape.connection_below.map((value, index) =>
              allShapes.indexOf(value)
            ),
            linesFrom: shape.linesFrom.map((value, index) =>
              allShapes.indexOf(value)
            ),
            linesTo: shape.linesTo.map((value, index) =>
              allShapes.indexOf(value)
            ),
          },
        });
      } else if (shape instanceof Line) {
        gramtFile.gramt.objects.push({
          id: allShapes.indexOf(shape),
          type: "Line",
          props: {
            color: shape.color,
            fromPosX: shape.fromPosX,
            fromPosY: shape.fromPosY,
            toPosX: shape.toPosX,
            toPosY: shape.toPosY,
          },
        });
      }
    });

    return JSON.stringify(gramtFile, null, 2);
  }

  public drawShape(shape: Shape) {
    if (shape instanceof RectPnt) {
      let text: string[] = [];

      for (let i = 0; i < shape.text.length; i++) {
        text.push(shape.text[i]);

        let lastLine = text.join("").split("\n")[
          text.join("").split("\n").length - 1
        ];

        if (this.context.measureText(lastLine).width > shape.width - 20) {
          let words = text.join("").split(" ");
          let new_text = [];

          for (let j = 0; j < words.length; j++) {
            if (j != words.length - 1) {
              new_text.push(words[j] + " ");
            } else {
              new_text.push("\n");
              new_text.push(words[j]);
            }
          }

          text = new_text;
        }
      }

      text = text.join("").split("\n");
      shape.setText(text);

      this.context.fillStyle = String(shape.color);
      this.context.fillRect(shape.posX, shape.posY, shape.width, shape.height);

      this.context.fillStyle = String(shape.pntColor);
      this.context.fillRect(
        shape.point.posX,
        shape.point.posY,
        shape.point.width,
        shape.point.height
      );

      this.context.font = "12px OpenSans";
      this.context.fillStyle = "#ffffff";

      if (shape instanceof TextAlignStart) {
        for (let i = 0; i < text.length; i++) {
          this.context.fillText(
            text[i],
            shape.posX + 10,
            shape.posY + i * 17 + 20
          );
        }
      } else if (shape instanceof TextAlignCenter) {
        for (let i = 0; i < text.length; i++) {
          this.context.fillText(
            text[i],
            shape.posX +
              (shape.width - this.context.measureText(text[i]).width) / 2,
            shape.posY + i * 17 + 20
          );
        }
      }
    } else if (shape instanceof Line) {
      this.context.strokeStyle =
        gradient && lineHover === shape ? gradient : String(shape.color);
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

  public path2d: Path2D = new Path2D();

  public connection_above: Rect[] = [];
  public connection_below: Rect[] = [];

  public linesFrom: Line[] = [];
  public linesTo: Line[] = [];

  constructor(
    posX: number = 100,
    posY: number = 100,
    width: number = 100,
    height: number = 100,
    color: Colors = Colors.USER
  ) {
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

    shape.path2d.rect(shape.posX, shape.posY, shape.width, shape.height);

    this.linesFrom.forEach((line) => {
      if (shape instanceof Point) {
        line.move(
          this.posX + this.width / 2,
          this.posY + this.height / 2,
          null,
          null
        );
      } else if (shape instanceof RectPnt) {
        let newPosX: number = shape.point.posX + shape.width / 2;
        let newPosY: number = shape.point.posY + shape.point.height / 2;
        line.move(newPosX, newPosY, null, null);
      }
    });

    this.linesTo.forEach((line) => {
      line.move(
        null,
        null,
        this.posX + this.width / 2,
        this.posY + this.height / 2
      );
    });
  }
}

class Point extends Rect {
  public width: number;
  public height: number;
}

class RectPnt extends Rect {
  public point: Point = new Point();
  public pntColor: Colors = Colors.MAIN;
  public text: string = "";

  constructor(
    posX: number = 100,
    posY: number = 100,
    width: number = 100,
    height: number = 100,
    color: Colors = Colors.USER
  ) {
    super(posX, posY, width, height, color);
    this.point.width = 10;
    this.point.height = 10;

    this.point.posX = this.posX + this.width / 2 - this.point.width / 2;
    this.point.posY = this.posY + this.height;
  }

  public setText(text: string[]) {
    this.text = text.join("");

    let diffHeight: number = text.length * 17 + 20;

    this.height = diffHeight;
    this.point.posY = this.point.posY + diffHeight - this.height;

    this.path2d = new Path2D();
    this.path2d.rect(this.posX, this.posY, this.width, diffHeight);

    this.point.posY = this.posY + diffHeight;

    this.point.path2d = new Path2D();
    this.point.path2d.rect(
      this.posX + this.width / 2 - this.point.width / 2,
      this.posY + diffHeight,
      this.point.width,
      this.point.height
    );
  }

  public move(shape: RectPnt | Point, ev: MouseEvent) {
    shape.posX = ev.offsetX - diffMouseX;
    shape.posY = ev.offsetY - diffMouseY;

    shape.path2d = new Path2D();

    shape.path2d.rect(shape.posX, shape.posY, shape.width, shape.height);

    this.point.posX = this.posX + this.width / 2 - this.point.width / 2;
    this.point.posY = this.posY + this.height;

    this.point.path2d = new Path2D();

    this.point.path2d.rect(
      this.point.posX,
      this.point.posY,
      this.point.width,
      this.point.height
    );

    this.linesFrom.forEach((line) => {
      if (shape instanceof Point) {
        line.move(
          this.posX + this.width / 2,
          this.posY + this.height / 2,
          null,
          null
        );
      } else if (shape instanceof RectPnt) {
        let newPosX: number = this.point.posX + this.point.width / 2;
        let newPosY: number = this.point.posY + this.point.height / 2;
        line.move(newPosX, newPosY, null, null);
      }
    });

    this.linesTo.forEach((line) => {
      line.move(
        null,
        null,
        this.posX + this.width / 2,
        this.posY + this.height / 2
      );
    });
  }
}

class TextAlignStart extends RectPnt {}
class TextAlignCenter extends RectPnt {}

class State extends TextAlignCenter {
  public color: Colors = Colors.STATE;
  public text: string = "STATE";
}

class User extends TextAlignStart {
  public color: Colors = Colors.USER;
  public text: string = "USER";
}

class Logic extends TextAlignCenter {
  public color: Colors = Colors.LOGIC;
  public text: string = "LOGIC";
}

class Bot extends TextAlignStart {
  public color: Colors = Colors.BOT;
  public text: string = "BOT";
}

class KeyBoard extends TextAlignCenter {
  public color: Colors = Colors.KB;
  public text: string = "KB";
}

class ReplyButton extends TextAlignCenter {
  public color: Colors = Colors.RB;
  public text: string = "RB";
}

class CallbackButton extends TextAlignCenter {
  public color: Colors = Colors.CB;
  public text: string = "CB";
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

  constructor(
    fromPosX: number,
    fromPosY: number,
    toPosX: number,
    toPosY: number,
    color: Colors = Colors.LOGIC
  ) {
    this.fromPosX = fromPosX;
    this.fromPosY = fromPosY;
    this.toPosX = toPosX;
    this.toPosY = toPosY;

    this.color = color;

    this.path2d.moveTo(fromPosX, fromPosY);
    this.path2d.lineTo(toPosX, toPosY);
  }

  public move(
    offsetFromX: number | null = null,
    offsetFromY: number | null = null,
    offsetToX: number | null = null,
    offsetToY: number | null = null,
    targetRect: Rect | null = null
  ) {
    if (offsetFromX == null && offsetFromY == null) {
      if (targetRect == null) {
        this.toPosX = offsetToX;
        this.toPosY = offsetToY;
      } else {
        this.toPosX = targetRect.posX + targetRect.width / 2;
        this.toPosY = targetRect.posY + targetRect.height / 2;
      }
    } else if (offsetToX == null && offsetToY == null) {
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

const canvas: Canvas = new Canvas();

canvas.canvas.addEventListener("click", function (ev: MouseEvent) {
  console.log(`click ${ev.offsetX}, ${ev.offsetY}`);
});

canvas.canvas.addEventListener("mouseup", function (ev: MouseEvent) {
  let emptyMouseUp: boolean = true;
  let lastElemInArray: Shape = allShapes[allShapes.length - 1];

  allShapes.forEach((shape) => {
    if (!(shape instanceof Line)) {
      if (
        canvas.context.isPointInPath(shape.path2d, ev.offsetX, ev.offsetY) &&
        (mouseOnRectPnt || mouseOnPoint) &&
        lineIsActive &&
        shape != selectedShape
      ) {
        if (shape instanceof RectPnt) {
          if (lastElemInArray instanceof Line) {
            lastElemInArray.move(null, null, ev.offsetX, ev.offsetY, shape);

            if (selectedShape instanceof Rect) {
              shape.linesTo.push(lastElemInArray);
              selectedShape.linesFrom.push(lastElemInArray);

              if (
                selectedShape instanceof RectPnt &&
                shape instanceof RectPnt
              ) {
                selectedShape.connection_below.push(shape);
                shape.connection_above.push(selectedShape);

                if (selectedShape instanceof State) {
                  if (shape instanceof User) {
                    emptyMouseUp = false;
                  }
                } else if (selectedShape instanceof User) {
                  if (shape instanceof Logic) {
                    emptyMouseUp = false;
                  }
                } else if (selectedShape instanceof Logic) {
                  if (shape instanceof Bot) {
                    emptyMouseUp = false;
                  }
                } else if (selectedShape instanceof Bot) {
                  if (
                    shape instanceof Bot ||
                    shape instanceof Logic ||
                    shape instanceof State ||
                    shape instanceof KeyBoard
                  ) {
                    emptyMouseUp = false;
                  }
                } else if (selectedShape instanceof KeyBoard) {
                  if (!selectedShape.connection_below[0]) {
                    if (
                      shape instanceof ReplyButton ||
                      shape instanceof CallbackButton
                    ) {
                      emptyMouseUp = false;
                    }
                  } else {
                    if (
                      shape instanceof ReplyButton &&
                      selectedShape.connection_below[0] instanceof ReplyButton
                    ) {
                      emptyMouseUp = false;
                    } else if (
                      shape instanceof CallbackButton &&
                      selectedShape.connection_below[0] instanceof
                        CallbackButton
                    ) {
                      emptyMouseUp = false;
                    }
                  }
                }
              }
            }
          }
          // emptyMouseUp = false;
        }
      }
    }
  });

  if (emptyMouseUp && lineIsActive && mouseOnRectPnt) {
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

canvas.canvas.addEventListener("mousedown", function (ev: MouseEvent) {
  allShapes.forEach((shape) => {
    if (
      canvas.context.isPointInPath(shape.path2d, ev.offsetX, ev.offsetY) &&
      shape.clickdownable
    ) {
      mouseIsDown = true;
      if (!mouseIsDbl) {
        selectedShape = shape;
      }

      if (shape instanceof RectPnt) {
        diffMouseX = ev.offsetX - shape.posX;
        diffMouseY = ev.offsetY - shape.posY;
      }
    } else if (shape instanceof RectPnt) {
      if (
        canvas.context.isPointInPath(
          shape.point.path2d,
          ev.offsetX,
          ev.offsetY
        ) &&
        shape.clickdownable
      ) {
        mouseOnRectPnt = true;
        selectedShape = shape;

        allShapes.push(
          new Line(
            shape.point.posX + shape.point.width / 2,
            shape.point.posY + shape.point.height / 2,
            ev.offsetX - generalDiffMouseX,
            ev.offsetY - generalDiffMouseY
          )
        );

        lineIsActive = true;
      }
    }
  });
});

canvas.canvas.addEventListener("mousemove", function (ev: MouseEvent) {
  for (let i = 0; i < allShapes.length; i++) {
    let shape = allShapes[i];

    if (shape instanceof Line) {
      if (
        canvas.context.isPointInStroke(shape.path2d, ev.offsetX, ev.offsetY)
      ) {
        let grad = canvas.context.createLinearGradient(
          shape.fromPosX,
          shape.fromPosY,
          shape.toPosX,
          shape.toPosY
        );
        grad.addColorStop(0, Colors.MAIN);
        grad.addColorStop(1, Colors.USER);

        gradient = grad;
        lineHover = shape;
        break;
      } else {
        gradient = null;
        lineHover = null;
      }
    }
  }

  if (mouseOnRectPnt) {
    let lastElemInArray = allShapes[allShapes.length - 1];
    if (lastElemInArray instanceof Line) {
      lastElemInArray.move(
        null,
        null,
        ev.offsetX - generalDiffMouseX,
        ev.offsetY - generalDiffMouseY
      );
    }
  }
  if (mouseIsDown && mouseOnPoint) {
    let lastElemInArray = allShapes[allShapes.length - 1];
    if (lastElemInArray instanceof Line) {
      lastElemInArray.move(
        null,
        null,
        ev.offsetX - generalDiffMouseX,
        ev.offsetY - generalDiffMouseY
      );
    }
  }
  if (mouseIsDown && !mouseOnPoint) {
    if (selectedShape instanceof RectPnt) {
      selectedShape.move(selectedShape, ev);
      if (selectedShape instanceof RectPnt) {
        selectedShape.point.move(selectedShape, ev);
      }
    }
  }
  if (mouseIsDown && !ctxmenuOnShape && mouseIsCtxmenu) {
    let diffMouseXMove = (mouseXMove - ev.offsetX) * -1;
    let diffMouseYMove = (mouseYMove - ev.offsetY) * -1;

    generalDiffMouseX += diffMouseXMove;
    generalDiffMouseY += diffMouseYMove;

    canvas.context.translate(diffMouseXMove, diffMouseYMove);

    mouseXMove = ev.offsetX;
    mouseYMove = ev.offsetY;

    clearRectX -= diffMouseXMove;
    clearRectY -= diffMouseYMove;
  }
});

canvas.canvas.addEventListener("contextmenu", function (ev: MouseEvent) {
  let rectWasDeleted: boolean = false;

  let slf: Line[] = []; // shape.linesFrom
  let slt: Line[] = []; // shape.linesTo

  let deletedShape: Rect;

  allShapes.forEach((shape) => {
    if (
      canvas.context.isPointInPath(shape.path2d, ev.offsetX, ev.offsetY) &&
      shape.contextmenuable
    ) {
      ctxmenuOnShape = true;
      rectWasDeleted = true;
      if (shape instanceof Rect) {
        slf = shape.linesFrom;
        slt = shape.linesTo;

        deletedShape = shape;

        allShapes.splice(allShapes.indexOf(shape), 1);

        shape.linesFrom.forEach((line) => {
          allShapes.splice(allShapes.indexOf(line), 1);
        });
        shape.linesTo.forEach((line) => {
          allShapes.splice(allShapes.indexOf(line), 1);
        });

        shape.connection_above.forEach((jshape) => {
          jshape.connection_below.splice(
            jshape.connection_below.indexOf(shape),
            1
          );
        });

        shape.connection_below.forEach((jshape) => {
          jshape.connection_above.splice(
            jshape.connection_above.indexOf(shape),
            1
          );
        });
      }
    }
    if (shape instanceof Line && !rectWasDeleted) {
      if (
        canvas.context.isPointInStroke(shape.path2d, ev.offsetX, ev.offsetY)
      ) {
        allShapes.splice(allShapes.indexOf(shape), 1);

        let firstShape: Rect;
        let secondShape: Rect;

        allShapes.forEach((jshape) => {
          if (jshape instanceof Rect) {
            jshape.linesFrom.forEach((jline) => {
              if (jline == shape) {
                firstShape = jshape;
                jshape.linesFrom.splice(jshape.linesFrom.indexOf(jline), 1);
              }
            });
          }
        });
        allShapes.forEach((jshape) => {
          if (jshape instanceof Rect) {
            jshape.linesTo.forEach((jline) => {
              if (jline == shape) {
                secondShape = jshape;
                jshape.linesTo.splice(jshape.linesTo.indexOf(jline), 1);
              }
            });
          }
        });

        firstShape.connection_below.splice(
          firstShape.connection_below.indexOf(secondShape),
          1
        );
        secondShape.connection_above.splice(
          secondShape.connection_above.indexOf(firstShape),
          1
        );
      }
    }
  });

  slf.forEach((line) => {
    allShapes.forEach((shape) => {
      if (shape instanceof Rect) {
        shape.linesTo.forEach((lf) => {
          if (lf == line) {
            shape.linesTo.splice(shape.linesTo.indexOf(lf), 1);
          }
        });
      }
    });
  });

  slt.forEach((line) => {
    allShapes.forEach((shape) => {
      if (shape instanceof Rect) {
        shape.linesFrom.forEach((lt) => {
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

canvas.canvas.addEventListener("dblclick", function (ev: MouseEvent) {});

let countAllShapes = 0;

function renderCanvas() {
  canvas.context.clearRect(
    clearRectX,
    clearRectY,
    canvas.canvas.width,
    canvas.canvas.height
  );

  if (countAllShapes != allShapes.length) {
    console.log("cb");
  }

  countAllShapes = allShapes.length;

  allShapes.forEach((shape) => {
    if (shape instanceof Line) {
      canvas.drawShape(shape);
    }
  });
  allShapes.forEach((shape) => {
    if (shape instanceof Rect) {
      canvas.drawShape(shape);
    }
  });

  let gramtFileField = document.querySelector(".result") as HTMLTextAreaElement;

  gramtFileField.value = canvas.genGramt();

  window.requestAnimationFrame(renderCanvas);
}

window.requestAnimationFrame(renderCanvas);

function add(shape: string) {
  switch (shape) {
    case "state":
      canvas.addShape(
        new State(100 - generalDiffMouseX, 100 - generalDiffMouseY, 100, 100)
      );
      break;
    case "user":
      canvas.addShape(
        new User(100 - generalDiffMouseX, 100 - generalDiffMouseY, 100, 100)
      );
      break;
    case "logic":
      canvas.addShape(
        new Logic(100 - generalDiffMouseX, 100 - generalDiffMouseY, 100, 100)
      );
      break;
    case "bot":
      canvas.addShape(
        new Bot(100 - generalDiffMouseX, 100 - generalDiffMouseY, 100, 100)
      );
      break;
    case "kb":
      canvas.addShape(
        new KeyBoard(100 - generalDiffMouseX, 100 - generalDiffMouseY, 100, 100)
      );
      break;
    case "rb":
      canvas.addShape(
        new ReplyButton(
          100 - generalDiffMouseX,
          100 - generalDiffMouseY,
          100,
          100
        )
      );
      break;
    case "cb":
      canvas.addShape(
        new CallbackButton(
          100 - generalDiffMouseX,
          100 - generalDiffMouseY,
          100,
          100
        )
      );
      break;
  }
}
