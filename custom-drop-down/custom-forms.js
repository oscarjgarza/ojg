define(['jquery', 'utils/utils'], function ($, utils) {
	'use strict';

	$.extend(utils, {
		customForms: {			
			init: function (container) {
				//console.log('custom forms!!!');
				var $container;
				var self = this;

				// By default, custom form looks in the body, but for any dynamic content
				// Need to run this script and specify the parent container so that the script
				// does not get run multiple times on a element.
				// Could also be done by setting a flag on elements already run, but has slower performance
				$container = (container === undefined) ? $('body') : container;

				var $customFormEl = $container.find('.custom-form');
				
				$.each($customFormEl, function() {

					var $self = $(this);

					if ($self.is('select')) {

						self.customSelect($self);

					} else {

						self.customCheckbox($self);

					}
				});

				return this;
			},

			customSelect: function(el) {
				var $self = el;

				//bindKeyboardEvents

				// Render new markup
				$self.after(function() {
					var numOptions = $self.find('option').length,
							newOptions = '',
							selectedOption = '',
							thisTabIndex;

					$self.attr('tabindex') ? thisTabIndex = $self.attr('tabindex') : thisTabIndex = 0;

					for (var i = 0; i < numOptions; i++) {

						var dataValue = $self.find('option:eq(' + i + ')').val(),
								valueHtml = $self.find('option:eq(' + i + ')').html();

						if ($self.find('option:eq(' + i + ')').is(':selected')) {
							selectedOption = '<span class="selected-holder" tabindex="' + thisTabIndex + '">' + valueHtml + '</span>';
							newOptions = newOptions + '<li class="selected" data-value="' + dataValue + '">' + valueHtml + '</li>';
						} else {
							selectedOption = '<span class="selected-holder" tabindex="' + thisTabIndex + '">' + $self.find('option:eq(0)').html() + '</span>';
							newOptions = newOptions + '<li data-value="' + dataValue + '">' + valueHtml + '</li>';
						}
					}

					$self.after('<div class="custom-drop-container">' + selectedOption + '<ul class="custom-drop inactive">' + newOptions + '</ul></div>');
				});

				// Open custom drop
				function openCustomDrop(obj) {
					// Closing any other open custom drop downs
					hideCustomDrops();

					// Displaying selected custom drop down
					obj.removeClass('inactive');
					obj.addClass('active has-hover');

					// If the whole drop down cannot be seen, scroll down enough to see it
					var dropOffset = $('.custom-drop').height() - $('body').scrollTop();
					if (dropOffset > 0) {
						//$('body').animate({scrollTop:$('.custom-drop').height() + 20}, 200);
						obj.addClass('above');
					}
				}

				// Set newly selected value
				function setNewValue(obj, val) {
					var customDrop 					= obj,
							selectedValue 			= val,
							selectedElement 		= obj.find('li[data-value="' + val + '"]'),
							selectedElementHtml = selectedElement.html();

					console.log("in setNewValue, obj: " + obj + " and val: " + val);

					customDrop.prev().find('option').removeAttr('selected');
					customDrop.prev().find('option[value="' + selectedValue + '"]').attr('selected', 'selected');
					customDrop.find('li').removeClass('selected');
					selectedElement.addClass('selected');

					// Updating holder html
					customDrop.parent().find('.selected-holder').html(selectedElementHtml);

					// Bring this over to actual form select element
					$self.find('option').removeAttr('selected');
					$self.find('option[value="' + selectedValue + '"]').attr('selected', 'selected');
				}

				// Hide custom drop down(s) 
				function hideCustomDrops() {
					$('.custom-drop li').removeClass('hover');
					$('.custom-drop').removeClass('active has-hover above');
					$('.custom-drop').addClass('inactive');
				}

				// Open/Close drop down on click
				$('.custom-drop li, .selected-holder').on('click', function(e) {
					var customDrop,
							selectedValue;

					customDrop = $(this).parent().hasClass('custom-drop') ? $(this).parent() : $(this).next();
					selectedValue = $(this).data('value') ? $(this).data('value') : '';

					if (customDrop.hasClass('inactive')) {
						openCustomDrop(customDrop);
					} else {
						selectedValue != '' && setNewValue(customDrop, selectedValue);
						hideCustomDrops();
					}

					e.stopPropagation();
				});

				// Hide custom drop down(s) when clicking anywhere outside 
				$('html').on('click', function() {
					hideCustomDrops();
				});

				// Keyboard support for:
				// Tab, Up/Down arrow, Esc and Enter
				$('.custom-drop, .selected-holder').focus(function() {
					var cursorPosition,
							$that = $(this).hasClass('custom-drop') ? $(this) : $(this).next();

					cursorPosition = runKeyDown($(this), $that);
					
					//$(this).one('keydown', function(e) {	
					//$(this).on('keydown', function(e) {

					// Set cursor position
					var newCursorPosition;
					$(document).on("mousemove", function(e) {
						newCursorPosition = e.pageY;

						if (newCursorPosition != cursorPosition) {
							// Bind mouseover
							$('.custom-drop.active li').on('mouseover', function() {
								$('.custom-drop.active').addClass('has-hover');
								$('.custom-drop.active.has-hover li').removeClass('hover');
							});
						}
					});
				});

				function runKeyDown(sel, obj) {
					var $that = obj,
							cursorPosition;
					sel.keydown(function(e) {
						e.preventDefault();

						console.log("keydown");
						
						// Setting active element - either what has been selected
						// or what is currently being hovered on
						var activeElement;

						if ($that.find('.hover').length > 0) {
							activeElement = $that.find('.hover');
						} else {
							activeElement = $that.find('.selected');
						}

						// Up/Down arrows
						if (e.which == 38 || e.which == 40) {
							openCustomDrop($that);

							// Set cursor position
							$(document).on("mousemove", function(e) {
								cursorPosition = e.pageY;
							});

							// Unbinding mouseover so hover state doesn't interact with
							// user's keying up/down
							$('.custom-drop.active li').off('mouseover');
							$('.custom-drop.active').removeClass('has-hover');
							$that.find('li').removeClass('hover');

							// Up arrow
							if (e.which == 38) {
								if (activeElement.prev().data('value')) {
									activeElement.prev('li').addClass('hover');
									activeElement = activeElement.prev('li');
								} else {
									$that.find('>:last-child').addClass('hover');
									activeElement = $that.find('>:last-child');
								}
							}
							// Down arrow
							if (e.which == 40) {
								if (activeElement.next().data('value')) {
									activeElement.next('li').addClass('hover');
									activeElement = activeElement.next('li');
								} else {
									$that.find('>:first-child').addClass('hover');
									activeElement = $that.find('>:first-child');
								}
							}

							console.log("activeElement: ", activeElement.html());

							// Scrolling within a height-restricted drop down
							$that.animate({scrollTop:$(".hover").position().top}, 50);

						} else if (e.which == 13) {// Hitting enter sets new value
							if ($that.find('.hover').length > 0) {
								setNewValue($that, $that.find('.hover').data('value'));
								hideCustomDrops();
							} else {
								hideCustomDrops();
							}

						} else if (e.which == 27) {// Hitting esc closes custom drop
							hideCustomDrops();
						}
					});
					console.log('key down')
					return cursorPosition;
				}
			},

			customCheckbox: function(el) {
				var $self 			= el,
						typeofForm 	= $self.prop('type'),
						markup 			= '<span class="'+typeofForm+'"></span>';

				// Adding selected state to label if selected by default
				if( ($self.attr('checked') || $self.attr('selected') ) && ($self.attr('checked') === 'checked' || $self.attr('selected') === 'selected') ) {
					$self.closest('label').addClass('checked');
				}
				$self.after(markup);

			}
		}
	});

	return utils.customForms.init();
});
