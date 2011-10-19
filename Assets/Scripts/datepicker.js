var datepicker = (function() {
	
	// Create the DatePicker element.
	var datePickerHTML = '<table>\
			<thead>\
				<tr>\
					<th colspan="7" class="ui-datepicker-title">September 2011</th>\
				</tr>\
				<tr>\
					<th><span class="ui-datepicker-prev" title="Previous year">«</span></th>\
					<th><span class="ui-datepicker-prev" title="Previous month">‹</span></th>\
					<th colspan="3"><span class="ui-datepicker-todaybutton">today</span></th>\
					<th><span class="ui-datepicker-next" title="Next month">›</span></th>\
					<th><span class="ui-datepicker-next" title="Next year">»</span></th>\
				</tr>\
				<tr>\
					<th class="ui-datepicker-weekdays">mon</th>\
					<th class="ui-datepicker-weekdays">tue</th>\
					<th class="ui-datepicker-weekdays">wed</th>\
					<th class="ui-datepicker-weekdays">thu</th>\
					<th class="ui-datepicker-weekdays">fri</th>\
					<th class="ui-datepicker-weekdays ui-datepicker-highlight">sat</th>\
					<th class="ui-datepicker-weekdays ui-datepicker-highlight">sun</th>\
				</tr>\
			</thead>\
			<tbody></tbody>\
		</table>',
		datePickerContainer = st.utils.createElement('div');
	
	// Assign relevant attributes to the DatePicker and
	// add it to the page.
	datePickerContainer.id = 'ui-datepicker';
	datePickerContainer.innerHTML = datePickerHTML;
	st.css.addClass(datePickerContainer, 'hideElement');
	document.body.appendChild(datePickerContainer);
	
	var __datepicker = {
		// Holder for the created Date Pickers on the page.
		datePickers: [],
		
		/**
		 * Set the date information for the script to use.
		 * Changing this here will change this on the Date Picker.
		 */
		months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		daysInMonthNormal: ['31','28','31','30','31','30','31','31','30','31','30','31'],
		daysInMonthLeap: ['31','29','31','30','31','30','31','31','30','31','30','31'],
		
		/**
		 * Default this to false so event handlers
		 * will be added once.
		 */
		eventHandlersCreated: false,
		
		/**
		 * So we can use the date info for seperate Date Pickers
		 * store the current information for manipulation elsewhere
		 * in the script.
		 */
		currentDateInfo: null,
		
		/**
		 * As we will need to access the controls constantly
		 * we'll store them for later use.
		 */
		datePickerControls: null,
		
		canHide: true,
		
		/**
		 * Set today's date for use later in the script.
		 */
		todaysDate: (function() {
			return new Date();
		}()),
		
		/**
		 * The Date Picker container.
		 */
		datePickerContainer: (function() {
			return st.utils.getEl('ui-datepicker');
		}()),
		
		/**
		 * Following method checks whether the year provided is a leap year.
		 * 
		 * @param text { Int } the year that needs to be checked.
		 * @return { Boolean } whether the year is a leap year or not.
		 */
		isLeapyear: function(year) {
			return year%400 ==0 || (year%100 != 0 && year%4 == 0);
		},
		
		/**
		 * Following method checks adds some left padding to a string.
		 * 
		 * @param text { String } the text we're going to be padding
		 * @param padString { String } the text we're going to be using to pad with.
		 * @param direction { Int } the length of the padding.
		 * @return { String } the padded string.
		 */
		lpad: function(text, padString, length) {
			var str = text.toString();
			while (str.length < length) {
				str = padString + str;
			}
			return str;
		},
		
		/**
		 * Following method creates an instance of the Date Picker
		 * 
		 * @param options { Object } settings containing relevant information
		 * @return undefined { }
		 */
		create: function(options) {
			// Make sure options are passed through to the script.
			if(typeof(options) == 'undefined') {
				throw('DatePicker: You must pass through some settings');	
			}
			
			// Create the settings for the Date Picker.
			var settings = {
					element: options.element || null,
					rangeLow: options.rangeLow || '',
					rangeHigh: options.rangeHigh || '',
					showOn: options.showOn || 'icon',
					icon: options.icon || null
				};
			
			// Make sure specific information is there before continuing.
			if(settings.element == null) {
				throw('DatePicker: You must pass through an element for the DatePicker to use');	
			}
						
			if(settings.element.tagName.toLowerCase() != 'input') {
				throw('DatePicker: You must use an input element.');	
			}
			
			if(settings.element.id == '') {
				throw('DatePicker: The element must have an ID assigned to it.');	
			}
			
			// Store different DatePicker settings for later use.
			__datepicker.datePickers[settings.element.id] = settings;
			
			// Assign the relevant event listeners to show
			// the Date Picker.
			if(settings.showOn == 'both' || settings.showOn == 'focus') {
				if ("addEventListener" in window) {
					settings.element.addEventListener('focus', __datepicker.showByFocus, true);
					settings.element.addEventListener('blur', __datepicker.hide, true);
				} else {
					settings.element.attachEvent('onfocusin', __datepicker.showByFocus);
					settings.element.attachEvent('onfocusout', __datepicker.hide);
				}
			}
			
			if(settings.showOn == 'both' || settings.showOn == 'icon') {
				// If no icon element was assigned, create it
				// and insert it next to the input element.
				if(settings.icon == null) {
					settings.icon = st.utils.createElement('span');
					st.css.addClass(settings.icon, 'icon date');
					settings.icon.innerHTML = 'Show';
					
					st.utils.insertAfter(settings.icon, settings.element);
				}
				
				st.events.add(settings.icon, 'click', function(e) {
					__datepicker.show(settings.element.id, e.target);	
				});
			}
			
			if(!__datepicker.eventHandlersCreated) {
				var datePicker = st.utils.getEl('ui-datepicker'),
					buttons = datePicker.getElementsByTagName('span');
					
				__datepicker.datePickerControls = {
					previousYear: buttons[0],
					previousMonth: buttons[1],
					nextYear: buttons[4],
					nextMonth: buttons[3],
					today: buttons[2]
				};
				
				// Change the year to the previous one.
				st.events.add(__datepicker.datePickerControls.previousYear, 'click', function(e) {
					__datepicker.changeYear(e, 'prev');
				});
				
				// Change the month to the previous one.
				st.events.add(__datepicker.datePickerControls.previousMonth, 'click', function(e) {
					__datepicker.changeMonth(e, 'prev');
				});
				
				// Change the year to the next one.
				st.events.add(__datepicker.datePickerControls.nextYear, 'click', function(e) {
					__datepicker.changeYear(e, 'next');
				});
				
				// Change the month to the next one.
				st.events.add(__datepicker.datePickerControls.nextMonth, 'click', function(e) {
					__datepicker.changeMonth(e, 'next');
				});
				
				// Change the date to show today.
				st.events.add(__datepicker.datePickerControls.today, 'click', __datepicker.changeToToday);
				
				// Tell the script we've created the event handlers
				// NOTE: This is to stop multiple events bein given to the same element.
				__datepicker.eventHandlersCreated = true;	
			}
		},
		
		/**
		 * Following method toggles whether the Date Picker can hide or not.
		 * This only handles the 'mousemove' event for when 'focus' is chosen 
		 * and the element that called the Date Picker was the 'input' elment.
		 *
		 * @param e { Object } the event object
		 * @return { Boolean } whether we can hide the Date Picker or not.
		 */
		toggleHiding: function(e) {
			// Check whether the datepicker is hiding or not.
			if(st.css.hasClass(__datepicker.datePickerContainer, 'hideElement')) {
				return false;	
			}
			
			var targ = e.target,
				isDatePicker = false;
				
			// Loop through the target until either we find the
			// Date Picker container or nothing at all.
			while(targ) {				
				if(targ == __datepicker.datePickerContainer) {
					isDatePicker = true;
					break;	
				}
				targ = targ.parentNode;
			}
			
			// Inform the class that we can or can't hide the Date Picker		
			__datepicker.canHide = !isDatePicker;
			
			// Return the result for 'toggleHidingClick'
			return __datepicker.canHide;
		},
		
		/**
		 * Following method toggles whether the Date Picker can hide or not.
		 * This only handles the 'click' event for when 'icon' is chosen. 
		 *
		 * @param e { Object } the event object
		 * @return undefined { }
		 */
		toggleHidingClick: function(e) {
			if(__datepicker.toggleHiding(e)) {
				__datepicker.hide(e);	
			}
		},
		
		/**
		 * Following method changes the year in the specified direction.
		 * 
		 * @param e { Object } the event object
		 * @param padString { String } the direction that the year will need to be changed in.
		 * @return undefined { }
		 */
		changeYear: function(e, direction) {
			var targ = e.target,
				details = __datepicker.currentDateInfo,
				newDate = '';
			
			// If the target has the specified class then stop the function from running.
			if(st.css.hasClass(targ, 'ui-datepicker-disabled')) {
				return;	
			}
			
			// Create a new date string based on the specified direction.
			if(direction=='prev') {
				newDate = details.day+'/'+details.month+'/'+(+details.year-1);
			} else {
				newDate = details.day+'/'+details.month+'/'+(+details.year+1);
			}
			
			// Rebuild the Date Picker with the new date created.
			__datepicker.buildDatePicker(newDate, details.id);
		},
		
		/**
		 * Following method changes the month in the specified direction.
		 * 
		 * @param e { Object } the event object
		 * @param padString { String } the direction that the month will need to be changed in.
		 * @return undefined { }
		 */
		changeMonth: function(e, direction) {
			var targ = e.target,
				details = __datepicker.currentDateInfo,
				newDate = '';
			
			// If the target has the specified class then stop the function from running.
			if(st.css.hasClass(targ, 'ui-datepicker-disabled')) {
				return;	
			}
			
			if(direction=='prev') {
				// If the current month is 1, going backwards would mean
				// that the year changes. So to do this we check if it
				// is 1 and then changing the year accordingly.
				// Otherwise a month is taken off.
				if(details.month == 1) {
					newDate = details.day+'/12/'+(+details.year-1);
				} else {
					newDate = details.day+'/'+(+details.month-1)+'/'+details.year;
				}
			} else {
				// Same principal for this, if the current month is 12
				// going forward one will need the year changed.
				if(details.month == 12) {
					newDate = details.day+'/01/'+(+details.year+1);
				} else {
					newDate = details.day+'/'+(+details.month+1)+'/'+details.year;
				}
			}
			
			// Rebuild the Date Picker with the new date created.
			__datepicker.buildDatePicker(newDate, details.id);
		},
		
		/**
		 * Following method changes the Date Picker to display the month with today's date.
		 * 
		 * @param e { Object } the event object
		 * @return undefined { }
		 */
		changeToToday: function(e) {
			var details = __datepicker.currentDateInfo;
			
			// Rebuild the Date Picker with the new date created.
			__datepicker.buildDatePicker(__datepicker.lpad(__datepicker.todaysDate.getDate(), 0, 2)+"/"+__datepicker.lpad(+__datepicker.todaysDate.getMonth()+1, 0, 2)+"/"+__datepicker.todaysDate.getFullYear(), details.id);
		},
		
		/**
		 * Following method displays the Date Picker from a focus event.
		 * The reason for this is because we need to get the ID but
		 * we cannot know what it is without doing this extra step. 
		 *
		 * @param e { Object } the event object
		 * @return undefined { }
		 */
		showByFocus: function(e) {
			var targ = e.target || e.srcElement;
			
			__datepicker.show(targ.id, targ);
		},
		
		/**
		 * Following method displays and builds the Date Picker to show
		 * the selected/default date.
		 * 
		 * @param e { Object } the event object
		 * @param element { Node } the element that called this method.
		 * @return undefined { }
		 */
		show: function(id, element) {
			var settings = __datepicker.datePickers[id],
				selectedDate = settings.element.value,
				offset = st.utils.getOffset(element);
			
			if(selectedDate == '') {
				selectedDate = __datepicker.lpad(__datepicker.todaysDate.getDate(), 0, 2)+'/'+__datepicker.lpad(__datepicker.todaysDate.getMonth()+1, 0, 2)+'/'+__datepicker.todaysDate.getFullYear();
			}
			
			__datepicker.datePickerContainer.style.top = (offset.top+element.offsetHeight) + 3 + 'px';
			__datepicker.datePickerContainer.style.left = offset.left + 'px';
			
			// Build the calendar for the selected date.
			__datepicker.buildDatePicker(selectedDate, id);
			st.css.removeClass(__datepicker.datePickerContainer, 'hideElement');
			
			if(element.tagName.toLowerCase() == 'input') {
				st.events.add(document, 'mousemove', __datepicker.toggleHiding);
			} else {
				st.events.add(document, 'click', __datepicker.toggleHidingClick);
			}
		},
		
		/**
		 * The following method hides the Date Picker.
		 * 
		 * @param e { Object } the event object
		 * @return undefined { }
		 */
		hide: function(e) {
			var eventType = (typeof(e) == 'object'?e.type:e);
			if(__datepicker.canHide || eventType == 'click') {
				st.css.addClass(__datepicker.datePickerContainer, 'hideElement');
				
				st.events.remove(document, 'mousemove', __datepicker.toggleHiding);
				st.events.remove(document, 'click', __datepicker.toggleHidingClick);
			}
		},
		
		/**
		 * Following method builds the Date Picker for the date passed through.
		 * 
		 * @param date { String } the date of the current Date Picker element
		 * @param id { String } the id of the Date Picker element.
		 * @return undefined { }
		 */
		buildDatePicker: function(date, id) {
			var newCalendarDate = new Date(),
				dateSplit = date.split('/'),
				settings = __datepicker.datePickers[id];
			
			// Set the date to the date passed through.
			newCalendarDate.setDate(dateSplit[0]);
			newCalendarDate.setMonth(+dateSplit[1]-1);
			newCalendarDate.setFullYear(dateSplit[2]);
			
			var	thisMonth = newCalendarDate.getMonth(),
				thisYear = newCalendarDate.getFullYear(),
				thisDate = newCalendarDate.getDate(),
				thisDay = newCalendarDate.getDay(),
				isLeapYear = __datepicker.isLeapyear(thisYear),
				daysInMonth = (isLeapYear?__datepicker.daysInMonthLeap[thisMonth]:__datepicker.daysInMonthNormal[thisMonth]),
				calendarRows = 6,
				monthStartsOn = 0,
				calendarWeek = calendarDay = null,
				hasPassedFirstDay = false,
				curDay = 1,
				calendarBody = __datepicker.datePickerContainer.getElementsByTagName('tbody')[0],
				thisDateShort = 0,
				todayShort = parseInt(__datepicker.todaysDate.getFullYear()+__datepicker.lpad(__datepicker.todaysDate.getMonth()+1, 0, 2)+__datepicker.lpad(__datepicker.todaysDate.getDate(), 0, 2)),
				selectedSplit = settings.element.value.split('/'),
				selectedDateShort = selectedSplit[2]+selectedSplit[1]+selectedSplit[0],
				calendarDays = calendarBody.getElementsByTagName('td'),
				len = calendarDays.length,
				parent = calendarBody.parentNode;
			
			
			// IE 7 wouldn't allow me to simply remove the contents
			// via innerHTML, so instead, I'll remove the tbody from
			// the DOM and reinsert it.
			calendarBody.parentNode.removeChild(calendarBody);
			calendarBody = st.utils.createElement('tbody');
			parent.appendChild(calendarBody);
			
			__datepicker.datePickerContainer.getElementsByTagName('th')[0].innerHTML = __datepicker.months[thisMonth]+' '+thisYear;
			
			newCalendarDate.setDate(1);
			monthStartsOn = newCalendarDate.getDay();
			
			// Loop through the amount of rows there are
			while(calendarRows--) {
				calendarWeek = st.utils.createElement('tr');
				
				// Loop through the days of the week.
				for(var d=1, i=0; d<=7; d++) {
					if(d==7) {
						i=0;	
					} else {
						i=d;	
					}
					
					// Create a 'Short' (YYYYMMDD) version of this date so we can
					// do checks on it later.
					thisDateShort = parseInt(thisYear+__datepicker.lpad(thisMonth+1, 0, 2)+__datepicker.lpad(curDay, 0, 2));
					
					// Create the day element.
					calendarDay = st.utils.createElement('td');
					
					// If i is 0 or 6 then it's a weekend.
					if(i == 0 || i == 6) {
						st.css.addClass(calendarDay, 'ui-datepicker-highlight');
					}
					
					// Check to see if this date is unused. I.E. is before the month has started
					// or is after the month has ended.
					if((!hasPassedFirstDay && i < monthStartsOn) || curDay > (+daysInMonth+1)) {
						st.css.addClass(calendarDay, 'ui-datepicker-unused');
					} else {
						// make sure we tell the script that the first day has been passed.
						hasPassedFirstDay = true;
						
						// Check if the dates are out of range.
						if((settings.rangeLow != '' && settings.rangeLow >= thisDateShort) || (settings.rangeHigh != '' && settings.rangeHigh <= thisDateShort)) {
							st.css.addClass(calendarDay, 'ui-datepicker-outofrange');
						} else {
							// Otherwise assign some event handlers.
							st.events.add(calendarDay, 'mouseover', __datepicker.mouseOverDay);
							st.events.add(calendarDay, 'mouseout', __datepicker.mouseOutDay);
							st.events.add(calendarDay, 'click', function(e){
								__datepicker.chooseDate(e, settings)	
							});
							
							// Check to see if it's today.
							if(todayShort == thisDateShort) {
								st.css.addClass(calendarDay, 'ui-datepicker-today');
							}
							
							if(selectedDateShort == thisDateShort) {
								st.css.addClass(calendarDay, 'ui-datepicker-selecteddate');
							}
						}
						
						// Set the day element's html to this day.
						calendarDay.innerHTML = curDay;
						calendarDay.setAttribute('date', __datepicker.lpad(curDay, 0, 2)+'/'+__datepicker.lpad(newCalendarDate.getMonth()+1, 0, 2)+'/'+newCalendarDate.getFullYear());
						
						// Increment the day.
						curDay++;
					}
					
					// Append the day to the week.
					calendarWeek.appendChild(calendarDay);
				}
				
				// Append the week to the calendar.
				calendarBody.appendChild(calendarWeek);
			}
			
			__datepicker.currentDateInfo = {
				day: __datepicker.lpad(dateSplit[0], 0, 2),
				month: __datepicker.lpad(dateSplit[1], 0, 2),
				year: dateSplit[2],
				id: id
			}
			
			var nextYear = (+thisYear+1)+__datepicker.lpad(+thisMonth+1, 0, 2),
				prevYear = (+thisYear-1)+__datepicker.lpad(+thisMonth+1, 0, 2),
				nextMonth = thisYear+__datepicker.lpad(+thisMonth+2, 0, 2),
				prevMonth = thisYear+__datepicker.lpad(+thisMonth-1, 0, 2),
				rangeHighMod = (settings.rangeHigh!=''?settings.rangeHigh.substring(0, 6):''),
				rangeLowMod = (settings.rangeLow!=''?settings.rangeLow.substring(0, 6):'');
			
			st.css.removeClass(__datepicker.datePickerControls.previousYear, 'ui-datepicker-disabled');
			st.css.removeClass(__datepicker.datePickerControls.previousMonth, 'ui-datepicker-disabled');
			st.css.removeClass(__datepicker.datePickerControls.nextMonth, 'ui-datepicker-disabled');
			st.css.removeClass(__datepicker.datePickerControls.nextYear, 'ui-datepicker-disabled');
						
			if(rangeLowMod != "") {
				if(prevMonth < rangeLowMod) {
					st.css.addClass(__datepicker.datePickerControls.previousMonth, 'ui-datepicker-disabled');
				}
				
				if(prevYear < rangeLowMod) {
					st.css.addClass(__datepicker.datePickerControls.previousYear, 'ui-datepicker-disabled');
				}
			}
			
			if(rangeHighMod != "") {
				if(nextYear > rangeHighMod) {
					st.css.addClass(__datepicker.datePickerControls.nextYear, 'ui-datepicker-disabled');
				}
				
				if(nextMonth > rangeHighMod) {
					st.css.addClass(__datepicker.datePickerControls.nextMonth, 'ui-datepicker-disabled');
				}
			}
		},
		
		/**
		 * Following method is effectively a "hover" class for the selected element.
		 * 
		 * @param e { e } the event object.
		 * @return undefined { }
		 */
		mouseOverDay: function(e) {
			var targ = e.target;
			
			st.css.addClass(targ, 'ui-datepicker-hover');
		},
		
		/**
		 * Following method is removes the "hover" class for the selected element.
		 * 
		 * @param e { e } the event object.
		 * @return undefined { }
		 */
		mouseOutDay: function(e) {
			var targ = e.target;
			
			st.css.removeClass(targ, 'ui-datepicker-hover');
		},
		
		/**
		 * Following method is effectively a "hover" class for TD elements.
		 * 
		 * @param e { e } the event object.
		 * @param e { settings } the settings object for the current Date Picker.
		 * @return undefined { }
		 */
		chooseDate: function(e, settings) {
			var targ = e.target,
				chosenDate = targ.innerHTML;
			
			settings.element.value = targ.getAttribute('date');
			
			__datepicker.hide(e);
		}
	};
	
	return {
		create: __datepicker.create,
		show: __datepicker.show
	}
	
}());