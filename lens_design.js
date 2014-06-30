/*
FILE NAME  : lens_design.js
DESCRIPTION: optical design
REVISION: 1.00
AUTHOR: Oleg Dzhimiev <oleg@elphel.com>
LICENSE: AGPL, see http://www.gnu.org/licenses/agpl.txt
Copyright (C) 2014 Elphel, Inc.
*/
var medium = "air";

var x0=10;
var y0=10;
canvas_reference_scale = 200;
canvas_scale = 20;

var xO = 10*x0;
var yO = 200;

var e = Array();

var selected_elements = Array();

var epsilon = 0.0001;
var epsilon2 = 0.0001;

var file = "";
var path = "";

$(function(){
  yO = $("#cnv1").height()/2;
  console.log("Drawing axii");
  draw_axii();
  draw_reference_scale();
  draw_scale();
  $("#cnv1").on("click",function(){
    deselect_all_elements();
  });
  //disable scroll over canvas and bind a new action
  cnv_div = document.getElementById('cnv1_div');
  if (cnv_div.addEventListener) cnv_div.addEventListener('DOMMouseScroll', wheelEvent, false);
  cnv_div.onmousewheel = wheelEvent;
  
  parseURL();
  if (file!=""&&path!="") {
    getDesign(file,path);
  }
  
  //ray_draw(0,0,0);
  
});

function element_add_button(){
  //defaults
  array_add_element(
    0,//distance
    1,//thickness
    "BK7",//glass
    "",//comment
    8,//front height
    15,//front curve radius
    0,//front k
    0,//front a1
    0,//front a2
    0,//front a3
    0,//front a4
    8,//back height
    -1000,//back curve radius
    0,//back k
    0,//back a1
    0,//back a2
    0,//back a3
    0 //back a4
  );
}

function array_add_element(d,t,m,name,fh,fc,fk,fa1,fa2,fa3,fa4,bh,bc,bk,ba1,ba2,ba3,ba4){
  console.log("Drawing at "+d);
  var ind=e.length;
  var id=0;
  for(var i=0;i<e.length;i++){
     if (e[i].id>=id) id = parseInt(e[i].id)+1;
  }
  e[ind] = new Object();
  
  e[ind].id = parseInt(id);
  e[ind].d = +d;
  e[ind].t = +t;
  e[ind].m = m;
  e[ind].name = name;
    
  e[ind].front = {
    h: +fh,
    c: +fc,
    k: +fk,
    a: [+fa1,+fa2,+fa3,+fa4]
  };

  e[ind].back = {
    h: +bh,
    c: +bc,
    k: +bk,
    a: [+ba1,+ba2,+ba3,+ba4]
  };
  
  canvas_draw_element(ind);
  array_update_entries();
} 

//and sort
function array_update_entries(){
      //buffer object
      var tmp = new Object();
      //increment sorting and update selected_elements array
      for(var i=0;i<e.length;i++){
	for (var j=i+1;j<e.length;j++){
	  if (e[i].d>e[j].d) {
	    tmp = e[i];
	    e[i]=e[j];
	    e[j]= tmp;
	  }
	}
      }
      var total_power = 0;
      for(i=0;i<e.length;i++){
	  if (e[i].front.h>0) {
	    tmp = find_optical_power(e[i])
	    total_power+= tmp;
	    //console.log("Optical power of element #"+i+" is "+tmp+" diopters");
	  }
      }
      //console.log("Total optical power is "+total_power);
      
      table_update_all();
}

