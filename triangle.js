//pull in the vertex shader program as an array of strings for GLSL
var vertexShaderText =
[
'precision mediump float;',
'',
'attribute vec2 vertPosition;',
'attribute vec3 vertColor;',
'varying vec3 fragColor;',
'',
'void main() {',
'   fragColor = vertColor;',
'   gl_Position = vec4(vertPosition, 0.0, 1.0);',
'}'    
].join('\n');

//pulls in the fragment shader program as an array of strings for GLSL
var fragmentShaderText = 
[
'precision mediump float;',
'',
'varying vec3 fragColor;',
'void main() {',
'   gl_FragColor= vec4(fragColor, 1.0);',
'}'
].join('\n');

//intializes WebGL context to canvas
var initGL = function() {

    //ensure javascript is working correctly
    console.log('This is working');

    //assin the canvas to the variable canvas
    var canvas = document.getElementById('triangle-canvas');

    //open a webgl context on the canvas
    var gl = canvas.getContext('webgl');
    
    //use experimental webgl for Microsoft browsers
    if(!gl) {
        gl = canvas.getContext('experimental-webgl');
    }

    //stop if webgl is not working
    if(!gl) {
        alert('Your browser does not support WebGl');
    }

    //matches size of canvas to size of window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    //assigns background color and clears buffers for drawing
    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //instantiate the shaders
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    //assign the shader program text as the source code for the shaders
    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

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

    ///create verticies
    var triangleVerticies = 
    [  // X, Y          R G B
        0.0, 0.5,       1.0, 1.0, 0.0,
        -0.5, -0.5,     1.0, 0.3, 0.5,
        0.5, -0.5,      0.4, 1.0, 0.5
    ];

    //create vertex buffer
    var triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    //send to verticies to buffer as 32-bit floating point
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVerticies), gl.STATIC_DRAW);

    //point the shader program to the vertices and colors locations in memory
    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
    gl.vertexAttribPointer(
        positionAttribLocation, //attribute location
        2, //No. of elements per attribute
        gl.FLOAT, //Type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
        0 //Offset from the beginning of a single vertex to this attribute
    );
    gl.vertexAttribPointer(
        colorAttribLocation, //attribute location
        3, //No. of elements per attribute
        gl.FLOAT, //Type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
        2 * Float32Array.BYTES_PER_ELEMENT //Offset from the beginning of a single vertex to this attribute
    );

    //allow access to the vertex array
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    //render
    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}