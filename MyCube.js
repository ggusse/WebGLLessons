"use strict";

//global variables to hold canvas and gl context
var canvas;
var gl;

//number of vertices
var NumVertices  = 36;

//arrays for vertex and color coordinates
var points = [];
var colors = [];

//idicies for each of the axes of rotation
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

//array for theta of each axis
var theta = [0, 0, 0];

//variable for memory location of theta array
var thetaLoc;

//intializes WebGL context to canvas
var initGL = function() {

    //ensure javascript is working correctly
    console.log('This is working');

    //assin the canvas to the variable canvas
    canvas = document.getElementById('cube-canvas');

    //open a webgl context on the canvas
    gl = canvas.getContext('webgl');
    
    //use experimental webgl for Microsoft browsers
    if(!gl) {
        gl = canvas.getContext('experimental-webgl');
    }

    //stop if webgl is not working
    if(!gl) {
        alert('Your browser does not support WebGl');
    }
    
    //generate arrays of vertices and corresponding colors
    colorCube();

    //matches size of canvas to size of window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    //assigns background color and clears buffers for drawing
    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //enable depth testing
    gl.enable(gl.DEPTH_TEST);

    //instantiate the shaders
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    //assign the shader program text as the source code for the shaders
    gl.shaderSource(vertexShader, document.getElementById('vertex-shader').text);
    gl.shaderSource(fragmentShader, document.getElementById('fragment-shader').text);

    //compile shaders and check for completion
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        console.error('ERROR comiling vertex shader', gl.getShaderInfoLog(vertexShader));
        return;
    }
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        console.error('ERROR comiling fragment shader', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    //combine the shaders for the graphics pipeline 
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    //link the program to the context
    gl.linkProgram(program);
    //check for successful link
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking program', gl.getProgramInfoLog(program));
        return;
    }
    //check for any other errors with the program
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program', gl.getProgramInfoLog(program));
        return;
    }
    
    //instruct gl context to use the shader program
    gl.useProgram(program);
    
    //create buffer for colors
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    //assign colors to vertices in GLSL
    var vertColor = gl.getAttribLocation(program, "vertColor");
    gl.vertexAttribPointer(vertColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertColor);

    //create buffer for vertices
    var vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    //assign verticies to positions in GLSL
    var vertPosition = gl.getAttribLocation(program, "vertPosition");
    gl.vertexAttribPointer(vertPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertPosition);

    //assign theta in GLSL to memory location
    thetaLoc = gl.getUniformLocation(program, "theta");

    //render the cube
    render();
}


//setup faces of the cube
function colorCube()
{
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

//construct faces from two triangles for rendering
function quad(a, b, c, d)
{
    var vertices = [
        vec4(-0.5, -0.5,  0.5, 1.0),
        vec4(-0.5,  0.5,  0.5, 1.0),
        vec4( 0.5,  0.5,  0.5, 1.0),
        vec4( 0.5, -0.5,  0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5,  0.5, -0.5, 1.0),
        vec4( 0.5,  0.5, -0.5, 1.0),
        vec4( 0.5, -0.5, -0.5, 1.0)
    ];

    var vertexColors = [
        [0.0, 0.0, 0.0, 1.0],        // black
        [0.294, 0.000, 0.510, 1.0],  // indigo
        [0.498, 1.000, 0.000, 1.0],  // chartreuse 
        [0.000, 0.980, 0.604, 1.0],  // spring green
        [0.400, 0.804, 0.667, 1.0],  // aquamarine
        [0.416, 0.353, 0.804, 1.0],  // slate blue
        [0.0, 1.0, 1.0, 1.0],        // cyan
        [1.0, 1.0, 1.0, 1.0]         // white
    ];

    //assign colors to each vertex
    var indices = [a, b, c, a, c, d];
    for (var i = 0; i < indices.length; ++i) {
        points.push(vertices[indices[i]]);
        colors.push(vertexColors[a]);
    }
}

//function for rendering the cube
function render()
{
    //clear the screen for rendering
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //increment the angles to animate rotations
    theta[0] += 0.2;
    theta[1] += 0.4;
    theta[2] += 0.6;

    //change the angles in GLSL
    gl.uniform3fv(thetaLoc, theta);

    //draw the cube with each update recursively
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
    requestAnimationFrame(render);
}