//do after sort - recreates a new table
function table_update_all(){
  var html = "";
  for(var i=0;i<e.length;i++){
    html += "<table class='elements' id='element_"+e[i].id+"' value='"+e[i].id+"'>\n"
    html += "\t<tr>\n";
    html += "\t\t<td><button style='width:16px' id='number' class='number'>"+(i+1)+"</button></td>\n";
    html += "\t\t<td><input type='text' id='distance' value='"+e[i].d+"'\></td>\n";
    html += "\t\t<td><input type='text' id='thickness' value='"+e[i].t+"'\></td>\n";
    html += "\t\t<td><input type='text' id='material' value='"+e[i].m+"'\></td>\n";
    html += "\t\t<td><input type='text' id='name' value='"+e[i].name+"'\></td>\n";
    //aperture stop if <0
    if (e[i].front.h>=0) {
	html += "\t<td><span style='font-size:0.8em;'>front</span></td>\n";
	html += "\t\t<td><input type='text' id='front_height' value='"+e[i].front.h+"'\></td>\n";
	html += "\t\t<td><input type='text' id='front_curve' value='"+e[i].front.c+"'\></td>\n";
	html += "\t\t<td><input type='text' id='front_k' value='"+e[i].front.k+"'\></td>\n";
	if (e[i].front.k!=0) {
	  html += "\t\t<td><input type='text' id='front_a1' value='"+e[i].front.a[0]+"'\></td>\n";
	  html += "\t\t<td><input type='text' id='front_a2' value='"+e[i].front.a[1]+"'\></td>\n";
	  html += "\t\t<td><input type='text' id='front_a3' value='"+e[i].front.a[2]+"'\></td>\n";
	  html += "\t\t<td><input type='text' id='front_a4' value='"+e[i].front.a[3]+"'\></td>\n";
	}else{
	  html += "\t\t<td width=100 ></td>\n";
	  html += "\t\t<td width=100 ></td>\n";
	  html += "\t\t<td width=100 ></td>\n";
	  html += "\t\t<td width=100 ></td>\n";
	}
	html += "\t\t<td><button class='remove_button'><b>&ndash;</b></button></td>\n";
	html += "\t</tr>\n";
	html += "\t<tr>\n";
	html += "\t<td></td>\n";
	html += "\t<td></td>\n";
	html += "\t<td></td>\n";
	html += "\t<td></td>\n";
	html += "\t<td></td>\n";
	html += "\t<td><span style='font-size:0.8em;'>back</span></td>\n";
	html += "\t<td><input type='text' id='back_height' value='"+e[i].back.h+"'\></td>\n";
	html += "\t<td><input type='text' id='back_curve' value='"+e[i].back.c+"'\></td>\n";
	html += "\t<td><input type='text' id='back_k' value='"+e[i].back.k+"'\></td>\n";
	if (e[i].back.k!=0) {
	  html += "\t\t<td><input type='text' id='back_a1' value='"+e[i].back.a[0]+"'\></td>\n";
	  html += "\t\t<td><input type='text' id='back_a2' value='"+e[i].back.a[1]+"'\></td>\n";
	  html += "\t\t<td><input type='text' id='back_a3' value='"+e[i].back.a[2]+"'\></td>\n";
	  html += "\t\t<td><input type='text' id='back_a4' value='"+e[i].back.a[3]+"'\></td>\n";
	}else{
	  html += "\t\t<td width=100 ></td>\n";
	  html += "\t\t<td width=100 ></td>\n";
	  html += "\t\t<td width=100 ></td>\n";
	  html += "\t\t<td width=100 ></td>\n";
	}
    }else{//aperture case
 	html += "\t<td width=24 ></td>\n";
	html += "\t\t<td><input type='text' id='front_height' value='"+e[i].front.h+"'\></td>\n";
	html += "\t\t<td width=100 ></td>\n";
	html += "\t\t<td width=100 ></td>\n";
	html += "\t\t<td width=100 ></td>\n";
	html += "\t\t<td width=100 ></td>\n";
	html += "\t\t<td width=100 ></td>\n";
	html += "\t\t<td width=102 ></td>\n";
	html += "\t\t<td><button class='remove_button'><b>&ndash;</b></button></td>\n";       
    }
    html += "\t</tr>\n";
    html += "\t</table>\n";
  }
  $("#elements_table").html(html);
  //rebind events
  //unbind otherwise events would stack - don't want unique id's
  $(".remove_button").unbind("click");
  $(".remove_button").click(function(){
      array_remove_element($(this).parent().parent().parent().parent().attr("value"));
  });
  //bind onchange
  for(var i=0;i<e.length;i++){  
    $("#element_"+e[i].id).find("#distance").change(function(){element_onchange_redraw($(this).parent().parent().parent().parent().attr("value"));});
    $("#element_"+e[i].id).find("#thickness").change(function(){element_onchange_redraw($(this).parent().parent().parent().parent().attr("value"));});
    $("#element_"+e[i].id).find("#material").change(function(){element_onchange_redraw($(this).parent().parent().parent().parent().attr("value"));});
    $("#element_"+e[i].id).find("#name").change(function(){element_onchange_redraw($(this).parent().parent().parent().parent().attr("value"));});
    $("#element_"+e[i].id).find("#front_height").change(function(){element_onchange_redraw($(this).parent().parent().parent().parent().attr("value"));});
    $("#element_"+e[i].id).find("#front_curve").change(function(){element_onchange_redraw($(this).parent().parent().parent().parent().attr("value"));});
    $("#element_"+e[i].id).find("#front_k").change(function(){element_onchange_redraw($(this).parent().parent().parent().parent().attr("value"));});
    $("#element_"+e[i].id).find("#front_a1").change(function(){element_onchange_redraw($(this).parent().parent().parent().parent().attr("value"));});
    $("#element_"+e[i].id).find("#front_a2").change(function(){element_onchange_redraw($(this).parent().parent().parent().parent().attr("value"));});
    $("#element_"+e[i].id).find("#front_a3").change(function(){element_onchange_redraw($(this).parent().parent().parent().parent().attr("value"));});
    $("#element_"+e[i].id).find("#front_a4").change(function(){element_onchange_redraw($(this).parent().parent().parent().parent().attr("value"));});
    $("#element_"+e[i].id).find("#back_height").change(function(){element_onchange_redraw($(this).parent().parent().parent().parent().attr("value"));});
    $("#element_"+e[i].id).find("#back_curve").change(function(){element_onchange_redraw($(this).parent().parent().parent().parent().attr("value"));});
    $("#element_"+e[i].id).find("#back_k").change(function(){element_onchange_redraw($(this).parent().parent().parent().parent().attr("value"));});
    $("#element_"+e[i].id).find("#back_a1").change(function(){element_onchange_redraw($(this).parent().parent().parent().parent().attr("value"));});
    $("#element_"+e[i].id).find("#back_a2").change(function(){element_onchange_redraw($(this).parent().parent().parent().parent().attr("value"));});
    $("#element_"+e[i].id).find("#back_a3").change(function(){element_onchange_redraw($(this).parent().parent().parent().parent().attr("value"));});
    $("#element_"+e[i].id).find("#back_a4").change(function(){element_onchange_redraw($(this).parent().parent().parent().parent().attr("value"));});
    
    $("#element_"+e[i].id).find("#number").click(function(event){
	//enable_deselect=false;
	var val = +$(this).parent().parent().parent().parent().attr("value");
	
	console.log(val);
	
	element_toggle(val);
	if (!event.ctrlKey) {
	  exception_element = val;
	  enable_deselect = true;
	  deselect_all_elements();
	}
    });
  }
  //need to update selected_elements array
  
  //restore seleсted, multiple selection possible
  for(var i=0;i<selected_elements.length;i++){
    $("#element_"+selected_elements[i]).css({background:"rgba(20,100,255,0.5)"});
  }
}

