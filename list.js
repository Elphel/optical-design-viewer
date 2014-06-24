$(function(){
    
    get_designs_list("load_designs_list");
    jquery_list("load_designs_list","Load",load_design);
    //jquery_list("input_sensor_list",list_initial_value,update_sensor_fields);
    
    //var list_div = document.getElementById('load_designs_list');
    //if (list_div.addEventListener) list_div.addEventListener('DOMMouseScroll', wheelEvent_list, false);
    //list_div.onmousewheel = wheelEvent_list;
    
});

function load_design(src,i){
  console.log("Loading lens design: "+designs[i]);
  getDesign(designs[i]);
}

function get_designs_list_sync(some_folder,type) {
    $.ajax({
      url: "./get_designs_list.php",
      async: false,
      dataType: "xml",
      success: function(data){fill_designs_list(data.getElementsByTagName("file"));}
    });
}

var designs = Array();

function fill_designs_list(designs_list){
	designs = Array();
	for (var i=0;i<designs_list.length;i++){ 
	    var tmp = designs_list[i];
	    if (tmp.length != 0) {
	        if (typeof(tmp.childNodes[0])!='undefined') designs[i] = tmp.childNodes[0].nodeValue;
		else                                        designs[i] = "";
	    }
	}
}

function get_designs_list(element_id) {
    var some_folder = "";
    var folder_list = "";
    if (some_folder!="Load") {
	get_designs_list_sync();

	var list = "<div class='list_view'><ul>";

	for(var i=0; i<designs.length; i++) {
	    list = list + "<li>"+designs[i]+"</li>";
	}
	list = list + "</ul></div>";
    }else{
	list = "<div class='list_view'><ul></ul></div>";
    }
    $("#"+element_id).html(list);
}

function wheelEvent_list(event){
      var delta = 0;
      if (!event) event = window.event; // IE
      if (event.wheelDelta) { //IE+Opera
	      delta = event.wheelDelta/120;
	      if (window.opera) delta = -delta;
      } else if (event.detail) { // Mozilla
	      delta = -event.detail;
      }
      if (delta)
	      handleWheel_list(event,delta);
      if (event.preventDefault)
	      event.preventDefault();
      event.returnValue = false;
}

function handleWheel_list(event,delta) {
      var tmp = $(".list_view ul").position().top;
      
      console.log($(".list_view ul").position().top+" "+$(".list_view ul").offset().top);
      
      var tmp2 = +tmp+20*delta;
      
      if (tmp2 > -12) tmp2=-12;
      if (tmp2 < (-$(".list_view ul").height()+$(".list_view").height()-12) ) tmp2=-$(".list_view ul").height()+$(".list_view").height()-12;
      
      $(".list_view ul").css({top:tmp2+'px'});
     
}