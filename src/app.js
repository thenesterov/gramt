class Colors {
}
Colors.MAIN = "#65bbf4";
Colors.STATE = "#1f2b38";
Colors.USER = "#2b5378";
Colors.LOGIC = "#768c9e";
Colors.BOT = "#182533";
Colors.KB = "#1e2c3a";
Colors.RB = "#b580e2";
Colors.CB = "#7595ff";
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
let gradient = null;
let lineHover = null;
class Canvas {
    constructor() {
        let canvas = document.getElementById("canvas");
        canvas.width = document.getElementsByClassName("right")[0].offsetWidth;
        canvas.height = window.innerHeight - 10;
        let context = canvas.getContext("2d");
        this.canvas = canvas;
        this.context = context;
    }
    addShape(shape) {
        allShapes.push(shape);
    }
    include(array, element) {
        let result = false;
        array.forEach((elem) => {
            if (elem == element) {
                result = true;
            }
        });
        return result;
    }
    getTypeOfRectPnt(rectPnt) {
        if (rectPnt instanceof State) {
            return "State";
        }
        else if (rectPnt instanceof User) {
            return "User";
        }
        else if (rectPnt instanceof Logic) {
            return "Logic";
        }
        else if (rectPnt instanceof Bot) {
            return "Bot";
        }
        else if (rectPnt instanceof KeyBoard) {
            return "KeyBoard";
        }
        else if (rectPnt instanceof ReplyButton) {
            return "ReplyButton";
        }
        else if (rectPnt instanceof CallbackButton) {
            return "CallbackButton";
        }
    }
    genGramt() {
        let gramtFile = new Object();
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
                        connectionsAbove: shape.connection_above.map((value, index) => allShapes.indexOf(value)),
                        connectionsBelow: shape.connection_below.map((value, index) => allShapes.indexOf(value)),
                        linesFrom: shape.linesFrom.map((value, index) => allShapes.indexOf(value)),
                        linesTo: shape.linesTo.map((value, index) => allShapes.indexOf(value)),
                    },
                });
            }
            else if (shape instanceof Line) {
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
    drawShape(shape) {
        if (shape instanceof RectPnt) {
            let text = [];
            for (let i = 0; i < shape.text.length; i++) {
                text.push(shape.text[i]);
                let lastLine = text.join("").split("\n")[text.join("").split("\n").length - 1];
                if (this.context.measureText(lastLine).width > shape.width - 20) {
                    let words = text.join("").split(" ");
                    let new_text = [];
                    for (let j = 0; j < words.length; j++) {
                        if (j != words.length - 1) {
                            new_text.push(words[j] + " ");
                        }
                        else {
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
            this.context.fillRect(shape.point.posX, shape.point.posY, shape.point.width, shape.point.height);
            this.context.font = "12px OpenSans";
            this.context.fillStyle = "#ffffff";
            if (shape instanceof TextAlignStart) {
                for (let i = 0; i < text.length; i++) {
                    this.context.fillText(text[i], shape.posX + 10, shape.posY + i * 17 + 20);
                }
            }
            else if (shape instanceof TextAlignCenter) {
                for (let i = 0; i < text.length; i++) {
                    this.context.fillText(text[i], shape.posX +
                        (shape.width - this.context.measureText(text[i]).width) / 2, shape.posY + i * 17 + 20);
                }
            }
        }
        else if (shape instanceof Line) {
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
        this.path2d = new Path2D();
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
        this.linesFrom.forEach((line) => {
            if (shape instanceof Point) {
                line.move(this.posX + this.width / 2, this.posY + this.height / 2, null, null);
            }
            else if (shape instanceof RectPnt) {
                let newPosX = shape.point.posX + shape.width / 2;
                let newPosY = shape.point.posY + shape.point.height / 2;
                line.move(newPosX, newPosY, null, null);
            }
        });
        this.linesTo.forEach((line) => {
            line.move(null, null, this.posX + this.width / 2, this.posY + this.height / 2);
        });
    }
}
class Point extends Rect {
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
        this.text = text.join("");
        if (canvas.context.measureText(this.text).width > this.width &&
            canvas.context.measureText(this.text).width < 300) {
            this.width = canvas.context.measureText(this.text).width + 35;
        }
        let diffHeight = text.length * 17 + 20;
        this.height = diffHeight;
        this.point.posY = this.point.posY + diffHeight - this.height;
        this.path2d = new Path2D();
        this.path2d.rect(this.posX, this.posY, this.width, diffHeight);
        this.point.posY = this.posY + diffHeight;
        this.point.posX = this.posX + this.width / 2 - this.point.width;
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
        this.linesFrom.forEach((line) => {
            if (shape instanceof Point) {
                line.move(this.posX + this.width / 2, this.posY + this.height / 2, null, null);
            }
            else if (shape instanceof RectPnt) {
                let newPosX = this.point.posX + this.point.width / 2;
                let newPosY = this.point.posY + this.point.height / 2;
                line.move(newPosX, newPosY, null, null);
            }
        });
        this.linesTo.forEach((line) => {
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
        this.text = "STATE";
    }
}
class User extends TextAlignStart {
    constructor() {
        super(...arguments);
        this.color = Colors.USER;
        this.text = "USER";
    }
}
class Logic extends TextAlignCenter {
    constructor() {
        super(...arguments);
        this.color = Colors.LOGIC;
        this.text = "LOGIC";
    }
}
class Bot extends TextAlignStart {
    constructor() {
        super(...arguments);
        this.color = Colors.BOT;
        this.text = "BOT";
    }
}
class KeyBoard extends TextAlignCenter {
    constructor() {
        super(...arguments);
        this.color = Colors.KB;
        this.text = "KB";
    }
}
class ReplyButton extends TextAlignCenter {
    constructor() {
        super(...arguments);
        this.color = Colors.RB;
        this.text = "RB";
    }
}
class CallbackButton extends TextAlignCenter {
    constructor() {
        super(...arguments);
        this.color = Colors.CB;
        this.text = "CB";
    }
}
class Line {
    constructor(fromPosX, fromPosY, toPosX, toPosY, color = Colors.LOGIC) {
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
canvas.canvas.addEventListener("click", function (ev) {
    console.log(`click ${ev.offsetX}, ${ev.offsetY}`);
});
canvas.canvas.addEventListener("mouseup", function (ev) {
    let emptyMouseUp = true;
    let lastElemInArray = allShapes[allShapes.length - 1];
    let currentShape;
    allShapes.forEach((shape) => {
        if (!(shape instanceof Line)) {
            if (canvas.context.isPointInPath(shape.path2d, ev.offsetX, ev.offsetY) &&
                (mouseOnRectPnt || mouseOnPoint) &&
                lineIsActive &&
                shape != selectedShape) {
                if (shape instanceof RectPnt) {
                    if (lastElemInArray instanceof Line) {
                        lastElemInArray.move(null, null, ev.offsetX, ev.offsetY, shape);
                        if (selectedShape instanceof Rect) {
                            shape.linesTo.push(lastElemInArray);
                            selectedShape.linesFrom.push(lastElemInArray);
                            currentShape = shape;
                            if (selectedShape instanceof RectPnt &&
                                shape instanceof RectPnt) {
                                if (selectedShape instanceof State) {
                                    if (shape instanceof User) {
                                        emptyMouseUp = false;
                                    }
                                }
                                else if (selectedShape instanceof User) {
                                    if (shape instanceof Logic) {
                                        if (selectedShape.connection_below.length == 0) {
                                            emptyMouseUp = false;
                                        }
                                    }
                                }
                                else if (selectedShape instanceof Logic) {
                                    if (shape instanceof Bot) {
                                        emptyMouseUp = false;
                                    }
                                }
                                else if (selectedShape instanceof Bot) {
                                    if (shape instanceof Bot ||
                                        shape instanceof Logic ||
                                        shape instanceof State ||
                                        shape instanceof KeyBoard) {
                                        emptyMouseUp = false;
                                        if (shape instanceof KeyBoard) {
                                            if (selectedShape.connection_below.length > 0) {
                                                emptyMouseUp = true;
                                            }
                                        }
                                    }
                                }
                                else if (selectedShape instanceof KeyBoard) {
                                    if (!selectedShape.connection_below[0]) {
                                        if (shape instanceof ReplyButton ||
                                            shape instanceof CallbackButton) {
                                            emptyMouseUp = false;
                                        }
                                    }
                                    else {
                                        if (shape instanceof ReplyButton &&
                                            selectedShape.connection_below[0] instanceof ReplyButton) {
                                            emptyMouseUp = false;
                                        }
                                        else if (shape instanceof CallbackButton &&
                                            selectedShape.connection_below[0] instanceof
                                                CallbackButton) {
                                            emptyMouseUp = false;
                                        }
                                    }
                                }
                                else if (selectedShape instanceof ReplyButton) {
                                    if (shape instanceof Logic) {
                                        emptyMouseUp = false;
                                    }
                                }
                                else if (selectedShape instanceof CallbackButton) {
                                    if (shape instanceof Logic) {
                                        emptyMouseUp = false;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    if (emptyMouseUp && lineIsActive && mouseOnRectPnt) {
        allShapes.pop();
        if (currentShape) {
            currentShape.linesTo.pop();
            if (selectedShape instanceof RectPnt) {
                selectedShape.linesFrom.pop();
            }
        }
        console.log(1);
    }
    else {
        if (currentShape) {
            if (selectedShape instanceof RectPnt) {
                selectedShape.connection_below.push(currentShape);
                currentShape.connection_above.push(selectedShape);
            }
        }
    }
    mouseIsDown = false;
    mouseOnRectPnt = false;
    mouseOnPoint = false;
    mouseIsDbl = false;
    mouseIsCtxmenu = false;
    ctxmenuOnShape = false;
    selectedShape = null;
});
canvas.canvas.addEventListener("mousedown", function (ev) {
    allShapes.forEach((shape) => {
        if (canvas.context.isPointInPath(shape.path2d, ev.offsetX, ev.offsetY) &&
            shape.clickdownable) {
            mouseIsDown = true;
            if (!mouseIsDbl) {
                selectedShape = shape;
            }
            if (shape instanceof RectPnt) {
                diffMouseX = ev.offsetX - shape.posX;
                diffMouseY = ev.offsetY - shape.posY;
            }
        }
        else if (shape instanceof RectPnt) {
            if (canvas.context.isPointInPath(shape.point.path2d, ev.offsetX, ev.offsetY) &&
                shape.clickdownable) {
                mouseOnRectPnt = true;
                selectedShape = shape;
                allShapes.push(new Line(shape.point.posX + shape.point.width / 2, shape.point.posY + shape.point.height / 2, ev.offsetX - generalDiffMouseX, ev.offsetY - generalDiffMouseY));
                lineIsActive = true;
            }
        }
    });
});
canvas.canvas.addEventListener("mousemove", function (ev) {
    for (let i = 0; i < allShapes.length; i++) {
        let shape = allShapes[i];
        if (shape instanceof Line) {
            if (canvas.context.isPointInStroke(shape.path2d, ev.offsetX, ev.offsetY)) {
                let grad = canvas.context.createLinearGradient(shape.fromPosX, shape.fromPosY, shape.toPosX, shape.toPosY);
                grad.addColorStop(0, Colors.MAIN);
                grad.addColorStop(1, Colors.USER);
                gradient = grad;
                lineHover = shape;
                break;
            }
            else {
                gradient = null;
                lineHover = null;
            }
        }
    }
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
canvas.canvas.addEventListener("contextmenu", function (ev) {
    let rectWasDeleted = false;
    let slf = [];
    let slt = [];
    let deletedShape;
    allShapes.forEach((shape) => {
        if (canvas.context.isPointInPath(shape.path2d, ev.offsetX, ev.offsetY) &&
            shape.contextmenuable) {
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
                    jshape.connection_below.splice(jshape.connection_below.indexOf(shape), 1);
                });
                shape.connection_below.forEach((jshape) => {
                    jshape.connection_above.splice(jshape.connection_above.indexOf(shape), 1);
                });
            }
        }
        if (shape instanceof Line && !rectWasDeleted) {
            if (canvas.context.isPointInStroke(shape.path2d, ev.offsetX, ev.offsetY)) {
                allShapes.splice(allShapes.indexOf(shape), 1);
                let firstShape;
                let secondShape;
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
                firstShape.connection_below.splice(firstShape.connection_below.indexOf(secondShape), 1);
                secondShape.connection_above.splice(secondShape.connection_above.indexOf(firstShape), 1);
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
canvas.canvas.addEventListener("dblclick", function (ev) {
    allShapes.forEach((shape) => {
        if (shape instanceof RectPnt) {
            if (canvas.context.isPointInPath(shape.path2d, ev.offsetX, ev.offsetY)) {
                let modal = document.querySelector("#modal-content");
                if (shape instanceof State) {
                    modal.innerHTML = "";
                    let content = "";
                    content += `
          <span>
            Название:
          </span>
          <input placeholder="Название стейта" value="${shape.text}" class="title_of_state">`;
                    content +=
                        `<button class="lbtn mt10" onclick="saveChangesState(` +
                            allShapes.indexOf(shape) +
                            `, 'title_of_state');">Сохранить</button>`;
                    modal.innerHTML = content;
                }
                if (shape instanceof User) {
                    modal.innerHTML = "";
                    let content = "";
                    if (shape.connection_above.length > 0) {
                        content += "<span>Состояния:</span><ul>";
                        shape.connection_above.forEach((con) => {
                            if (con instanceof State) {
                                content += `<li>${con.text}</li>`;
                            }
                        });
                        content += "</ul>";
                    }
                    content += `
          <span>
            Текст:
          </span>
          <input placeholder="Текст сообщения" value="${shape.text}" class="text_of_user_message"><br>`;
                    for (let i = shape.connection_below.length; i > 0; i--) {
                        let con = shape.connection_below[i - 1];
                        if (con instanceof Logic) {
                            content += `<span>Контроллер:</span> <div style="display: inline-block;">${con.text}</div>`;
                            break;
                        }
                    }
                    content +=
                        `<button class="lbtn mt10" onclick="saveChangesUser(` +
                            allShapes.indexOf(shape) +
                            `, 'text_of_user_message');">Сохранить</button>`;
                    modal.innerHTML = content;
                }
                if (shape instanceof Logic) {
                    modal.innerHTML = "";
                    let content = "";
                    content += `
          <span>
            Название:
          </span>
          <input placeholder="Название контроллера" value="${shape.text}" class="title_of_logic">`;
                    content += `Доступные данные о сообщении:
          <ul>
            <li><b>Дата сообщения: </b>msg.date</li>
            <li><b>Айди пользователя: </b>msg.from_user.id</li>
            <li><b>Имя: </b>msg.from_user.first_name</li>
            <li><b>Фамилия: </b>msg.from_user.last_name</li>
            <li><b>Юзернейм: </b>msg.from_user.username</li>
          </ul>
          `;
                    content += `<span>Код:</span><br><textarea class="code_logic"></textarea>`;
                    content += `<span>Доступные сообщения: </span><select id="select_botmsg_id" onchange="changeBotmsg('select_botmsg_id');">`;
                    for (let i = 0; i < shape.connection_below.length; i++) {
                        let con = shape.connection_below[i];
                        if (con instanceof Bot) {
                            content += `<option value=${allShapes.indexOf(con)}>${allShapes.indexOf(con)}</option>`;
                        }
                    }
                    content += `</select><div id="bot_msg">`;
                    for (let i = 0; i < shape.connection_below.length; i++) {
                        let con = shape.connection_below[i];
                        if (con instanceof Bot) {
                            content += `${con.text}`;
                            break;
                        }
                    }
                    content += `</div>`;
                    content +=
                        `<button class="lbtn mt10" onclick="saveChangesLogic(` +
                            allShapes.indexOf(shape) +
                            `, 'title_of_logic');">Сохранить</button>`;
                    modal.innerHTML = content;
                }
                if (shape instanceof Bot) {
                    modal.innerHTML = "";
                    let content = "";
                    content += `
          <span>
            Текст:
          </span>
          <input placeholder="Текст сообщения" value="${shape.text}" class="text_of_botmsg"><br>`;
                    for (let i = shape.connection_below.length; i > 0; i--) {
                        let con = shape.connection_below[i - 1];
                        if (con instanceof State) {
                            content += `<span>Перейти в состояние:</span> <div style="display: inline-block;">${con.text}</div><br>`;
                            break;
                        }
                    }
                    for (let i = shape.connection_below.length; i > 0; i--) {
                        let con = shape.connection_below[i - 1];
                        if (con instanceof KeyBoard) {
                            content += `<span>Клавиатура:</span> <div style="display: inline-block;">${con.text}</div>`;
                            break;
                        }
                    }
                    content +=
                        `<button class="lbtn mt10" onclick="saveChangesBot(` +
                            allShapes.indexOf(shape) +
                            `, 'text_of_botmsg');">Сохранить</button>`;
                    modal.innerHTML = content;
                }
                if (shape instanceof KeyBoard) {
                    modal.innerHTML = "";
                    let content = "";
                    content += `
          <span>
            Название:
          </span>
          <input placeholder="Название кнопки" value="${shape.text}" class="text_of_kb"><br>`;
                    content +=
                        `<button class="lbtn mt10" onclick="saveChangesKB(` +
                            allShapes.indexOf(shape) +
                            `, 'text_of_kb');">Сохранить</button>`;
                    modal.innerHTML = content;
                }
                if (shape instanceof ReplyButton) {
                    modal.innerHTML = "";
                    let content = "";
                    content += `
          <span>
            Текст:
          </span>
          <input placeholder="Текст кнопки" value="${shape.text}" class="text_of_reply_button"><br>`;
                    for (let i = shape.connection_below.length; i > 0; i--) {
                        let con = shape.connection_below[i - 1];
                        if (con instanceof Logic) {
                            content += `<span>Контроллер:</span> <div style="display: inline-block;">${con.text}</div>`;
                            break;
                        }
                    }
                    content +=
                        `<button class="lbtn mt10" onclick="saveChangesRB(` +
                            allShapes.indexOf(shape) +
                            `, 'text_of_reply_button');">Сохранить</button>`;
                    modal.innerHTML = content;
                }
                if (shape instanceof CallbackButton) {
                    modal.innerHTML = "";
                    let content = "";
                    content += `
          <span>
            Текст:
          </span>
          <input placeholder="Текст кнопки" value="${shape.text}" class="text_of_callback_button"><br>`;
                    for (let i = shape.connection_below.length; i > 0; i--) {
                        let con = shape.connection_below[i - 1];
                        if (con instanceof Logic) {
                            content += `<span>Контроллер:</span> <div style="display: inline-block;">${con.text}</div>`;
                            break;
                        }
                    }
                    content +=
                        `<button class="lbtn mt10" onclick="saveChangesCB(` +
                            allShapes.indexOf(shape) +
                            `, 'text_of_callback_button');">Сохранить</button>`;
                    modal.innerHTML = content;
                }
                toggleModal();
            }
        }
    });
});
let countAllShapes = 0;
function renderCanvas() {
    canvas.context.clearRect(clearRectX, clearRectY, canvas.canvas.width, canvas.canvas.height);
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
    let gramtFileField = document.querySelector(".result");
    gramtFileField.value = canvas.genGramt();
    downloadGramt();
    window.requestAnimationFrame(renderCanvas);
}
window.requestAnimationFrame(renderCanvas);
function add(shape) {
    switch (shape) {
        case "state":
            canvas.addShape(new State(100 - generalDiffMouseX, 100 - generalDiffMouseY, 150, 100));
            break;
        case "user":
            canvas.addShape(new User(100 - generalDiffMouseX, 100 - generalDiffMouseY, 150, 100));
            break;
        case "logic":
            canvas.addShape(new Logic(100 - generalDiffMouseX, 100 - generalDiffMouseY, 150, 100));
            break;
        case "bot":
            canvas.addShape(new Bot(100 - generalDiffMouseX, 100 - generalDiffMouseY, 150, 150));
            break;
        case "kb":
            canvas.addShape(new KeyBoard(100 - generalDiffMouseX, 100 - generalDiffMouseY, 150, 100));
            break;
        case "rb":
            canvas.addShape(new ReplyButton(100 - generalDiffMouseX, 100 - generalDiffMouseY, 150, 100));
            break;
        case "cb":
            canvas.addShape(new CallbackButton(100 - generalDiffMouseX, 100 - generalDiffMouseY, 150, 100));
            break;
    }
}
function downloadGramt() {
    let exportGramtButton = document.getElementById("exportGramt");
    let textArea = document.querySelector(".result");
    exportGramtButton.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(textArea.value));
    exportGramtButton.setAttribute("download", "bot.gramt");
}
function changeBotmsg(id) {
    let select = document.getElementById(id).value;
    let div = document.getElementById("bot_msg");
    div.innerHTML = allShapes[select].text;
}
function saveChangesState(id, class_) {
    let text = document.getElementsByClassName(class_)[0]
        .value;
    allShapes.forEach((shape) => {
        if (allShapes.indexOf(shape) == id) {
            if (shape instanceof State) {
                shape.text = text.toUpperCase();
            }
        }
    });
    toggleModal();
}
function saveChangesUser(id, class_) {
    let text = document.getElementsByClassName(class_)[0]
        .value;
    allShapes.forEach((shape) => {
        if (allShapes.indexOf(shape) == id) {
            if (shape instanceof User) {
                shape.text = text;
            }
        }
    });
    toggleModal();
}
function saveChangesLogic(id, class_) {
    let text = document.getElementsByClassName(class_)[0]
        .value;
    allShapes.forEach((shape) => {
        if (allShapes.indexOf(shape) == id) {
            if (shape instanceof Logic) {
                shape.text = text.toUpperCase();
            }
        }
    });
    toggleModal();
}
function saveChangesBot(id, class_) {
    let text = document.getElementsByClassName(class_)[0]
        .value;
    allShapes.forEach((shape) => {
        if (allShapes.indexOf(shape) == id) {
            if (shape instanceof Bot) {
                shape.text = text;
            }
        }
    });
    toggleModal();
}
function saveChangesKB(id, class_) {
    let text = document.getElementsByClassName(class_)[0]
        .value;
    allShapes.forEach((shape) => {
        if (allShapes.indexOf(shape) == id) {
            if (shape instanceof KeyBoard) {
                shape.text = text;
            }
        }
    });
    toggleModal();
}
function saveChangesRB(id, class_) {
    let text = document.getElementsByClassName(class_)[0]
        .value;
    allShapes.forEach((shape) => {
        if (allShapes.indexOf(shape) == id) {
            if (shape instanceof ReplyButton) {
                shape.text = text;
            }
        }
    });
    toggleModal();
}
function saveChangesCB(id, class_) {
    let text = document.getElementsByClassName(class_)[0]
        .value;
    allShapes.forEach((shape) => {
        if (allShapes.indexOf(shape) == id) {
            if (shape instanceof CallbackButton) {
                shape.text = text;
            }
        }
    });
    toggleModal();
}
let modal = document.querySelector(".modal");
let closeButton = document.querySelector(".close-button");
function toggleModal() {
    modal.classList.toggle("show-modal");
}
function windowOnClick(event) {
    if (event.target === modal) {
        toggleModal();
    }
}
closeButton.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);