var drag_happened = false;
var exception_element = -1;
var enable_deselect = true;
var enable_mouseup = false;

function canvas_draw_element(i){
    
    //console.log(e[i]);
  
    var obj = {
      layer: true,
      groups: ['elements'],
      name: "element_"+e[i].id,
      value: e[i].id,
      draggable: true,
      bringToFront: true,
      mousedown: function(layer){
	enable_mouseup = true;
	enable_deselect = false;
      },
      drag: function(layer){
	layer.y=layer.y-layer.dy;
	exception_element = layer.value;
	//$("#element_"+layer.value).find("#distance").val( Math.round(((+layer.x)-xO)/canvas_scale*1000)/1000);
	for(var k=0;k<e.length;k++){
	    if (e[k].id==exception_element){
		e[k].d = Math.round(((+layer.x)-xO)/canvas_scale*1000)/1000;
	    }
	}
	array_update_entries();
	if (event.ctrlKey) elements_redraw(layer.dx,0);
      },
      dragstart: function(layer){
	drag_happened = true;
	element_select(layer.value);
	if (!event.ctrlKey) {
	  exception_element = layer.value;
	  enable_deselect = true;
	  deselect_all_elements();
	  enable_deselect = false;
	}
      },
      mouseup: function(layer){
	if (enable_mouseup){
	  if (!drag_happened) {
	    element_toggle(layer.value);
	    if (!event.ctrlKey) {
	      exception_element = layer.value;
	      enable_deselect = true;
	      deselect_all_elements();
	      enable_deselect = false;
	    }
	  }
	  drag_happened = false;
	  enable_mouseup = false;
	}
      },
      strokeStyle: "rgba(0,0,0,1)",
      fillStyle: "rgba(130,180,255,1)",
      opacity: 0.5,
      strokeWidth: 0.2,
      cornerRadius: 0
    };

    var fc_sign = (+e[i].front.c<0)?-1:1;
    var fc_r_px = Math.abs(e[i].front.c*canvas_scale);
    
    var bc_sign = (+e[i].back.c<0)?-1:1;
    var bc_r_px = Math.abs(e[i].back.c*canvas_scale);
    
    var distance_px = +xO+(+e[i].d)*canvas_scale;
    var thickness_px = e[i].t*canvas_scale;
    
    var fheight_px = e[i].front.h*canvas_scale;
    var bheight_px = e[i].back.h*canvas_scale;
    var mheight_px = Math.max(fheight_px,bheight_px);
    
    //important line
    obj["x"] = distance_px;
    
    if (e[i].front.h<0) {
	//!!!APERTURE STOP!!!
	obj["fillStyle"]="rgba(0,0,0,1)",
      
        obj["p1"]=new Object();
	obj["p1"].type='line';
	obj["p1"].x1=0;
	obj["p1"].y1=-fheight_px/2+yO;
	obj["p1"].x2=-5;
	obj["p1"].y2=-fheight_px/2+50+yO;
	obj["p1"].x3=5;
	obj["p1"].y3=-fheight_px/2+50+yO;
	
	obj["p2"]=new Object();
	obj["p2"].type='line';
	obj["p2"].x1=0;
	obj["p2"].y1=fheight_px/2+yO;
	obj["p2"].x2=-5;
	obj["p2"].y2=fheight_px/2-50+yO;
	obj["p2"].x3=5;
	obj["p2"].y3=fheight_px/2-50+yO;
	
	$("#cnv1").drawPath(obj);
	
	e[i].t = "";
	e[i].front.c = "";
	e[i].back.c = "";
	e[i].m = "";
	
    }else{
	//!!!SOME CURVED ELEMENT!!!
	var tmp_x = 0;
	var tmp_y = 0;
	var tmp_break = false;
	
	var tmp_arr_fc = new Array();
	var tmp_arr_bc = new Array();

	//get front and back curves points varying y gently
	for(var j=0;j<=mheight_px/2;j++){ 
	  tmp_y=j;
	  //tmp_x_fc=fc_sign*fc_r_px-fc_sign*Math.sqrt(fc_r_px*fc_r_px-tmp_y*tmp_y);
	  //tmp_x_bc=bc_sign*bc_r_px-bc_sign*Math.sqrt(bc_r_px*bc_r_px-tmp_y*tmp_y);
	  //in the layer we count from zero, so d=0
	  //calcs are in pixels!
	  if (tmp_y<=fheight_px/2) tmp_x_fc=canvas_scale*find_surf_point(tmp_y/canvas_scale,0,e[i].front);
	  if (tmp_y<=bheight_px/2) tmp_x_bc=canvas_scale*find_surf_point(tmp_y/canvas_scale,0,e[i].back);
	  
	  
	  if(tmp_x_fc>=(tmp_x_bc+thickness_px)) {
	    tmp_break = true;
	  }
	  
	  tmp_arr_fc[tmp_y]=tmp_x_fc;
	  tmp_arr_bc[tmp_y]=tmp_x_bc;
	  
	  if (tmp_break){
	    tmp_break=true;
	    j++;
	    break;
	  }
	}
	
	var N = j;
	//console.log("That N is: "+N);
	
	var apax = new Array();
	var apay = new Array();
	
	//reorder!
	for(var j=0;j<=N;j++){
	  apax[(N-j)]=tmp_arr_fc[j];
	  apay[(N-j)]=-j+yO;
	  
	  apax[(N+j)]=tmp_arr_fc[j];
	  apay[(N+j)]=j+yO;      
	  
	  apax[(3*N-j)]=tmp_arr_bc[j]+thickness_px;
	  apay[(3*N-j)]=j+yO;
	  
	  apax[(3*N+j)]=tmp_arr_bc[j]+thickness_px;
	  apay[(3*N+j)]=-j+yO;      
	}
	
	for(var j=1;j<4*N;j++){
	  //console.log(i+"  "+apax[i]+" "+apay[i]);
	  obj["x"+j]=apax[j];
	  obj["y"+j]=apay[j];
	}
	
	$("#cnv1").drawLine(obj);
    }
      
}

