function jquery_list(list, msg, callback) {
    var selectBoxContainer = $("#"+list);
    
    //add the header box <div> to the list
    selectBoxContainer.append("<div class='list_head'></div>");

    //assign the default message to the list header
    var selectBox = selectBoxContainer.find('.list_head');
    selectBox.html(msg);
    selectBoxContainer.attr('value',msg);
    
    //process the list 
    var dropDown = selectBoxContainer.find('.list_view');
    
    //console.log(dropDown);

    //selectBoxContainer.append(dropDown.hide());
    dropDown.hide();

    dropDown.bind('show',function(){
	selectBox.addClass('expanded');
	dropDown.fadeIn();
    }).bind('hide',function(){
	selectBox.removeClass('expanded');
	dropDown.fadeOut();
    }).bind('toggle',function(){
	if (selectBox.hasClass('expanded')) dropDown.trigger('hide');
	else                                dropDown.trigger('show');
    });

    selectBox.click(function(){
	dropDown.trigger('toggle');
	return false;
    });

    $(document).click(function(){
	dropDown.trigger('hide');
    });

    //process all the list elements
    dropDown.find('li').each(function(i) {
	var li = $(this);

	li.click(function(){
	    selectBox.html(li.html());
	    selectBoxContainer.attr('value',li.html());
	    //selectBoxContainer.attr('value',i);
	    dropDown.trigger('hide');
	    //my function
	    callback("list",i);
	    return false;
	});
    });
            
}