/*
FILE NAME  : axii_and_scales.js
DESCRIPTION: optical design
REVISION: 1.00
AUTHOR: Oleg Dzhimiev <oleg@elphel.com>
LICENSE: AGPL, see http://www.gnu.org/licenses/agpl.txt
Copyright (C) 2014 Elphel, Inc.
*/

function draw_axii(){
  //x-axis
  $("#cnv1").drawLine({
    layer: true,
    name: "axis_x",
    strokeStyle: "rgba(50,50,50,0.5)",
    strokeWidth: 0.5,
    x1: x0, y1: $("#cnv1").height()/2,
    x2: $("#cnv1").width()-x0, y2: $("#cnv1").height()/2
  });

  $("#cnv1").drawLine({
    layer: true,
    name: "axis_x_arrow",
    strokeStyle: "rgba(50,50,50,0.5)",
    fillStyle: "rgba(50,50,50,0.5)",
    strokeWidth: 0.5,
    x1: $("#cnv1").width()-x0,    y1: $("#cnv1").height()/2,
    x2: $("#cnv1").width()-x0-x0, y2: $("#cnv1").height()/2+2,
    x3: $("#cnv1").width()-x0-x0, y3: $("#cnv1").height()/2-2,
  });
  
  $("#cnv1").drawText({
    layer: true,
    name: "axis_x_label",
    fillStyle: "rgba(0,0,0,0.5)",
    x: $("#cnv1").width()-x0, y: $("#cnv1").height()/2+y0,
    font: "8px Arial, sans-serif",
    align:"left",
    text: "z"
  });
  
  //y-axis
  $("#cnv1").drawLine({
    layer: true,
    name: "axis_y",
    strokeStyle: "rgba(50,50,50,0.5)",
    strokeWidth: 0.5,
    x1: xO, y1: $("#cnv1").height()-3*y0+5,
    x2: xO, y2: y0
  });

  $("#cnv1").drawLine({
    layer: true,
    name: "axis_y_arrow",
    strokeStyle: "rgba(50,50,50,0.5)",
    fillStyle: "rgba(50,50,50,0.5)",
    strokeWidth: 0.5,
    x1: xO,    y1: y0,
    x2: xO+2, y2: y0+y0,
    x3: xO-2, y3: y0+y0,
  });
  
  $("#cnv1").drawText({
    layer: true,
    name: "axis_y_label",
    fillStyle: "rgba(0,0,0,0.5)",
    x: xO-x0, y: y0,
    font: "8px Arial, sans-serif",
    align:"left",
    text: "y"
  });
  
}

//draw mm scale
function draw_reference_scale(){
    var sx0=xO;
    var sy0=$("#cnv1").height()-y0-5;
    //lines
    $("#cnv1").drawLine({
      layer: true,
      strokeStyle: "rgba(0,0,0,1)",
      strokeWidth: 0.5,
      x1: sx0, y1: sy0-5,
      x2: sx0, y2: sy0+5,
      x3: sx0, y3: sy0,
      x4: sx0+canvas_reference_scale, y4: sy0,   
      x5: sx0+canvas_reference_scale, y5: sy0-5,
      x6: sx0+canvas_reference_scale, y6: sy0+5,
      cornerRadius: 0,
    });
    //1m label
    $("#cnv1").drawText({
      layer: true,
      fillStyle: "rgba(0,0,0,1)",
      x: sx0+canvas_reference_scale-30, y: sy0-10,
      font: "8pt Verdana, sans-serif",
      align:"left",
      text: (canvas_reference_scale/canvas_scale)+"mm"
    });
}

function draw_scale(){
    canvas_length = $("#cnv1").width() - 3*x0;   
    //mm scale
    canvas_scale_steps = canvas_length/canvas_reference_scale;
    
    for (var i=1;i<canvas_scale_steps;i++){
	$("#cnv1").drawLine({
	  layer: true,
	  strokeStyle: "rgba(0,0,0,0.5)",
	  strokeWidth: 0.5,
	  x1: xO+(canvas_reference_scale*i), y1: $("#cnv1").height()/2-3,
	  x2: xO+(canvas_reference_scale*i), y2: $("#cnv1").height()/2+3
	});
	if (i%5==0) {
	  if ((xO+(canvas_reference_scale*i)+12)<($("#cnv1").width() - xO))
	  $("#cnv1").drawText({
	    layer: true,
	    fillStyle: "rgba(0,0,0,0.5)",
	    x: xO+(canvas_reference_scale*i)+3, y: $("#cnv1").height()/2-14,
	    font: "8pt Verdana, sans-serif",
	    align:"left",
	    text: i*(canvas_reference_scale/canvas_scale)+"mm"
	  });
	}
    }
    
    canvas_height = $("#cnv1").height()/2 - 3*y0/2;
    canvas_scale_steps = canvas_height/canvas_reference_scale;
    for (var i=1;i<canvas_scale_steps;i++){
	$("#cnv1").drawLine({
	  layer: true,
	  strokeStyle: "rgba(0,0,0,0.5)",
	  strokeWidth: 0.5,
	  x1: xO-3, y1: $("#cnv1").height()/2-(canvas_reference_scale*i),
	  x2: xO+3, y2: $("#cnv1").height()/2-(canvas_reference_scale*i)
	});
	$("#cnv1").drawLine({
	  layer: true,
	  strokeStyle: "rgba(0,0,0,0.5)",
	  strokeWidth: 0.5,
	  x1: xO-3, y1: $("#cnv1").height()/2+(canvas_reference_scale*i),
	  x2: xO+3, y2: $("#cnv1").height()/2+(canvas_reference_scale*i)
	});
    }
}