function array_remove_element(id){
  console.log(id);
  for (var i=0;i<e.length;i++) {
    if (e[i].id==id) {
      e.splice(i,1);//not working in IE7/8?
      table_remove_element(id);
      break;
    }
  }
}

function table_remove_element(id){
  console.log("Removing table entry");
  deselect_all_elements();
  
  $("#element_"+id).remove();
  $("#cnv1").removeLayer("element_"+id).drawLayers();
  array_update_entries();
  //table_update_entries();
}

function element_onchange_redraw(id){
      console.log("Changing: layer "+id);
      //layer = $("#cnv1").getLayer("element_"+id);
      //layer.x = 0;
  
      var tmp_d=+$("#element_"+id).find("#distance").val();
      var tmp_t=+$("#element_"+id).find("#thickness").val();
      var tmp_m=$("#element_"+id).find("#material").val();
      var tmp_name=$("#element_"+id).find("#name").val();
      
      var tmp_fh=+$("#element_"+id).find("#front_height").val();
      var tmp_fc=+$("#element_"+id).find("#front_curve").val();
      var tmp_fk=+$("#element_"+id).find("#front_k").val();
      var tmp_fa1=+$("#element_"+id).find("#front_a1").val();
      var tmp_fa2=+$("#element_"+id).find("#front_a2").val();
      var tmp_fa3=+$("#element_"+id).find("#front_a3").val();
      var tmp_fa4=+$("#element_"+id).find("#front_a4").val();
      
      var tmp_bh=+$("#element_"+id).find("#back_height").val();
      var tmp_bc=+$("#element_"+id).find("#back_curve").val();
      var tmp_bk=+$("#element_"+id).find("#back_k").val();
      var tmp_ba1=+$("#element_"+id).find("#back_a1").val();
      var tmp_ba2=+$("#element_"+id).find("#back_a2").val();
      var tmp_ba3=+$("#element_"+id).find("#back_a3").val();
      var tmp_ba4=+$("#element_"+id).find("#back_a4").val();
  
      //$("#cnv1").drawLayers();
      $("#cnv1").removeLayer("element_"+id).drawLayers();
      
      for(var i=0;i<e.length;i++){
	if(e[i].id==id){
	  e[i].d=tmp_d;
	  e[i].t=tmp_t;
	  e[i].m=tmp_m;
	  e[i].name=tmp_name;
	  
	  e[i].front.h=tmp_fh;
	  e[i].front.k=tmp_fk;
	  e[i].front.c=tmp_fc;
	  
	  e[i].front.a[0]=(!isNaN(tmp_fa1)?tmp_fa1:0);
	  e[i].front.a[1]=(!isNaN(tmp_fa2)?tmp_fa2:0);
	  e[i].front.a[2]=(!isNaN(tmp_fa3)?tmp_fa3:0);
	  e[i].front.a[3]=(!isNaN(tmp_fa4)?tmp_fa4:0);
	  
	  e[i].back.h=tmp_bh;
	  e[i].back.k=tmp_bk;
	  e[i].back.c=tmp_bc;
	  e[i].back.a[0]=(!isNaN(tmp_ba1)?tmp_ba1:0);
	  e[i].back.a[1]=(!isNaN(tmp_ba2)?tmp_ba2:0);
	  e[i].back.a[2]=(!isNaN(tmp_ba3)?tmp_ba3:0);
	  e[i].back.a[3]=(!isNaN(tmp_ba4)?tmp_ba4:0);

	  canvas_draw_element(i);
	  break;
	}
      }
      
      table_update_all();
}

function element_select(id){
  //get layer
  var layer = $("#cnv1").getLayer("element_"+id);
  //returns -1 if not in the array (=not selected)
  var tmp = selected_elements.indexOf(id);
  if (tmp==-1){
    //no need to update the 'e' array
    
    //add to selected_elements array
    selected_elements.push(id);
    //mark table entry
    $("#element_"+id).css({background:"rgba(20,100,255,0.5)"});
    //mark lens
    //layer.fillStyle = "rgba(20,100,255,0.5)";
    layer.opacity = 0.7;
    $("#cnv1").drawLayers(); 
  }
}

