//helper function to get element by id 
const returnIdElement = (id) => {
    var element = document.getElementById(id);
    return element; 
}

// canvas element
var canvas = returnIdElement("board"); 
var context = returnIdElement("board").getContext("2d");
//boolean value that indicates whether user is drawing or not 
let isDrawing = false;
let xCoor = 0, yCoor = 0;

//functions to draw on the canvas 
canvas.addEventListener('mousedown', e =>{
    xCoor = e.offsetX;
    yCoor = e.offsetY;
    isDrawing = true; 
})

canvas.addEventListener('mousemove', e => {
    if (isDrawing) {
        draw(xCoor, yCoor, e.offsetX, e.offsetY);
        xCoor = e.offsetX;
        yCoor = e.offsetY; 
    }
})

canvas.addEventListener('mouseup', e => {
    if (isDrawing) {
        draw(xCoor, yCoor, e.offsetX, e.offsetY);
        xCoor = 0; 
        yCoor = 0;
        isDrawing = false;
    }
})

//returns thickness of pen 
const get_pen_thickness = () => {
    let slider = returnIdElement("size");
    return slider.value; 
}
//returns color of pen 
const get_color = () => {
    let color = document.querySelector("#color-selector")
    return color.value; 
}

//function to draw on canvas 
const draw = (x1, y1, x2, y2) => {
    context.beginPath();
    context.strokeStyle = get_color();
    context.lineWidth = get_pen_thickness();
    context.fillStyle = get_color(); 
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
}



//save the whiteboard contents in form of a png 
const save = () =>  {
    let imageName = prompt('Please enter image name');
    let anchor = document.createElement('a');
    var canvasURL = returnIdElement("board").toDataURL(); 
    anchor.href = canvasURL;
    anchor.download = imageName || 'sketch'; 
    anchor.click();
}

//reset the whiteboard back to black 
const reset_board = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

//changes thickness of pen 
const set_pen_thickness = () => {
    let slider = returnIdElement("size");
    let value = returnIdElement("val");
    value.innerHTML = slider.value; 
}


