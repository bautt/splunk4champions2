require([
	"splunkjs/mvc",
	"splunkjs/mvc/simplexml/ready!"
], function(mvc) {	
	$('.infobutton').each(function( index ) {

		// Get the content which should appear in the dropdown
		var content = $(this).html();

		// Get the panel to which the infobutton should be added
		var parentId = $(this).attr('parent');

		// Set the spacing of the panel title (when no title has been set)
		if($('#' + parentId + ' > div > .panel-title').is(':empty')){
			$('#' + parentId + ' > div > .panel-title').html("&nbsp;");
			$('#' + parentId + ' > div > .panel-title').removeClass('empty');
		}

		// Get selected option
		var infobutton_type = '';
		if($(this).attr('type')){
			infobutton_type = $(this).attr('type');
		} else {
			infobutton_type = 'collapse';
		}

		// Get the optional title attribute
		var modal_header = '';
		if($(this).attr('title')){
			modal_header = $(this).attr('title');
		}

		// Get the optional icon attribute
		var icon = 'info';
		if($(this).attr('icon')){
			icon = $(this).attr('icon')
		}

		// Initialize the modal popup
		var modal = "\
			<div id='modal-" + parentId + "' class='modal fade' role='dialog'>\
				<div class='modal-dialog'>\
					<div class='modal-content'>\
						<div class='modal-header'>\
							<button type='button' class='close' data-dismiss='modal'>&times;</button>\
							<h4 class='modal-title'>" + modal_header + "</h4>\
						</div>\
						<div class='modal-body'>" + content + "</div>\
						<div class='modal-footer'>\
							<button type='button' class='btn btn-default' data-dismiss='modal'>Close</button>\
						</div>\
					</div>\
				</div>\
			</div>";

		// Create the button
		var div = '<button class="icon-' + icon + ' infobutton_button" data-toggle="' + infobutton_type + '" data-target="#' + infobutton_type + '-' + parentId +'"></button>';
		if(infobutton_type == 'collapse'){
			div += '<div id="collapse-' + parentId +'" class="collapse">';
			div += '<div class="infobutton-content">' + content + '</div>';
		}
		div += '</div>';
		
		// Add the button to the panel
		$('#' + parentId + ' > div > .panel-title').after(modal);
		$('#' + parentId + ' > div > .panel-title').after(div);

		// Remove the original content (prevent duplicate IDs)
		$(this).parent().remove();

	});

});