function element_deselect(id){
  //get layer
  var layer = $("#cnv1").getLayer("element_"+id);
  //returns something else than -1 if in the array (selected)
  var tmp = selected_elements.indexOf(id);
  if (tmp!=-1) {
    //no need to update the 'e' array
    
    //remove from selected_elements array
    selected_elements.splice(tmp,1);
    //unmark table entry
    $("#element_"+id).css({background:"rgba(20,100,255,0.0)"});
    //unmark lens
    //layer.fillStyle = "rgba(130,180,255,0.5)";
    layer.opacity = 0.4;
    $("#cnv1").drawLayers();
  }
}

function element_toggle(id){
  //layer.value same as id
  tmp = selected_elements.indexOf(id);
  if (tmp==-1) {
    element_select(id);
  }else{
    element_deselect(id);
  }
}

function deselect_all_elements(){
  //deselect all except some or none elements if allowed 
  if (enable_deselect){
    ls = $("#cnv1").getLayerGroup('elements');
    if(typeof ls!=='undefined') {
      for(i=0;i<ls.length;i++){
	if (ls[i].value!=exception_element) element_deselect(ls[i].value);
      }
    }
  }
  exception_element = -1;
  enable_deselect = true;
}

function elements_redraw(shiftx,shifty){
    for (var i=0;i<selected_elements.length;i++){
	if (selected_elements[i]!=exception_element) {
	  element_redraw(selected_elements[i],shiftx,shifty);
	}
    }
}

function element_redraw(index,shiftx,shifty){
      //redrawing
      layer = $("#cnv1").getLayer("element_"+index);
      layer.x += shiftx;
      //$("#cnv1").drawLayers();
      //changing numbers
      for(var k=0;k<e.length;k++){
	if (e[k].id==index){
	    //here's a correct line
	    e[k].d = Math.round(((+layer.x)-xO)/canvas_scale*1000)/1000;
	    break;
	}
      }
      array_update_entries();
}

function wheelEvent(event){
      shiftKey= (event.shiftKey==1);
      var delta = 0;
      if (!event) event = window.event; // IE
      if (event.wheelDelta) { //IE+Opera
	      delta = event.wheelDelta/120;
	      if (window.opera) delta = -delta;
      } else if (event.detail) { // Mozilla
	      if (shiftKey) delta = -event.detail;
	      else          delta = -event.detail/3;
      }
      if (delta)
	      handleWheel(event,delta,shiftKey);
      if (event.preventDefault)
	      event.preventDefault();
}

function handleWheel(event,delta,shiftKey) {
    if (shiftKey) delta *= -1;
    else          delta *= -10;
    elements_redraw(delta,0);
    $("#cnv1").drawLayers();
}

function rays_draw(){
  var x = (+e[e.length-1].d+e[e.length-1].t);
  var y = +$("#rays_imhh").val();
  var alpha = 0;//degrees
  var dalpha = 2;//degrees
  var old_cv = 0;
  //find chief ray!
  
  $("#cnv1").removeLayerGroup('rays').drawLayers();
  //ray_draw("chief1",c1[0],c1[1],c1[2],$("#rays_color").val());
  
  //find marginal ray
  //var m1=find_aperture_stop_ray(x,0,alpha,1,dalpha,old_cv,100);
  //ray_draw("margi0",m1[0],m1[1],0,$("#rays_color").val());
  //ray_draw("margi1",m1[0],m1[1],m1[2],$("#rays_color").val());
  //ray_draw("margi2",m1[0],m1[1],-m1[2],$("#rays_color").val());
  
  var n = $("#rays_n").val();
  
  //step1!
  var hh1 = find_marginal_ray_half_height(0,0,0,0.1,old_cv,100);
  $("#crw").html(Math.round(2*hh1*1000)/1000);
  var c1  = find_aperture_stop_ray(x,y,alpha,0,dalpha,old_cv,100);
  var tmp = (c1[2]>90)?(c1[2]-180):(c1[2]);
  tmp=Math.round(tmp*1000)/1000;
  $("#mra").html(tmp);
  
  var step = +2*hh1/(n-1);
  
  if (n==1) {
      ray_draw("center_"+0,0,0,0,$("#rays_color").val());
      ray_draw("slant_"+0,c1[0],c1[1],c1[2],$("#rays_color").val());    
  }else{
    for(var i=0;i<n;i++){
      ray_draw("center_"+i,0,(-hh1+step*i),0,$("#rays_color").val());
      ray_draw("slant_"+i,c1[0],c1[1]-hh1+step*i,c1[2],$("#rays_color").val());
    }
  }
  
  
  //step2!
  
  //ray_draw("some_chief_ray" ,c1[0],c1[1],c1[2],$("#rays_color").val());
  
}

function rays_draw2(){
  $("#cnv1").removeLayerGroup('rays').drawLayers();
  var n = $("#rays_n").val();
  var step = (+$("#rays_width").val()/Math.cos(Math.PI/180*$("#rays_angle").val()))/(n-1);
  for (var i=0;i<n;i++){
    //$("#rays_y").val();
    ray_draw("ray"+i,$("#rays_x").val(),(+$("#rays_y").val()+step*(n-1)/2-step*i),$("#rays_angle").val(),$("#rays_color").val());
    //ray_draw("ray"+i,$("#rays_x").val(),20,$("#rays_angle").val(),$("#rays_color").val());
  }
}

