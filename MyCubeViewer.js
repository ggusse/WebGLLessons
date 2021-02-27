"use strict";

//global variables to hold canvas and gl context
var canvas;
var gl;

//number of vertices
var NumVertices  = 36;

//arrays for vertex and color coordinates
var points = [];
var colors = [];


//dimension viewer variables
var near = -1;
var far = 1;
var radius = 1.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;
var left = -1.0;
var right = 1.0;
var ytop = 1.0;
var bottom = -1.0;

//dimension matrices and constants
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);



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

    //assign memory positions for matrices in GLSL
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    //event listener to change depth slider
    document.getElementById("depthSlider").onchange = function() {
        var depthValue = document.getElementById("depthSlider").value;
        far = depthValue/2;
        near = -depthValue/2;
    }

    //event listener to change radius slider
    document.getElementById("radiusSlider").onchange = function() {
        var radiusValue = document.getElementById("radiusSlider").value;
        radius = radiusValue/2;
    }

    //event listener to change theta slider
    document.getElementById("thetaSlider").onchange = function() {
        var thetaValue = document.getElementById("thetaSlider").value;
        theta = -dr * thetaValue;
    }

    //event listener to change phi slider
    document.getElementById("phiSlider").onchange = function() {
        var phiValue = document.getElementById("phiSlider").value;
        phi = -dr * phiValue;
    }

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

    //determine model-view and projection matrices
    eye = vec3(radius*Math.sin(phi), radius*Math.sin(theta), radius*Math.cos(phi));
    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    //draw the cube with each update recursively
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
    requestAnimationFrame(render);
}