function ray_draw(name,x,y,angle,color){
  
  //$("#cnv1").removeLayer(name).drawLayers();
  console.log(name+" "+x+" "+y+" "+angle);
  
  var obj = {
    layer: true,
    name: name,
    groups: ['rays'],
    opacity: 0.4,
    strokeStyle: color,
    strokeWidth: 1.0
  }
  
  var n = 1.7;

  var tmp_point = Array();
  
  var ray_angle = angle*Math.PI/180;
  var ray_x = x;
  var ray_y = y;
  var ray_k = Math.tan(ray_angle);
  //find location
  for(var i=0;i<e.length;i++){
    //console.log("Locating!");
    if (ray_x<=+e[i].d||ray_x<(+e[i].d+e[i].t)) {
      if (ray_x<=+e[i].d) console.log("The ray is to the left of "+i+" lens");
      else                            console.log("The ray is 'inside' of "+i+" lens");
      break;
    }
  }
  //i is the closest lens index
  var path="";
  var npi = 1;
  //trace forward!!!
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  path = "p1";
  obj[path]=new Object();
  obj[path].type='line';
  
  tmp_point = [ray_x,ray_y,ray_k];
  obj[path]["x1"]= cx(tmp_point[0]);
  obj[path]["y1"]= cy(tmp_point[1]);
  npi = 2;//Next Point Index
  
  for(var j=0;j<(e.length-i);j++){
      //console.log(j);
      if (e[i+j].front.h>0){
	  
	  n=Glass[e[i+j].m.toUpperCase()].n;
	  tmp_point = find_ray_surf_crosspoint(n,tmp_point[0],tmp_point[1],tmp_point[2],e[i+j].d,0,e[i+j].d,e[i+j].front);
	  obj[path]["x"+npi]= cx(tmp_point[0]);
	  obj[path]["y"+npi]= cy(tmp_point[1]);  
	  npi++;
	  
	  console.log("x"+npi+"  x:"+tmp_point[0]+" y:"+tmp_point[1]);
	  
	  tmp_point = find_ray_surf_crosspoint(1/n,tmp_point[0],tmp_point[1],tmp_point[2],(e[i+j].d+e[i+j].t),0,(e[i+j].d+e[i+j].t),e[i+j].back);
	  obj[path]["x"+npi]= cx(tmp_point[0]);
	  obj[path]["y"+npi]= cy(tmp_point[1]);
	  npi++;
	  
	  console.log("x"+npi+"  x:"+tmp_point[0]+" y:"+tmp_point[1]);
	  
      }else{
	  obj[path]["x"+npi]= cx(tmp_point[0]);
	  obj[path]["y"+npi]= cy(tmp_point[1]);
	  npi++;
	  obj[path]["x"+npi]= cx(tmp_point[0]);
	  obj[path]["y"+npi]= cy(tmp_point[1]);
	  npi++;
      }
  }

  path = "p2";
  obj[path]=new Object();
  obj[path].type='line';
  
  tmp_point = [ray_x,ray_y,ray_k];
  obj[path]["x1"]= cx(tmp_point[0]);
  obj[path]["y1"]= cy(tmp_point[1]);
  npi = 2;
  //tracing backward!
  console.log("tracing backwards");

  i--;//get index of element to the left
  
  for(var k=0;k<=i;k++){
      if (e[i-k].back.h>0){
	  
	  n=Glass[e[i-k].m.toUpperCase()].n;
	  tmp_point = find_ray_surf_crosspoint(n,tmp_point[0],tmp_point[1],tmp_point[2],(e[i-k].d+e[i-k].t),0,(e[i-k].d+e[i-k].t),e[i-k].back);
	  
	  obj[path]["x"+npi]= cx(tmp_point[0]);
	  obj[path]["y"+npi]= cy(tmp_point[1]);
	  npi++;
	    
	  //console.log("x"+npi+"  x:"+tmp_point[0]+" y:"+tmp_point[1]);
	  
	  tmp_point = find_ray_surf_crosspoint(1/n,tmp_point[0],tmp_point[1],tmp_point[2],e[i-k].d,0,e[i-k].d,e[i-k].front);
	  obj[path]["x"+npi]= cx(tmp_point[0]);
	  obj[path]["y"+npi]= cy(tmp_point[1]);
	  npi++;
	  
	  //console.log("x"+npi+"  x:"+tmp_point[0]+" y:"+tmp_point[1]);
      }else{
	  //console.log("Ray at aperture: "+tmp_point[0]+" "+tmp_point[1]+" "+tmp_point[2]);
	  obj[path]["x"+npi]= cx(tmp_point[0]);
	  obj[path]["y"+npi]= cy(tmp_point[1]);
	  npi++;
	  obj[path]["x"+npi]= cx(tmp_point[0]);
	  obj[path]["y"+npi]= cy(tmp_point[1]);
	  npi++;
      }    
  }
  //extra point after all's finished
  obj[path]["x"+npi]= cx(tmp_point[0]-5);
  obj[path]["y"+npi]= cy(tmp_point[2]*(tmp_point[0]-5)+(tmp_point[1]-tmp_point[2]*tmp_point[0]));
  
/////////////////////////////////////////////////////////////////////////////////////////////////////////    
  $("#cnv1").drawPath(obj);
}


function find_ray_surf_crosspoint(n,ray_x,ray_y,ray_k,surf_x,surf_y,surf_d,surf){
  
  var ray_b = ray_y-ray_k*ray_x;
  //console.log("ITE");
  var surf_k = find_surf_tangent(surf_y,surf);
    
  if (surf_k=="inf") x_c = surf_x;
  else{
    surf_b = surf_y-surf_k*surf_x;
    x_c = (ray_b-surf_b)/(surf_k-ray_k);
  }
  y_c = ray_k*x_c + ray_b;
  
  x_delta = find_surf_point(y_c,surf_d,surf);
  
  if (Math.abs(x_delta-x_c)>epsilon) {
    //console.log("REPEAT! Delta is "+Math.abs(x_delta-x_c));
    return find_ray_surf_crosspoint(n,ray_x,ray_y,ray_k,x_delta,y_c,surf_d,surf);
  }else{
    //console.log("GOT IT! Delta is "+Math.abs(x_delta-x_c)+"    "+x_c+":"+y_c+" vs "+x_delta);
    
    surf_n = ((surf_k=="inf")?(0):(-1/surf_k));
    
    if (surf_k=="inf") beta = Math.PI/2;
    else               beta = (Math.atan(surf_k)<0)?(Math.PI+Math.atan(surf_k)):Math.atan(surf_k);
    
    //console.log("surf_k= "+surf_k+" and then beta="+(beta*180/Math.PI));
    
    alph_i = (Math.atan(ray_k)<0)?(Math.PI+Math.atan(ray_k)):Math.atan(ray_k);
    
    if (ray_k>=0){
      if(ray_k<surf_n) gamm_i = -alph_i + beta - Math.PI/2;
      else             gamm_i =  alph_i - beta + Math.PI/2;
    }else{
      if(ray_k>surf_n) gamm_i =  alph_i - beta - Math.PI/2;
      else             gamm_i = -alph_i + beta + Math.PI/2;
    }
    
    gamm_r = Math.asin(Math.sin(gamm_i)/n);
    
    if (ray_k>=0){
      if(ray_k<surf_n) alph_r = -gamm_r + beta - Math.PI/2;
      else             alph_r =  gamm_r + beta - Math.PI/2;
    }else{
      if(ray_k>surf_n) alph_r =  gamm_r + beta + Math.PI/2;
      else             alph_r = -gamm_r + beta + Math.PI/2;
    }    
        
    ray_k_r = Math.tan(alph_r);
    
    return [x_c,y_c,ray_k_r];
  }
}

function find_surf_tangent(y,surf){
    var c_px = surf.c;
    var _sqrt_ = Math.sqrt(1-(1+surf.k)*y*y/(c_px*c_px));
    var tmp = 2*(y/c_px)/(1+_sqrt_)+Math.pow(y,3)/Math.pow(c_px,3)/(1+_sqrt_)/(1+_sqrt_)/_sqrt_+2*surf.a[0]*y+4*surf.a[1]*Math.pow(y,3)+6*surf.a[2]*Math.pow(y,5)+8*surf.a[3]*Math.pow(y,7);
    return (tmp==0)?"inf":1/tmp;
}

function find_surf_point(y,d,surf){
    var c_px = surf.c;
    var d_px = d;
    var _sqrt_ = Math.sqrt(1-(1+surf.k)*y*y/(c_px*c_px));
    var tmp = d_px+y*y/c_px/(1+_sqrt_)+surf.a[0]*Math.pow(y,2)+surf.a[1]*Math.pow(y,4)+surf.a[2]*Math.pow(y,6)+surf.a[3]*Math.pow(y,8);
    return tmp;
}

function cx(x){
  return (+x*canvas_scale+xO);
}

function cy(y){
  return (-y*canvas_scale+yO);
}

//returns marginal ray height/2 when traced from center of the last element
function find_marginal_ray_half_height(x,y,height,dheight,old_cv,limit){
  tmp_point = Array();
  tmp_point[0]=x;
  tmp_point[1]=height;
  tmp_point[2]=0;
  var i=0;
  
  for(var j=0;j<(e.length-i);j++){
      //console.log(j);
      if (e[i+j].front.h>0){
	  n=Glass[e[i+j].m.toUpperCase()].n;
	  tmp_point = find_ray_surf_crosspoint(n,tmp_point[0],tmp_point[1],tmp_point[2],e[i+j].d,0,e[i+j].d,e[i+j].front);
	  tmp_point = find_ray_surf_crosspoint(1/n,tmp_point[0],tmp_point[1],tmp_point[2],(e[i+j].d+e[i+j].t),0,(e[i+j].d+e[i+j].t),e[i+j].back);
      }else{
	  //analysis
	  cv = tmp_point[1]-tmp_point[2]*tmp_point[0]+tmp_point[2]*e[i+j].d+e[i+j].front.h/2;
	  if (Math.abs(cv)<epsilon2) {
	    return height;
	  }else{
	    limit--;
	    if (cv*old_cv<0){
	      //change direction
	      if (limit>0) return find_marginal_ray_half_height(x,y,height-dheight/2,-dheight/2,cv,limit);
	      else         return -1;
	    }else{
	      //change direction if error increased
	      if (Math.abs(cv)>Math.abs(old_cv)) dheight = -dheight;
	      if (limit>0) return find_marginal_ray_half_height(x,y,height+dheight,dheight,cv,limit);
	      else         return -2;
	    }
	  }
      }
  }
}
//returns alpha for chief ray for certain point
function find_aperture_stop_ray(x,y,alpha,height,dalpha,old_cv,limit){
  var i = e.length-1;
  tmp_point = Array();
  tmp_point[0]=x;
  tmp_point[1]=y;
  tmp_point[2]=Math.tan(alpha*Math.PI/180);
    
  for(var k=0;k<=i;k++){
      if (e[i-k].back.h>0){
	  n=Glass[e[i-k].m.toUpperCase()].n;
	  tmp_point = find_ray_surf_crosspoint(n,tmp_point[0],tmp_point[1],tmp_point[2],(+e[i-k].d+e[i-k].t),0,(+e[i-k].d+e[i-k].t),e[i-k].back);
	  tmp_point = find_ray_surf_crosspoint(1/n,tmp_point[0],tmp_point[1],tmp_point[2],+e[i-k].d,0,+e[i-k].d,e[i-k].front);
      }else{
	  cv = tmp_point[1]-tmp_point[2]*tmp_point[0]+tmp_point[2]*e[i-k].d-height;
	  if (Math.abs(cv)<epsilon2) {
	    console.log("chudo ray finder triumphantly returns x:"+x+" y:"+y+" alpha:"+alpha+" limit(left)="+limit+" delta= "+(cv)+"for the height="+height);
	    //finish tracing
	    for(l=1;l<=(i-k);l++){
	      n=Glass[e[(i-k-l)].m.toUpperCase()].n;
	      tmp_point = find_ray_surf_crosspoint(n,tmp_point[0],tmp_point[1],tmp_point[2],(+e[i-k-l].d+e[i-k-l].t),0,(+e[i-k-l].d+e[i-k-l].t),e[i-k-l].back);
	      tmp_point = find_ray_surf_crosspoint(1/n,tmp_point[0],tmp_point[1],tmp_point[2],+e[i-k-l].d,0,+e[i-k-l].d,e[i-k-l].front);
	    }
	    alpha = ((tmp_point[2]<0)?(Math.PI+Math.atan(tmp_point[2])):(Math.atan(tmp_point[2])));
	    return [tmp_point[0],tmp_point[1],alpha*180/Math.PI];
	  }else{
	    limit--;
	    if (cv*old_cv<0){
	      //change direction
	      if (limit>0) return find_aperture_stop_ray(x,y,alpha-dalpha/2,height,-dalpha/2,cv,limit);
	      else         return -1;
	    }else{
	      //change direction if error increased
	      if (Math.abs(cv)>Math.abs(old_cv)) dalpha = -dalpha;
	      if (limit>0) return find_aperture_stop_ray(x,y,alpha+dalpha,height,dalpha,cv,limit);
	      else         return -2;
	    }
	  }
      }    
  }
}

function find_optical_power(element){
  var n = +Glass[element.m.toUpperCase()].n;
  var r1 = +element.front.c;
  var r2 = +element.back.c;
  var d = +element.t;
  var inv_f = (n-1)*(1/r1-1/r2+(n-1)*d/n/(r1*r2));
  var f = 1/inv_f;
  //console.log("f = "+f+" mm");
  return inv_f*1000;
}

function parseURL() {
  var parameters=location.href.replace(/\?/ig,"&").split("&");
  for (var i=0;i<parameters.length;i++) parameters[i]=parameters[i].split("=");
  for (var i=1;i<parameters.length;i++) {
    switch (parameters[i][0]) {
      case "file": file = parameters[i][1];break;
      case "path": path = parameters[i][1];break;
    }
  }
}

var Glass = {
  "BAF51"    : {n:1.652242,B1:1.51503623,B2:0.153621958,B3:1.15427909,C1:0.00942734715,C2:0.04308265,C3:124.889868},//barium flint
  "BASF1"    : {n:1.626061},//barium dense flint
  "BK7"      : {n:1.516800,B1:1.03961212,B2:0.231792344,B3:1.01046945,C1:0.00600069867,C2:0.0200179144,C3:103.560653},//borosilicate crown
  "K50"      : {n:1.522572},
  "LAK11"    : {n:1.658302},//lanthanum crown
  "LAK21"    : {n:1.640495,B1:1.22718116,B2:0.420783743,B3:1.01284843,C1:0.00602075682,C2:0.0196862889,C3:88.4370099},//lanthanum crown
  "LASF14A"  : {n:1.822230},
  "N-BK7"    : {n:1.516800,B1:1.03961212,B2:0.231792344,B3:1.01046945,C1:0.00600069867,C2:0.0200179144,C3:103.560653},
  "N-FK51"   : {n:1.486561},//fluorite crown
  "N-FK51A"  : {n:1.486560,B1:0.971247817,B2:0.216901417,B3:0.904651666,C1:0.00472301995,C2:0.0153575612,C3:168.68133},//fluorite crown
  "N-SK15"   : {n:1.622960},
  "N-ZK7"    : {n:1.508470,B1:1.07715032,B2:0.168079109,B3:0.851889892,C1:0.00676601657,C2:0.0230642817,C3:89.0498778},
  "P-LAK35"  : {n:1.693500},
  "PSK52"    : {n:1.603101},
  "SF57"     : {n:1.846660},
  "SF58"     : {n:1.917613},
  "SF6HT"    : {n:1.805180},
  "SK16"     : {n:1.620410,B1:1.34317774,B2:0.241144399,B3:0.994317969,C1:0.00704687339,C2:0.229005,C3:92.7508526}
}