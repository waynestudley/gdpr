
"use strict";
//ie8 missing functions
if(typeof String.prototype.trim!=='function'){String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,'');}}
if (!Array.prototype.indexOf){Array.prototype.indexOf = function(elt /*, from*/){var len = this.length >>> 0;var from=Number(arguments[1])||0;from=(from<0)?Math.ceil(from):Math.floor(from);if(from<0)from+=len;for(;from<len;from++){if(from in this&&this[from]===elt)return from;}return -1;};}
// ie9 missing ISO date
if (!Date.prototype.toISOString){(function(){function pad(number){var r=String(number);if(r.length===1){r='0'+r;}return r;} Date.prototype.toISOString=function(){return this.getUTCFullYear()+'-'+pad(this.getUTCMonth()+1)+'-'+pad(this.getUTCDate())+'T'+pad(this.getUTCHours())+':'+pad(this.getUTCMinutes())+':'+pad( this.getUTCSeconds())+'.'+String( (this.getUTCMilliseconds()/1000).toFixed(3)).slice(2,5)+'Z';};}());}
/* Copyright (c) 2017 Elucidat Ltd - All rights reserved */
console.log("Elucidat.com Rapid Authoring (v.gd34d540) built with love on 2017-02-15 10:02:40");

// Include: javascript/release/build/bootstrap.overrides.js

// wait for bootstrap
(function () {
	function fix_bootstrap () { 

		if ($.fn.popover) {
			// tooltip titles do wierd horrid behaviour that cocks up accessibility and comments feature
			$.fn.popover.Constructor.prototype.fixTitle = function () {};
		  	// modals need to be moved, so that they come in at the end of the page and overlay everything properly
		  	// this will catch them all as they are set up
			$.fn.moved_modal = $.fn.modal;
			// we need a modal specific event fired, so another sucker punch
			$.fn.modal.Constructor.prototype.old_hideModal = $.fn.modal.Constructor.prototype.hideModal;
			$.fn.modal.Constructor.prototype.hideModal = function () {
				this.old_hideModal.apply(this,arguments);
				this.$element.trigger('modal-hidden');
			};
			// add a custom class on the backdrop
			$.fn.modal.Constructor.prototype.old_backdrop = $.fn.modal.Constructor.prototype.backdrop;
			$.fn.modal.Constructor.prototype.backdrop = function () {
				var re = this.old_backdrop.apply(this,arguments);
				if (this.$element.hasClass('app') && this.$backdrop) {
					this.$backdrop.addClass('app');
				}
				return re;
			};
			// redefine modal popup to move modal prior to launch, and have event handler
		    $.fn.modal = function (options) {
		        return this.each(function() {

		        	var $this = $(this);
		        	// only do for project popups
		        	if ($this.parents("#pew").length && !$this.hasClass('in')) {
		        		// and only if not active
			        	// make a note of where it came from
			        	$this.data('parent', $this.parent());

			        	// make a wrapper for the modal to into
			        	var $modal_holder = $("#pew div:first");
			        	var $modal_wrapper = $modal_holder.find('> div.modal_wrapper');
			        		if (!$modal_wrapper.length) {
			        			$modal_wrapper = $('<div class="modal_wrapper" aria-live="rude"></div>');
			        			$modal_holder.append($modal_wrapper);
			        		}
			        	// IF the modal came from within a page, we are going to do something horribly dirty. Makes me feel unclean writing it even
			        	// Page edits are locked into the page by the page ID, so we need to wrap the modal in an element with the same ID as the page it came from
			        	// To whoever reads this - sorry - would love to have a better solution - prize if you can give one
			        	var $paw = $this.parents('#paw');
			        	if ($paw.length) {
			        		$modal_wrapper.attr('id', $paw.parent().attr('id'));
			        		// yep - felt dirty writing that
			        	}
			        	// move to just inside project edit wrapper. Should hopefully be inside body tag and so get font size / family
			        	$this.appendTo($modal_wrapper);
			        	// hide from screen readers
			        	// undo modal dialogue behaviour as it is crazy http://webaim.org/discussion/mail_thread?thread=5664
			        	$this.removeAttr('role').removeAttr('aria-labelled-by').attr('tabIndex','-1');

			        	// remove tidy up
				        $this.on('modal-hidden', function (e) {
				        	$(this).modal_destroy();
							return false;
						});
		        	}
			        $this.moved_modal(options);

		            $this.find('div.video_player').video();
		            $this.find('div.audio_player').audio();
                    // update ie8 bg images
                    if (window['ie8bg'])
                        ie8bg.updateElems().getElems().ie8poly_bg_size();
				    
		        });
		    };
		    $.fn.modal.defaults = $.fn.moved_modal.defaults;
			// do not show backdrop on modals for IE7 - as it comes in the wrong position of the page and overlays the modal
			if ($('html').hasClass('ie7'))
				$.fn.modal.defaults.backdrop = false;


			// This code, backported from Bootstrap 3.x removes the scroll bar from the body and prevents it from scrolling while a modal is open.
			var Modal_ScrollFix = function() {
				this.init();
			};
			Modal_ScrollFix.prototype.init = function() {
				this.$body = $('body');
			};
			Modal_ScrollFix.prototype.checkScrollbar = function () {
				var fullWindowWidth = window.innerWidth;
				if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
					var documentElementRect = document.documentElement.getBoundingClientRect();
					fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left);
				}
				this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth;
				this.scrollbarWidth = this.measureScrollbar();
			};
			Modal_ScrollFix.prototype.setScrollbar = function () {
				var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10);
				this.originalBodyPad = document.body.style.paddingRight || '';
				if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth);
			};
			Modal_ScrollFix.prototype.resetScrollbar = function () {
				this.$body.css('padding-right', this.originalBodyPad);
			};
			Modal_ScrollFix.prototype.measureScrollbar = function () {
				var scrollDiv = document.createElement('div');
				scrollDiv.className = 'modal-scrollbar-measure';
				this.$body.append(scrollDiv);
				var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
				this.$body[0].removeChild(scrollDiv);
				return scrollbarWidth;
			};

			var fixScroll = new Modal_ScrollFix();

			fixScroll.$body
				.on('show', '.modal', function () {
					//on modal open
					fixScroll.checkScrollbar();
					fixScroll.setScrollbar();
					fixScroll.$body.addClass('e-modal-open');
				})
				.on('hidden', '.modal', function () {
					fixScroll.$body.removeClass('e-modal-open');
					//on modal close
					fixScroll.resetScrollbar();
				});

			// pause any video / audio on tab reveal
		  	$(document).on('click.interaction.shown', '[data-toggle="tab"]', function (e) {
				var $paw = $('#paw');
				// find any audio / video players and pause them
			    $paw.find('div.video_player').video('pause');
			    $paw.find('div.audio_player').audio('pause');
		  	});

			// mark interacted content as shown
			$(document).on('click.interaction.shown', '[data-toggle="modal"],[data-toggle="dropdown"],[data-toggle="tab"]', function (e) {
				var $this = $(this);
                var $paw = $('#paw');
				var $target = $( $this.attr('data-target') ? $this.attr('data-target') : $this.attr('href') );
				
                if ($target.length) {
                    $paw.find('div.video_player').video('pause');
    			    $paw.find('div.audio_player').audio('pause');
					// refresh audio and video players
                    // implement the players
			        $target.find('div.video_player').video();
			        $target.find('div.audio_player').audio();
                    
                    // IF the collapse or modal has completable sections itself - then we wait for 
                    // whatever the sub-item is before we complete
                    // slight delay to let the completable sections to be registered
                    // (as the event is on close there's no great hurry)
                    setTimeout(function () {
                        var $completable = $target.find('.e-scorable-section,.e-completable-section');
                        // if there are completable items...
                        if ($completable.length) {
                            // only add shown on complete
                            // this code adds shown on first complete item
                            $target.on('section_complete', function () {
            			        // add 'tick' on complete
                                $this.addClass('shown');
                            });
                        } else {
                            // just add tick straight away
        			        $this.addClass('shown');
                        }
                    },100);
                    
                    // update ie8 bg images
                    if (window['ie8bg'])
                        ie8bg.updateElems().getElems().ie8poly_bg_size();
		    	
                } else
                    // - no linked modal - just add tick straight away
			        $this.addClass('shown');
		  	});

			// buildups - giving an automatic way of triggering 'next' in a buildup - http://stackoverflow.com/questions/12805825/can-you-specify-a-data-target-for-bootstrap-which-refers-to-a-sibling-dom-elem
			$(document).on('click.collapse-next.data-api', '[data-toggle=collapse-next]', function (e) {
		    	var $this = $(this);
		    	if (!$this.hasClass('shown')) {
		    		// now we check the previous item - we should only allow this click if there isn't a previous, or if previous has been shown
			    	var $previous = $this.prev('[data-toggle=collapse-next]');
			    	if (!$previous.length)
			    		$previous = $this.parent().prev().find('[data-toggle=collapse-next]');
			    	if (!$previous.length || $previous.hasClass('shown')) {
				    	var $target = $this.next('[data-toggle=collapse-next]');
				    	if (!$target.length)
				    		$target = $this.parent().next();
				  		
				  		$this.addClass('shown');
				  		$target.data('collapse') ? $target.collapse('toggle') : $target.collapse();
                        
                        // trigger the shown on the newly shown element after you've had a chance to see it
                        setTimeout(function () {
                            $target.trigger('shown');
                        },2000);
				  		
						// refresh audio and video players
				        $target.find('div.video_player').video();
				        $target.find('div.audio_player').audio();
                        // update ie8 bg images
                        if (window['ie8bg'])
                            ie8bg.updateElems().getElems().ie8poly_bg_size();
			  		}
		  		}
			});
			// accordian - fix behaviour that does not change state of any open accordians when others are clicked
			$.fn.collapse.Constructor.prototype.toggle = function () {

				var $paw = $('#paw');
				var $el = this.$element;
				// find any audio / video players and pause them
			    $paw.find('div.video_player').video('pause');
			    $paw.find('div.audio_player').audio('pause');
				setTimeout(function() {
                    // update ie8 bg images
                    if (window['ie8bg'])
					    ie8bg.updateElems().getElems().ie8poly_bg_size();
				},100);

				var shown = $el.hasClass('in');

				if (!shown) {
		    		$el.parents('.accordion:first').find('.accordion-heading > a').removeClass('opened');
					$el.siblings('.accordion-heading').find('> a').addClass('opened');
				} else {
					$el.siblings('.accordion-heading').find('> a').removeClass('opened');
				}

				if($el.hasClass('flipcard')) {
					if(shown) {
						$el.find('.flipcard__front').attr('aria-hidden', false);
						$el.find('.flipcard__front :focusable').attr('aria-hidden', false);
						$el.find('.flipcard__back').attr('aria-hidden', true);
						$el.find('.flipcard__back :focusable').attr('aria-hidden', true);
					} else {
                        $el.find('.flipcard__back').attr('aria-hidden', false);
						$el.find('.flipcard__back :focusable').attr('aria-hidden', false);
                        $el.find('.flipcard__front').attr('aria-hidden', true);
						$el.find('.flipcard__front :focusable').attr('aria-hidden', true);
					}
				}
				this[$el.hasClass('in') ? 'hide' : 'show']();
		    };

			// collapse resizing - removing with a dirty sucker punch
			$.fn.collapse.Constructor.prototype.dimension = function () {
				if (this.$element.hasClass('no-resize')) {
					this.$element.do_nothing = function () { return 'auto'; };
			    	return 'do_nothing';
			    } else {
			    	var hasWidth = this.$element.hasClass('width');
			    	return hasWidth ? 'width' : 'height';
			    }
		    };
			// carousel mods - autoplay false and toggle buttons on slide
			$.fn.carousel.defaults = {
		    	interval: false
			};

			// give jquery the magic of reverse
			$.fn.reverse = [].reverse;

			// disabling last click item in carousels
			$(document).on("slid", function(e) {

				var $items = $(e.target).find('.item');
				var is_first = false, is_last = false;

				// find any audio / video players and pause them
				// make any that haven't been made already
		        $items.find('div.video_player').video('pause').video();
		        $items.find('div.audio_player').audio('pause').audio();
                // update ie8 bg images
                if (window['ie8bg'])
                    ie8bg.updateElems().getElems().ie8poly_bg_size();

				// iterate to find first and last
				$items.each(function (index) {
					if ( !$(this).closest('.add-option-template').length ) {
						if ( $(this).hasClass('active'))
							is_first = true;
						return false;
					}
				});

				// now same in reverse
				$items.reverse().each(function (index) {
					if ( !$(this).closest('.add-option-template').length ) {
						if ( $(this).hasClass('active'))
							is_last = true;
						return false;
					}
				});
				
				// find buttons
				$('#pew [data-slide]').each(function () {
					var $el = $(this);
					if ($el.attr('data-slide') == 'prev')
						if (is_first)
							$el.addClass('hide');
						else
							$el.removeClass('hide');

					else if ($el.attr('data-slide') == 'next')
						if (is_last)
							$el.addClass('hide');
						else
							$el.removeClass('hide');
				});
			});
		// otherwise wait until ready
		} else
			setTimeout(fix_bootstrap,125);
		
	}
	fix_bootstrap();
})();

// Include: javascript/release/build/Elucidat.js
/* 
notes - to add:
    1.2
        cmi.core.student_id
        cmi.core.student_name
    2004
        cmi.learner_id
        cmi.learner_name
*/

/* ELUCIDAT PUBLIC CLASS DEFINITION
* ============================== */
if (!window['Elucidat'])
    var Elucidat;

Elucidat = function (options, lrs_activity_id, lrs_endpoints) {

    var context = this;
    context.options = $.extend({}, {
        allow_completed_pages:1,
        allow_future_pages:true,
        allow_retakes:true,
        global_pass_rate:80,
        global_completion_rate:90,
        completion_action:"completed",
        auto_shuffle_pools:true,
        score_partially_correct:true,
        has_manage_progress_run: false,
        homepage_url: '',
        lms: null,
        loader: null,
        history: {},
        answers: {},
        inputs: {},
        mode: null
    }, options);
    context.course_name = $('title').text();
    context.progress = 0;
    context.pages = {};
    context.question_pools = new QuestionPoolContainer();
    context.page_order = [];
    context.achievements = {};
    context.awarded_achievements = [];
    context.current_page = false;
    context.next_page = null;
    context.previous_page = null;
    context.total_pages = 0;
    context.animation = {
        'in': {
            speed: '0.5s',
            style: 'fadeIn'
        },
        'out': {
            speed: '0.75s',
            style: 'fadeOut'
        }
    };
    context.sent_lms_completion = false;
    context.should_shuffle_pools = false;
    context.sent_lrs_completion = false;
    context.sent_result = false;
    context.has_retaken_questions = false;
    context.sent_termination = false;
    context.$nav_container = null;
    context.navigation_loaded = false;
    context.navigation_created = false;
    context.navigation_template = '';
    context.navigation_attempts = 0;
    context.navigating = 'ready'; // while we are transitioning - don't allow further navigation
    context.uid = 0;
    // session timer
    context.timer = new Elucidat_Timer( this );
    // tincan statement queue
    context.lrs = new Elucidat_Xapi_Queue();
    // set up LRS (backwards compatible for now)
    context.lrs.activity_id = lrs_activity_id || context.options.lrs_activity_id;
    // and pass through any endpoints to send usage data to (backwards compatible for now)
    context.lrs.endpoints = lrs_endpoints || context.options.lrs_endpoints || [];
    // lrs commenting going
    context.commenting_in_progress = false;
    //PHP populates the empty object inside this call to _load_navigation when the course is built.
    // now navigation
    this._load_navigation({"template":"<li class=\"menu__item {{page.is_section}} {{page.active}} e-no-controls\">\n    <a href=\"{{page.url}}\" class=\"itemInner menu__item__inner\" title=\"{{page.name}}\" data-dismiss=\"dropdown\">\n        <span class=\"icon\">\n            <i class=\"ti ti-lock\"><span class=\"focusHelper\"><\/span><\/i>\n        <\/span>\n        <span class=\"text e-no-controls\">{{page.name}}<\/span>\n    <\/a>\n    {{page.sub_pages}}\n<\/li>","url_format":"pages\/%s.js","pages":{"5888d6b1831b0":{"n":"Global data protection","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_5888d6b183264","v":"viewed"},"5888d6b188c84":{"n":"Senior leader message (video)","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"m":1,"b":"_5888d6b188d37","v":"viewed"},"5888d6b18e034":{"n":"Senior leader message (text)","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"m":1,"b":"_5888d6b18e0e5","v":"viewed"},"5888d6b1936f8":{"n":"Menu","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_5888d6b1937a8","v":"viewed"},"5888d6b1991bf":{"n":"Privacy in a changing world","mn":false,"mod":false,"hol":false,"sec":true,"i":false,"s":1,"b":"_5888d6b199271","v":"viewed","d":true},"5888d6b19e755":{"n":"The secret life of personal data","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_5888d6b19e803","v":"viewed","p":"5888d6b1991bf"},"5888d6b1a4c3a":{"n":"Personal data","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"c":1,"b":"_5888d6b1a4cec","w":"0","v":"any-score","p":"5888d6b1991bf"},"5888d6b1ab09b":{"n":"The EU General Data Protection Regulation","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_589c5cc87b7a3","v":"viewed","p":"5888d6b1991bf"},"5888d6b1b1120":{"n":"Summary","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_5888d6b1b11d2","v":"viewed","p":"5888d6b1991bf"},"5888d6b1b7109":{"n":"Privacy principles","mn":false,"mod":false,"hol":false,"sec":true,"i":false,"s":1,"b":"_5888d6b1b71bb","v":"viewed","d":true},"5888d6b1bcac6":{"n":"Technical terms","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_5888d6b1bcb76","v":"viewed","p":"5888d6b1b7109"},"5888d6b1c2d97":{"n":"The Everard Engineering story","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"c":1,"l":1,"b":"_5888d6b1c2e45","w":"0","v":"any-score","p":"5888d6b1b7109"},"5888d6b1c8716":{"n":"Key principles","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_5888d6b1c87c7","v":"viewed","p":"5888d6b1b7109"},"5888d6b1ce42c":{"n":"Processing personal data","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_5888d6b1ce4db","v":"viewed","p":"5888d6b1b7109"},"5888d6b1d422a":{"n":"Summary","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_5888d6b1d42da","v":"viewed","p":"5888d6b1b7109"},"5888d6b1d9d8a":{"n":"Personal data in the digital world","mn":false,"mod":false,"hol":false,"sec":true,"i":false,"s":1,"b":"_5888d6b1d9e3f","v":"viewed","d":true},"5888d6b1dffed":{"n":"Mythbuster - what is it?","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"c":1,"b":"_5888d6b1e00a1","w":"0","v":"any-score","p":"5888d6b1d9d8a"},"5888d6b1e85de":{"n":"Collecting personal information","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_5888d6b1e866d","v":"viewed","p":"5888d6b1d9d8a"},"5888d6b1ef237":{"n":"Mythbuster - secondary purpose","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"c":1,"b":"_5888d6b1ef2e9","w":"0","v":"any-score","p":"5888d6b1d9d8a"},"5888d6b200d25":{"n":"Secondary purpose","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_589c67279b8fe","v":"viewed","p":"5888d6b1d9d8a"},"5888d6b20790f":{"n":"What if...","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_5888d6b2079c1","v":"viewed","p":"5888d6b1d9d8a"},"5888d6b20d9cd":{"n":"Summary","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_5888d6b20da80","v":"viewed","p":"5888d6b1d9d8a"},"5888d6b213b7e":{"n":"Rights of the individual","mn":false,"mod":false,"hol":false,"sec":true,"i":false,"s":1,"b":"_5888d6b213c2a","v":"viewed","d":true},"5888d6b219b90":{"n":"Right to access","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_589c779fbb67b","v":"viewed","p":"5888d6b213b7e"},"5888d6b21fb1e":{"n":"Sarah's story","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"c":1,"b":"_5888d6b21fbdb","w":"0","v":"any-score","p":"5888d6b213b7e"},"5888d6b225ac5":{"n":"Your rights","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_5888d6b225b77","v":"viewed","p":"5888d6b213b7e"},"5888d6b22b64f":{"n":"Did you know?","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"c":1,"b":"_5888d6b22b6ff","w":"0","v":"any-score","p":"5888d6b213b7e"},"5888d6b2312b2":{"n":"Search engines","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_5888d6b231363","v":"viewed","p":"5888d6b213b7e"},"5888d6b237351":{"n":"What do you think?","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_5888d6b237403","v":"viewed","p":"5888d6b213b7e"},"5888d6b23d13f":{"n":"Sarah's story","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_5888d6b23d1f2","w":"0","v":"viewed","p":"5888d6b213b7e"},"5888d6b242bb7":{"n":"Summary","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_5888d6b242c69","v":"viewed","p":"5888d6b213b7e"},"5888d6b248ca9":{"n":"Transferring data","mn":false,"mod":false,"hol":false,"sec":true,"i":false,"s":1,"b":"_5888d6b248d63","v":"viewed","d":true},"5888d6b24e75c":{"n":"The Zentech story","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_5888d6b24e812","v":"viewed","p":"5888d6b248ca9"},"5888d6b254e6c":{"n":"Cross border transfers","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_5888d6b254f22","v":"viewed","p":"5888d6b248ca9"},"5888d6b25af9b":{"n":"Transferring data to the USA","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_5888d6b25b04b","v":"viewed","p":"5888d6b248ca9"},"5888d6b26116f":{"n":"Summary","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_5888d6b26121e","v":"viewed","p":"5888d6b248ca9"},"5888d6b266c33":{"n":"Data breaches","mn":false,"mod":false,"hol":false,"sec":true,"i":false,"s":1,"b":"_5888d6b266ce4","v":"viewed","d":true},"5888d6b26c5b5":{"n":"Ashley Madison","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"c":1,"b":"_5888d6b26c665","w":"0","v":"any-score","p":"5888d6b266c33"},"5888d6b272eff":{"n":"Ashley Madison - what happened?","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"m":1,"b":"_5888d6b272fae","v":"viewed","p":"5888d6b266c33"},"5888d6b27923b":{"n":"Talk Talk","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"c":1,"b":"_5888d6b2792ed","w":"0","v":"any-score","p":"5888d6b266c33"},"5888d6b27f17e":{"n":"Talk Talk - what happened?","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"m":1,"b":"_5888d6b27f230","v":"viewed","p":"5888d6b266c33"},"5888d6b2850f4":{"n":"HMRC","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"c":1,"b":"_5888d6b2851a4","w":"0","v":"any-score","p":"5888d6b266c33"},"5888d6b28b28a":{"n":"HMRC - what happened?","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"m":1,"b":"_5888d6b28b33b","v":"viewed","p":"5888d6b266c33"},"5888d6b291a91":{"n":"US voter database","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"c":1,"b":"_5888d6b291b43","w":"0","v":"any-score","p":"5888d6b266c33"},"5888d6b2976fc":{"n":"US voters database - what happened?","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"m":1,"b":"_5888d6b2977ac","v":"viewed","p":"5888d6b266c33"},"5888d6b29d429":{"n":"Other data breaches","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_5888d6b29d4d9","v":"viewed","p":"5888d6b266c33"},"5888d6b2a3a0a":{"n":"Data breaches and the GDPR","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_5888d6b2a3aba","v":"viewed","p":"5888d6b266c33"},"5888d6b2aa759":{"n":"Summary","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"b":"_5888d6b2aa81a","v":"viewed","p":"5888d6b266c33"},"5888d6b2b0263":{"n":"Check your knowledge","mn":false,"mod":false,"hol":false,"sec":true,"i":false,"s":1,"b":"_5888d6b2b0316","v":"viewed","d":true},"5888d6b2b5ee4":{"n":"Question 1.1","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"m":1,"c":1,"b":"_5888d6b2b5f96","q":"Group1:50","v":"any-score","p":"5888d6b2b0263"},"5888d6b2bbfc9":{"n":"Question 1.2","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"m":1,"c":1,"b":"_5888d6b2bc086","q":"Group1:50","v":"any-score","p":"5888d6b2b0263"},"5888d6b2c27ca":{"n":"Question 2.1","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"m":1,"c":1,"b":"_5888d6b2c287c","q":"Group2:50","v":"any-score","p":"5888d6b2b0263"},"5888d6b2c8a1b":{"n":"Question 2.2","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"m":1,"c":1,"b":"_5888d6b2c8aca","q":"Group2:50","v":"any-score","p":"5888d6b2b0263"},"5888d6b2ce5f1":{"n":"Question 3.1","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"m":1,"c":1,"b":"_5888d6b2ce69f","q":"Group3:35","v":"any-score","p":"5888d6b2b0263"},"5888d6b2d42c4":{"n":"Question 3.2","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"m":1,"c":1,"b":"_5888d6b2d4388","q":"Group3:35","v":"any-score","p":"5888d6b2b0263"},"5888d6b2d9ea0":{"n":"Question 3.3","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"m":1,"c":1,"b":"_5888d6b2d9f4f","q":"Group3:35","v":"any-score","p":"5888d6b2b0263"},"5888d6b2dfd27":{"n":"Question 4.1","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"m":1,"c":1,"b":"_5888d6b2dfdd7","q":"Group4:35","v":"any-score","p":"5888d6b2b0263"},"5888d6b2e593e":{"n":"Question 4.2","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"m":1,"c":1,"b":"_5888d6b2e59f2","q":"Group4:35","v":"any-score","p":"5888d6b2b0263"},"5888d6b2eba48":{"n":"Question 4.3","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"m":1,"c":1,"b":"_5888d6b2ebaf9","q":"Group4:35","v":"any-score","p":"5888d6b2b0263"},"5888d6b2f24c2":{"n":"Question 5.1","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"m":1,"c":1,"b":"_5888d6b2f2578","q":"Group5:50","v":"any-score","p":"5888d6b2b0263"},"5888d6b3045a3":{"n":"Question 5.2","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"m":1,"c":1,"b":"_5888d6b304657","q":"Group5:50","v":"any-score","p":"5888d6b2b0263"},"5888d6b30ac86":{"n":"Question 6.1","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"m":1,"c":1,"b":"_5888d6b30ad38","q":"Group6:50","v":"any-score","p":"5888d6b2b0263"},"5888d6b31096d":{"n":"Question 6.2","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"m":1,"c":1,"b":"_5888d6b310a1e","q":"Group6:50","v":"any-score","p":"5888d6b2b0263"},"5888d6b316351":{"n":"Results","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"e":1,"b":"_5888d6b3163ff","r":"(result == pass)","v":"viewed","p":"5888d6b2b0263"},"5888d6b31c3fc":{"n":"Results","mn":false,"mod":false,"hol":false,"sec":false,"i":false,"m":1,"e":1,"b":"_5888d6b31c4b4","r":"(result == fail)","v":"viewed","p":"5888d6b2b0263"}}});
    // get learner name

};

// Include: javascript/release/build/Elucidat.navigate.js

Elucidat.navigate = function ( page_code ) {
	// get current Elucidat instance
	var c = e.elucidat;
	// if page_code is a reserved word - check it out
	// first last next previous
	if (page_code === 'first')
		page_code = c.page_order[0];

	else if (page_code === 'last')
		page_code = c.page_order[ c.page_order.length - 1 ];

	else if (page_code === 'next' && c.next_page)
		page_code = c.next_page;

	else if (page_code === 'previous' && c.previous_page)
		page_code = c.previous_page;

	//if there is no previous or next page, don't do anything.
	if(page_code === 'previous' || page_code === 'next') {
		return false;
	}

	// otherwise it should be a page code
	// check
	if (page_code) {
		// now get page object
	    var page_request = c.pages[ page_code ];

		//If the page requested is hidden and part of a question pool we should jump to the first available page from that pool.
		//This can happen if there is a last minute question pool shuffle as the user navs to this page.
		var containingPool = c.question_pools._find_page(page_request.page_id);
		if(page_request.hidden && containingPool) {
			var currentPool = c.question_pools._get_pool(containingPool);

			page_request = c.pages[currentPool.pagesToShow[0]];
		}

	    // find the project navigation, and make the correct item active
	    if (page_request && page_request.allowed && page_request.allowed_by_rule && !page_request.hidden) {
	        if (page_request.loaded)
	            c._open_page ( page_request );
	        else
	            c._load_href ( page_request.url );
	    
	        return true;
	    }
    }
    return false;
};


// Include: javascript/release/build/elucidat//_achievement.js

// load a url
Elucidat.prototype._award_achievement_badges = function ( achievement ) {
    if (achievement)
        $('img.achievement_badge.'+achievement).addClass('awarded');
    else
        for (var i = 0; i < this.awarded_achievements.length; i++ )
            $('img.achievement_badge.'+this.awarded_achievements[i]).addClass('awarded');
}
Elucidat.prototype._achievement = function ( achievement ) {
    var $body = $('body');
    $body.addClass( 'achievement-'+achievement );
    $body.trigger('elucidat.achievement', [ achievement ]);
    // add awarded class to any achievement badges
    if ( this.awarded_achievements.indexOf(achievement) == -1)
        this.awarded_achievements.push( achievement );
    // now do the badge
    this._award_achievement_badges( achievement );
}
// Include: javascript/release/build/elucidat//_animate_in.js
// animate in
Elucidat.prototype._animate_in = function ( $new_page, callback ) {

    // first look for any items with the animation classes
    var context = this;
    $new_page.find('[data-animation]').each(function () {
        var $item = $(this);
        var attr = $item.attr('data-animation').split('|');
            //console.log(attr);
        var in_style = ( attr[0] && attr[0] != '-' ? attr[0] : null );
        if (in_style) {
            var duration = ( attr[1] ? attr[1] : 1 )+'s';
            var wait_until_on_screen = false;
            if (new String( attr[2] ).substr(0,1) == '(') {
                attr[2] = parseFloat(attr[2].replace('(','').replace(')',''));
                wait_until_on_screen = true;
            }
            var delay = (( attr[2] ? parseFloat(attr[2]) : 0 )*1000) + (parseFloat(context['animation']['in']['speed'])*1000);// + 1000
            // do we fade out after a while?
            var out_delay = (( attr[5] ? parseFloat(attr[5]) : 0 )*1000);
            var out_style = ( attr[3] && attr[3] != '-' ? attr[3] : null );
            var out_duration = parseFloat( attr[4] && attr[4] != '-' ? attr[4] : 0 ) * 1000;

            // add hide class
            $item.addClass('e-hide');

            var do_animation = function () {
                setTimeout(function () {
                    // don't do if already animating out
                    if (!$item.hasClass('e-animated-out')) {
                        $item.css({
                            '-webkit-animation-duration':   duration,
                            '-moz-animation-duration':      duration,
                            'animation-duration':           duration
                        });
                        $item.addClass( 'e-animated' ).addClass( in_style );
                        $item.removeClass('e-hide');

                        // if out_delay - do out animation
                        if (out_delay && out_style && out_duration) {
                            setTimeout(function () {
                                if (!$item.hasClass('e-animated-out')) {
                                    // element
                                    $item.addClass( 'e-animated-out' );
                                    $item.removeClass( in_style );
                                    $item.css({
                                        '-webkit-animation-duration':   out_duration,
                                        '-moz-animation-duration':      out_duration,
                                        'animation-duration':           out_duration
                                    });
                                    $item.addClass( out_style );
                                    $item.removeClass('e-hide');

                                    setTimeout(function () {
                                        $item.hide();
                                    }, out_duration);
                                }
                            }, out_delay);
                        }

                    }
                }, delay);
            };
            if (wait_until_on_screen)
                $item.wait_until_on_screen({
                    callback: do_animation
                });
            else
                do_animation();
        }
        // add fixer for safari (hardware acceleration)
        // this is a horrible hack - @todo - let's drop this asap
        if ( /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor) ) {
            if ( $item.parent().find('.modal').length == 0) {
                $item.parent().addClass('e-anim-acceleration');
            }
        }
    });
    // add page in speed
    $new_page.addClass( 'e-animated' );
    $new_page.addClass( context['animation']['in']['style'] );
    $new_page.css({
        '-webkit-animation-duration':   context['animation']['in']['speed'],
        '-moz-animation-duration':      context['animation']['in']['speed'],
        'animation-duration':           context['animation']['in']['speed']
    });
    // add animation style
    $new_page.show();

    if (callback)
        setTimeout(callback, parseFloat(context['animation']['in']['speed'])*1000);

    // make sure we are at scroll position 0,0 for the new page
    window.scrollTo(0,0);
    // fix tabs so that first is visible
    $new_page.find('a[data-toggle=tab]').tab_fixer();

};
// Include: javascript/release/build/elucidat//_animate_out.js

// animate in
Elucidat.prototype._animate_out = function ( $old_page, finished_function ) {
    // first look for any items with the animation classes
    var context = this;
    var longest_duration = 0;

    var $animated_elements = $old_page.find('[data-animation]');

    // we need to work out which has the slowest transition
    // our transition starts at t-minus the slowest transition
    $animated_elements.each(function () {
        var $item = $(this);
        var attr = $item.attr('data-animation').split('|');
        var out_style = ( attr[3] && attr[3] != '-' ? attr[3] : null );
        var duration = parseFloat( attr[4] && attr[4] != '-' ? attr[4] : 0 ) * 1000;

        if (out_style && !$item.hasClass('e-animated-out')) {
            if (duration > longest_duration)
                longest_duration = duration;
        }
    });
    
    // now we have them all - go through and set up - with the right delay 
    $animated_elements.each(function () {
    
        var $item = $(this);
        if (!$item.hasClass('e-animated-out')) {
            //mark as animating
            $item.addClass('e-animated-out');
            // and reget attrs
            var attr = $item.attr('data-animation').split('|');
            var in_style = ( attr[0] && attr[0] != '-' ? attr[0] : null );
            var out_style = ( attr[3] && attr[3] != '-' ? attr[3] : null );
            var duration = parseFloat( attr[4] && attr[4] != '-' ? attr[4] : 0 ) * 1000;
            var out_delay = longest_duration - duration;

            // and then trigger
            setTimeout(function () {
                if (!$item.hasClass('e-animated-out')) {
                    // element
                    $item.removeClass( in_style );
                    $item.css({
                        '-webkit-animation-duration':   duration,
                        '-moz-animation-duration':      duration,
                        'animation-duration':           duration
                    });
                    $item.addClass( out_style );
                    $item.removeClass('e-hide');

                    setTimeout(function () {
                        $item.hide();
                    }, duration);
                }
            }, out_delay); // sending parameter to timeout enabled by conditional js in ../header/header.js
        }
    });

    var finalise = function () {
        
        $old_page.removeClass( context['animation']['in']['style'] );
        $old_page.css({
            '-webkit-animation-duration':   context['animation']['out']['speed'],
            '-moz-animation-duration':      context['animation']['out']['speed'],
            'animation-duration':           context['animation']['out']['speed']
        });
        $old_page.addClass( context['animation']['out']['style'] );

        setTimeout( function () {
            //
            $old_page.hide();
            // run finishing function 
            $old_page.each ( finished_function );

        }, parseFloat(context['animation']['out']['speed'])*1000 - 50 ) ;    
    }

    if ($animated_elements.length && longest_duration) {
        setTimeout(finalise, longest_duration);
    } else {
        finalise();
    }

};
// Include: javascript/release/build/elucidat//_fix_links.js

// init navigation
Elucidat.prototype._fix_links = function ( $element ) {
    $element.find('a,button[href]').fix_links( this );

};


// Include: javascript/release/build/elucidat//_handle_dates.js

// now open up a pre-loaded page
Elucidat.prototype._handle_dates = function ( page_id ) {
    
    if(
            !('localisation' in this.options) 
            || (typeof this.options.localisation !== 'object')) // guards
        return false;
        
    var html = this.pages[page_id ].html;
    
    // grab the current date and figure out the various formating we may have
    var date_obj = new Date();
    var format_data = {
        'yyyy': date_obj.getFullYear().toString(),
        'm'   : (date_obj.getMonth() +1).toString(),
        'd'   : date_obj.getDate().toString()
    }
    format_data['yy'] = format_data['yyyy'].substring(2);
    format_data['mm'] = (format_data['m'].length < 2) ? ("0" + format_data['m']) : format_data['m'];
    format_data['dd'] = (format_data['d'].length < 2) ? ("0" + format_data['d']) : format_data['d'];
    
    var get_date = function(format, format_data){
        format = format.toLowerCase();
        format = format.replace('yyyy', format_data.yyyy);
        format = format.replace('yy', format_data.yy);
        format = format.replace('y', format_data.yyyy);
        format = format.replace('mm', format_data.mm);
        format = format.replace('m', format_data.m);
        format = format.replace('dd', format_data.dd);
        format = format.replace('d', format_data.d);
        
        return format;
    }
    // find your run of the mill current_dates
    if(('date' in this.options.localisation) && 'short' in this.options.localisation['date']){
        html = html.replace('{{current_date}}', get_date(this.options.localisation['date']['short'] , format_data));
    }
    
    // find the more specific current_dates
    var result;
    var format;
    do { // we will need to run this regex repeatedly.
        result = /{{(current_date,.[^}]*)}}/.exec(html);
        if (result) {
            // extract the desired format and apply
            format = result[1].substring(result[1].indexOf(',')+1);
            html = html.replace(result[0], get_date(format, format_data));
        }  
    } while (result);
    
    // save the new html back to the pages container
    this.pages[page_id ].html = html;
};

// Include: javascript/release/build/elucidat//_initial_page_state.js
//These functions are used when a course loads to parse the data passed back from the backend after bookmarking.

//Take the history of the page and work out if the page should be marked as completed.
Elucidat.prototype._set_initial_page_completed_state = function ( page, history ) {
    if (!history) {
        page.completed = false;
        return
    }

    //The backend returns an empty [] array instead of an object.
    if (history.parts && history.parts.length === 0) {
        history.parts = {};
    }

    //Experienced is sent when a page is completed so this should be accurate.
    page.completed = history.experienced;

};

//Take the history of the page and try to work out if the page should be marked as viewed.
Elucidat.prototype._set_initial_page_visited_state = function ( page, history ) {
    if(!history) {
        page.visited = false;
        return;
    }
    //The 'experienced' verb means the page is completed. If it's completed, it must have been viewed.
    page.visited = history.experienced;

    //TODO - backend could send back 'visited' as part of the history object - that would be ace.

    //if the page isn't complete (experienced), we can try and figure out if the page has been viewed...
    if(!history.experienced) {
        //The backend returns an empty [] array instead of an object {}, convert it to empty object in that case for consistency.
        if(history.parts && history.parts.length === 0) {
            history.parts = {};
        }
        //If there are parts in the history, this page is almost certainly visited.
        page.visited = $.isEmptyObject(history.parts) ? false : true;
    }

};
// Include: javascript/release/build/elucidat//_lms.js
Elucidat.prototype._save_history_to_lms = function () {
    var context = this;

    var PageHistoryModel = function(page){
        if (page === undefined) {
            page = {};
        }

        this.compress(page);
        return this;
    };


    //Scorm 1.2 has a 4096 character limit for suspend data, hence we use horrible 1 letter keys when storing data.
    //e = experienced, v = visited, p = parts, a = answers, s = score, h = history, c = current, r = registration
    PageHistoryModel.prototype.compress = function(page) {

        //Only send either completed or visited. When we decompress the data we can infer that a completed page must have been visited.
        if(page.completed) {
            this.e = 1;
        } else if(page.visited) {
            this.v = 1;
        }
        if(page.answer.length) {
            this.p = {};

            for(var i=0; i<page.answer.length; i++) {
                var answer = page.answer[i];
                this.p[answer.interaction_id] = {
                    s: answer.score,
                    a: []
                };

                for(var j=0; j<answer.answer.length; j++) {
                    //To compress even more we strip the answer text - this means we do loose some data for in course reports/graphs
                    var answerID = (answer.answer[j] + '').split('[:]')[0];
                    this.p[answer.interaction_id].a.push(answerID);
                }
            }
        }
    };

    var history = {
        'h': {},
        'c': context.current_page ? context.current_page: '',
        'r': context.lrs.endpoints[0] ? context.lrs.endpoints[0].registration: ''
    };
    // go through pages and mark visited ones
    for ( var page_id in context.pages ) {
        if(!context.pages.hasOwnProperty(page_id)) {return;}
        var page = context.pages[ page_id ];
        if(page.visited || page.completed) {
            history.h[page_id] = new PageHistoryModel(page);
        }
    }
    setTimeout(function () {
        context.options.lms.SetSuspendData( JSON.stringify( history ));
    },50);
};
// Include: javascript/release/build/elucidat//_loaders.js

// take json from a loaded url and open the page
Elucidat.prototype._load_json = function ( json_object ) {
    
    // if navigation is not in place, pause until it is
    var context = this;

    if (!this.navigation_loaded) {
        if (this.navigation_attempts < 100) {
            this.navigation_attempts++;
            setTimeout( function () {
                context._load_json( json_object );
            }, 50);
        }
        return false;
    }

    // cache the data for the next request
    if ( this.pages[ json_object.page_id ] == undefined ) {
        return false;
    }
    // reverse the html to deobsfucate it
    this.pages[ json_object.page_id ].html = json_object.lmth.reverse();
    // now config / progress vars
    this.pages[ json_object.page_id ].loaded = true;
    // one control for navigation progress
    this.pages[ json_object.page_id ].allowed = true;
    // and a second one for rules
    this.pages[ json_object.page_id ].allowed_by_rule = true;
    // how the page should complete
    this.pages[ json_object.page_id ].completed_by = json_object.completed_by ? json_object.completed_by : 'viewed';
    //this.pages[ json_object.page_id ].tracking_type = json_object.tracking_type ? json_object.tracking_type : null;
    this.pages[ json_object.page_id ].content_id = json_object.content_id;

    // preview only storage of editable and comment data
    if (json_object.comments)
        this.pages[ json_object.page_id ].comments = json_object.comments;

    // now open the page
    this._open_page ( this.pages[ json_object.page_id ] );
   
};

// load a url
Elucidat.prototype._load_href = function (url) {
    // do not allow two overlapping calls to load pages - the sequence all breaks
    if (this.navigating == 'loading' || this.navigating == 'opening') 
        return false;
    this.navigating = 'loading';

    // IF the url doesn't have an extension - the extension should be js
    // IF the url is .json - it came from the history and needs converting to .js
    url = url.replace('.json','').replace('.js','')+'.js';
    // console.log('_load_href',url);
    //
    if (window.location.protocol == "file:" && xhr2) {
        if (typeof this.options.loader == "object")
            this.options.loader.load('script',url);

    } else {
        $.ajax({
            url: url+'?callback=?',
            dataType: 'jsonp'
        });
    }
};

//When exiting a course send terminate to lms
Elucidat.prototype.unload = function () {
    var c = e.elucidat;
    if (!c.options || !c.options.lms) {
        return undefined;
    }
    // apparently there are some LMS's that are not compliant that need a commit before a terminate but calling commit and terminate in quick succession meant terminate wasn't registering.
    // c.options.lms.Commit();

    c.options.lms.Terminate();

    //iOS does not support beforeunload so use pagehide instead
    var isOnIOS = navigator.userAgent.match(/iPad/i)|| navigator.userAgent.match(/iPhone/i);
    var eventName = isOnIOS ? "pagehide" : "beforeunload";
    //Unbind this event so it isn't called again.
    $(window).off(eventName, e.elucidat.unload);
    // return undefined to ensure this works in Firefox when called from onbeforeunload.
    return undefined;
};

// load a url
Elucidat.prototype.load = function () {
    // load the app
    var c = this;
    // set the passing score in the SCORM interface
    if (c.options.lms) {
        setTimeout(function () {
            c.options.lms.SetScoreThreshold( c.options.global_pass_rate / 100 );
            c.options.lms.SetCompletionThreshold( c.options.global_completion_rate / 100 );
        },50);
        
        // make sure window unloading terminates lms connection
        /*
        window.onbeforeunload = function() {  
            if (c.options.lms.SetExit){
                if(c.progress == 1)
                    // The SCORM runtime reference advises using '' to prompt the LMS to create a new session next time Rounds
                    // We however need the LMS to remember the users registation ID so can track attempts, 'logout' should achive this in most LMSes
                    c.options.lms.SetExit("logout");
                else
                    c.options.lms.SetExit("suspend");
                
            }
            c.options.lms.Commit(); 
            c.options.lms.Terminate();
        };*/
        
        //iOS does not support beforeunload so use unload instead
        var isOnIOS = navigator.userAgent.match(/iPad/i)|| navigator.userAgent.match(/iPhone/i);
		var eventName = isOnIOS ? "pagehide" : "beforeunload";
        //fallback for ie8, check if addeventlistener is available, if not use attachEvent
        $(window).on(eventName, e.elucidat.unload);
    }

    // the true forces the URL to be loaded ( subsequent calls are tested )
    c._load_href( c.options.homepage_url );
    // then do lms attempted call
    c.lrs.queue ({
        'url': c.lrs.activity_id,
        'verb': 'attempted',
        'duration': 0,
        'course_name': this.course_name
    });
};

// Include: javascript/release/build/elucidat//_navigation_init.js

// init navigation
Elucidat.prototype._init_navigation = function ( $element ) {
    if($element) {
        this.$nav_container = $element.find('span#navigation_html').parent();
        $element.find('span#navigation_html').remove();
    } else if(this.$nav_container) {
        this.$nav_container.empty();
    }

    var template, $clone, $set;
    // now for each item, we iterate through 
    for (var page_id in this.pages) {

        // don't make items hidden by question pool
        //console.log(this.pages[ page_id ].name, this.pages[ page_id ].hidden, this.pages[ page_id ].in_menu)
        if (!this.pages[ page_id ].hidden && this.pages[ page_id ].in_menu) {
    
            // take the nav template, and replace in the write variables
            template = this.navigation_template;
            template = template.replace(new RegExp('\{\{page.name\}\}','g'),this.pages[ page_id ].name);
            template = template.replace('{{page.url}}','{{navigation.'+page_id+'.url}}');
            template = template.replace('{{page.active}}','');
            template = template.replace('{{page.is_section}}', (this.pages[ page_id ].is_section ? 'is_section e-is-chapter' : '')); // switching to new name - chapter
            template = template.replace('{{page.sub_pages}}', (this.pages[ page_id ].has_children ? '<ul></ul>' : ''));
            // 
            // create empty set
            $set = $();
            // if this is a submenu
            if (this.pages[ page_id ].parent) {
                // 
                this.pages[ this.pages[ page_id ].parent ].nav_item.each(function () {
                    // make a clone (in case there are several)
                    $clone = $( template );
                    // add it to the jquery set
                    $set = $set.add( $clone );
                    // append to the the ul
                    $(this).find('ul').append( $clone );

                });
            // otherwise top level
            } else {

                this.$nav_container.each(function () {
                    // make a clone (in case there are several)
                    $clone = $( template );
                    // add it to the jquery set
                    $set = $set.add( $clone );
                    // append to main nav
                    $(this).append ( $clone );
                });
            }

            this.pages[ page_id ].nav_item = $set;

            // mark page as completed, if it is
            if ( this.pages[ page_id ].completed )
                this.pages[ page_id ].nav_item.addClass('completed');

        }
    }

    // event handler to say that page is about to change
    $('body').trigger('elucidat.navigation.loaded', [ this.pages, this.$nav_container ]);
    
};
// Include: javascript/release/build/elucidat//_navigation_load.js

Elucidat.prototype._load_navigation = function ( json_object ) {

    var achievement;

    if (json_object.pages) {
        for ( var page_id in json_object.pages ) {
            if(!json_object.pages.hasOwnProperty(page_id)) continue;

            achievement = json_object.pages[ page_id ].a ? json_object.pages[ page_id ].a.replace(/[^a-z0-9]/gi,'') : null;

            this.pages [ page_id ] = { 
                'page_id': page_id, 
                'page_type': json_object.pages[ page_id ].b,
                'nav_item': false,
                'links_to_page': [],
                'loaded': false,
                'hidden': false,
                'name': json_object.pages[ page_id ].n,
                'show_if': json_object.pages[ page_id ].r ? json_object.pages[ page_id ].r : false,
                'url': json_object.url_format.replace('%s',page_id),
                'is_section': json_object.pages[ page_id ].s ? true : false,
                // inverted for smaller file
                'in_menu': json_object.pages[ page_id ].m ? false : true,
                'page_lock': json_object.pages[ page_id ].l ? true : false,
                'auto_progress': json_object.pages[ page_id ].u ? true : false,
                'is_objective': json_object.pages[ page_id ].o ? true : false,
                'has_children': json_object.pages[ page_id ].d ? true : false,
                'parent': json_object.pages[ page_id ].p ? json_object.pages[ page_id ].p : null,
                'children': [],
                'has_score': json_object.pages[ page_id ].c ? true : false,
                'send_score': json_object.pages[ page_id ].e ? true : false,
                'score': null,
                'completed': false,
                'visited': false,
                'completed_by': json_object.pages [page_id ].v ? json_object.pages [page_id ].v : 'viewed',
                'weighting': json_object.pages[ page_id ].w ? json_object.pages[ page_id ].w : 50,
                'achievement': achievement,
                'answers': null,
                'answer': null, // placeholder for learner response
                // this is used to cycle through position - i.e. find next and previous buttons
                'position': this.page_order.length,
                // this displays the count in the page
                'position_label': this.page_order.length,
                'completable_sections' : null
            };

            // child pages - mark against parent
            if (this.pages[ page_id ].parent && this.pages[ this.pages[ page_id ].parent ]) {
                this.pages[ this.pages[ page_id ].parent ].children.push( page_id );

                // if parent is hidden, child is too
                if ( !this.pages[ this.pages[ page_id ].parent ].in_menu )
                    this.pages[ page_id ].in_menu = false;
            }

            json_object.pages[ page_id ].id = page_id;
            this.question_pools._add_page(json_object.pages[ page_id ]);


            // timers
            // this could be made more readable to be helpful
            if (json_object.pages[ page_id ].t)
                this.pages [ page_id ].timers = json_object.pages[ page_id ].t;

            // achievement marking if appropriate
            // and check for scores - scores need dividing by 100

            var pageHistory = this.options.history[page_id];
            var answersFromHistory = [];

            if(typeof pageHistory === 'object') {

                //pageHistory contains multiple objects (each representing a part).
                $.each(pageHistory.parts, function(i, obj) {
                    var answerObj = {
                        answer : obj.answers,
                        interaction_id: i,
                        score: obj.score/100
                    };

                    answersFromHistory.push(answerObj);
                });

            }

            this.pages[ page_id ].answer = answersFromHistory;
            this.pages[ page_id ].answers = this.options.answers[ page_id ] || {};

            // Assuming this is a scored page, set the page score based on individual answer scores.
            if(answersFromHistory.length > 0 && (this.pages [ page_id ].completed_by === 'any-score' || this.pages [ page_id ].completed_by === 'correct-score' )) {
                var score = 0;
                for(var i=0; i<answersFromHistory.length; i++) {
                    if(answersFromHistory[i].score) {
                        score+=answersFromHistory[i].score;
                    }
                }
                if(score === 0) {
                    this.pages [ page_id ].score = 0;
                } else {
                    this.pages [ page_id ].score = (score === answersFromHistory.length) ? 1 : 0.5;
                }

                //correct-score can only be 1 or 0, not 0.5.
                if(this.pages[ page_id ].completed_by === 'correct-score' ) {
                    this.pages[ page_id ].score = this.pages[ page_id ].score === 1 ? 1 : 0;
                }
            }

            // disable links if we are not allowed into the future
            this.page_order.push( page_id );

            // and cache list of achievements
            if (achievement) {
                this.achievements [ achievement ] = page_id;
                // and mark if page is completed
                if (this.options.history.hasOwnProperty( page_id ))
                    this._achievement( achievement );
            }

            this._set_initial_page_completed_state(this.pages[ page_id ], this.options.history[page_id] );
            this._set_initial_page_visited_state(this.pages[ page_id ], this.options.history[page_id] );
        }

        // now mark the question pool pages
        this._shuffle_question_pools();

        // and save template
        this.navigation_template = json_object.template;
        this.navigation_loaded = true;
    }
    
};

// Include: javascript/release/build/elucidat//_page_activation.js

Elucidat.prototype._make_page_active = function ( page_id ) {

    var c  = this;
    // this manages the navigation, and next and previous links
    // find out the next and previous links
    
    // pages that are hidden - need to be ignored and cycled past
    // pages that are not allowed but not hidden are valid, no should be a null

    // if(c.should_shuffle_pools) {
    //     c.should_shuffle_pools = false;
    //     c._shuffle_question_pools(true);
    // }

    // get current page for links
    var current_page = c.pages[ page_id ];
    var current_position = current_page.position;

    // start from next page
    var next_position = current_position + 1;
    // set to null
    c.next_page = null;
    // now loop
    while ( next_position < c.page_order.length ) {
        var nextPage = c.pages[c.page_order[next_position]]
        // go through until we find a page that is not hidden
        if ( !nextPage.hidden ) {
            // the page should be hidden if the section is hidden too
            if ( 
                !nextPage.parent
                || !c.pages[ nextPage.parent ].hidden
            ) {
                c.next_page = ( nextPage.allowed && nextPage.allowed_by_rule ? c.page_order[ next_position ] : false );
                break;
            }
        }
        next_position++;
    }

    // start from next page
    var prev_position = current_position - 1;
    // set to null
    c.previous_page = null;
    // now loop
    while ( prev_position >= 0 ) {
        // go through until we find a page that is not hidden
        if ( !c.pages[ c.page_order[prev_position] ].hidden ) {
            if ( !c.pages[ c.page_order[prev_position] ].parent || !c.pages[ c.pages[ c.page_order[prev_position] ].parent ].hidden ) {
                c.previous_page = ( c.pages[ c.page_order[ prev_position ] ].allowed && c.pages[ c.page_order[ prev_position ] ].allowed_by_rule ? c.page_order[ prev_position ] : false );
                break;
            }
        }
        prev_position--;
    }
    // if next of previous is not allowed - update the classes to show if link is active
    // and update elements that reference this URL
    setTimeout(function () {

        var $next_page_link = $('.e-next-disable,[data-role="pager-next"]');
        var $prev_page_link = $('.e-prev-disable,[data-role="pager-previous"]');
        // the next link might not be to 'next' -- in which case we should 
        // if a next or previous has been made to a particular page - then we need to look up that page
        // otherwise we look for the next page
        var next_page_link = $next_page_link.find('a[data-page-id]').attr('data-page-id');
        var prev_page_link = $prev_page_link.find('a[data-page-id]').data('data-page-id');

        if (prev_page_link && c.pages[ prev_page_link ]) {
            if (c.pages[ prev_page_link ].allowed && c.pages[ prev_page_link ].allowed_by_rule)
                $prev_page_link.removeClass('disabled');
            else
                $prev_page_link.addClass('disabled');
        } else {
            // update based on 'next or previous' link
            if (c.previous_page)
                $prev_page_link.removeClass('disabled');
            else
                $prev_page_link.addClass('disabled');
        }

        if (next_page_link && c.pages[ next_page_link ]) {
            if (c.pages[ next_page_link ].allowed && c.pages[ next_page_link ].allowed_by_rule)
                $next_page_link.removeClass('disabled');
            else
                $next_page_link.addClass('disabled');
        } else {
            // update based on 'next or previous' link
            if (c.next_page)
                $next_page_link.removeClass('disabled');
            else
                $next_page_link.addClass('disabled');
        }
    },50);

    // also the status (how far through the course we are)
    $('output.navigation_current').text( c.pages[ page_id ].position_label );
    $('output.navigation_total').text( c.total_pages );
    var perc_progress = (100 / c.total_pages * c.pages[ page_id ].position_label);
    $('output.navigation_percentage').text( Math.round(perc_progress) + '%' );
    // this drives course progress bars
    $('.navigation_percentage .bar').css( 'width', perc_progress + '%' );

    // finally we need to mark the navigation correctly
    var $current = c.pages[ page_id ].nav_item;
    if ($current.length) {
        this.$nav_container.find('li').removeClass('section_active').removeClass('active');
        // mark current one
        $current.addClass('active');
        $current.each(function () {
            $(this).parent().closest('li').addClass('section_active');
        });
        if (c.pages[ page_id ].is_section)
            $current.addClass('section_active');
    }

    // and timers
    // start the page timer
    //
    var page_limit = null, page_redirect = null;
    // if page has a timer
    if (c.pages[ page_id ].timers && c.pages[ page_id ].timers.p) {
        // time limit
        page_limit = c.pages[ page_id ].timers.p.s;
        // redirect
        if (c.pages[ page_id ].timers.p.r)
            page_redirect = c.pages[ page_id ].timers.p.r;
    }
    // start page timer
    c.timer.page_start ( page_id, page_limit, page_redirect );

    // start the chapter timer
    if (c.pages[ page_id ].is_section || c.pages[ page_id ].parent) {
        //
        var chapter_limit = null, chapter_redirect = null;
        var section_id = c.pages[ page_id ].is_section ? page_id : c.pages[ page_id ].parent;
        // if page has a timers
        if (c.pages[ section_id ].timers && c.pages[ section_id ].timers.c) {
            // time limit
            chapter_limit = c.pages[ section_id ].timers.c.s;
            // redirect
            if (c.pages[ section_id ].timers.c.r)
                chapter_redirect = c.pages[ section_id ].timers.c.r;
        }
        c.timer.chapter_start ( section_id, chapter_limit, chapter_redirect );
    }
};
// Include: javascript/release/build/elucidat//_page_complete.js

// load a url
Elucidat.prototype._complete_page = function ( current_page ) {

    var context = this;
    // 
    this.pages[ current_page ].completed = true;
    // get progress
    this._get_progress();
    // and send to LMS
    if (!this.sent_termination) {
        setTimeout(function () {
            context.options.lms.SetProgress ( context.progress );
            if (context.options.lms.SetSessionTime)
                context.options.lms.SetSessionTime ( context.timer.session_time );
        },50);
    }

    // if this is a milestone, add an anchievement class to the body and trigger an event
    if (this.pages[ current_page ].achievement){
        this._achievement( this.pages[ current_page ].achievement );
    }

    // Any answers supplied by the page come in the answers array
    // IF there is only one answer, then the page is thought of as the question
    // IF more than one, we complete (and score the page, and then send separate statements for each interaction on the page)
    // repackage the data for the xapi statement
    var xapi_data = {
        'url': this.lrs.activity_id,
        'verb': 'experienced', //this.pages[ current_page ].has_score || this.pages[ current_page ].answer ? 'answered' :
        'course_name': this.course_name,
        'page_name': this.pages[ current_page ].name,
        'page_url': current_page // this.lrs.activity_id'j+'/'+
    };

    // if answers - queue the experienced verb for the page - unless the page is completed by "viewed".
    // (if the page is completed by viewed, experienced will have been sent as soon as the learner landed on the page.)
    if (this.pages[ current_page ].answer.length && this.pages[current_page].completed_by !== "viewed") {
        context.lrs.queue ($.extend({},xapi_data));
    }

    // and send to Elucidat (score corrected to be out of 100)
    if ( this.pages[ current_page ].has_score) {
        xapi_data.verb = 'answered';
        if (this.pages[ current_page ].score !== null) {
            xapi_data.score = this.pages[ current_page ].score * 100;
        }
    }

    // put the answer stats into the page, if there are answers to be had
    if (this.pages[ current_page ].answer.length) {
        // if many answers - queue the experienced verb for the page - unless the page is completed by "viewed".
        // (if the page is completed by viewed, experienced will have been sent as soon as the learner landed on the page.)
        if (this.pages[ current_page ].answer.length > 1 && this.pages[current_page].completed_by !== "viewed") {
            context.lrs.queue (xapi_data);
        }

        for (var i = 0; i < this.pages[ current_page ].answer.length; i++ ) {
            var currentAnswer = this.pages[ current_page ].answer[i];
            var data_dup = jQuery.extend({}, xapi_data); 
            data_dup.verb = 'answered';
            var props = ['answer','choices','interaction_type','l','page_name','scale','source','target'];
            for (var p in props) {
                if (currentAnswer[ props[p] ]){
                    data_dup[ props[p] ] = currentAnswer[ props[p] ];
                }
            }
            if($.isArray(data_dup.answer)) {
                data_dup.answer = data_dup.answer.join('[,]');
            }
            // score needs to be scaled
            if (currentAnswer.score !== null) {
                data_dup.score = currentAnswer.score * 100;
            }
            // and add to the page id
            if (this.pages[ current_page ].answer.length && currentAnswer.interaction_id) {

                data_dup.page_url += '/'+currentAnswer.interaction_id;
            }

            var callback_function = function ( interaction_id ) {
                return function(data) {
                    if (!data.answers || !interaction_id) return;

                    context.pages[ current_page ].answers[interaction_id] = data.answers;
                };

            }(currentAnswer.interaction_id);

            // queue to LRS
            context.lrs.queue (data_dup, callback_function );
        }

    }
    //JB - I can't see why this exists. I'm leaving it here, commented out in case there is some bug in the future tracked down to this part of the code.
    //The verb 'experienced' is already sent when a page is loaded - sending it again here will cause duplicate page views in the analytics section.
    else {
        context.lrs.queue (xapi_data);
    }


    // now queue to the xapi
    if (this.pages[ current_page ].has_score) {
        // if this is a page with a score...        
        // if the page has a parent that is an objective
        var current_page_obj = context.pages[current_page];
        var parent_code = current_page_obj.parent;
        var parent_object = context.pages[ parent_code ];
        var page_answer = [];

        if (current_page_obj.answer ) {
            // record answer
            // split into parts
            for(var i=0; i<current_page_obj.answer.length; i++) {

                var answer_obj = current_page_obj.answer[i].answer;
                var page_answer_type = current_page_obj.answer[i].interaction_type;
                var page_answer_pattern = context.pages[ current_page ].answer[0].correct_responses_pattern;


                // if there are choices, then we'll record real answer as well as score
                var page_choices = current_page_obj.answer[i].choices ? current_page_obj.answer[i].choices : current_page_obj.answer[i].scale;
                if (page_choices) {
                    for (var c = 0; c < page_choices.length; c++) {
                        for (var a = 0; a < answer_obj.length; a++) {
                            if (page_choices[c].id == answer_obj[a]) {
                                answer_obj[a] += '[:]'+page_choices[c].description['en-US'];
                            }
                        }
                    }
                }
                page_answer.push(answer_obj.join('[,]'));
            }
            // now join back
            page_answer.join('[,]');
        }

        if ( parent_code && parent_object.is_objective && context.options.lms.SetInteraction) {
            
            setTimeout(function () {
                // create objective if not created already
                // if the parent is a section AND an objective (we initialise the objective)
                // find all of the scored children of the objective
                var obj_possible_score = 0;
                var obj_achieved_score = 0;
                var obj_children = parent_object.children;

                for (var i = 0; i < obj_children.length; i++) {
                    var child = context.pages[ obj_children[i] ];
                    if (child.has_score) {
                        //console.log(obj_children[i]);
                        var weighting = child.weighting;
                        obj_possible_score += weighting;
                        obj_achieved_score += weighting * child.score;
                    }
                }
                context.options.lms.SetObjective ( parent_code, 'completed', obj_achieved_score, 0, obj_possible_score, parent_object.name );
                // Just passing page_answer[0] for now - we need to refactor
                // how multiple questions on the same page are sent to the LMS
                context.options.lms.SetInteraction ( current_page, parent_code, (current_page_obj.score?'passed':'failed'), page_answer[0], current_page_obj.name, page_answer_type, page_answer_pattern);
            },50);

        } else {

            // send LMS objective if we are a scoring page
            setTimeout(function () {
                var weighting = current_page_obj.weighting;
                context.options.lms.SetObjective ( current_page, 'completed', current_page_obj.score * weighting, 0, weighting, current_page_obj.name );

                if (context.options.lms.SetInteraction) {
                    // Just passing page_answer[0] for now - we need to refactor
                    // how multiple questions on the same page are sent to the LMS
                    context.options.lms.SetInteraction ( current_page, current_page, (current_page_obj.score?'passed':'failed'), page_answer[0], current_page_obj.name, page_answer_type, page_answer_pattern );
                }
            },50);

        }       
    }

    // save history to lms, if in offline mode
    if (this.options.mode == 'offline')
        setTimeout(function () {
            context._save_history_to_lms();
        }, 100);

    // and add a class to the body
    var $body = $('body');
    $body.addClass('page_completed');
    $body.trigger('elucidat.page.complete', [ context.pages[ current_page ], $body.find('#paw') ]);


    return true;
};

// Include: javascript/release/build/elucidat//_page_completion_listener.js



// load a url
Elucidat.prototype._page_setup_completed_listener = function ( current_page ) {

    // aliases
    var context = this;
    var $page_wrapper = $('div#paw');
    var current_page_id = current_page.page_id;

    // record current page (even if not complete)
    context._set_current_page( current_page_id );

    //If there are no scored or viewable sections this wont have been initialised yet.
    if(current_page.completable_sections === null) {
        current_page.completable_sections = { scored:[], viewed:[] };
    }

    // if completed by opening, and there are no trackable elements
    if ( current_page.completed_by === 'viewed' && (!current_page.completable_sections.scored.length && !current_page.completable_sections.viewed.length)) {
        // page is completed by opening the page - if we have got through this far
        $page_wrapper.off('page_complete');
        // do the completion
        context._complete_page( current_page_id );
        // and stop
        return;
    } else if (current_page.completed_by === 'viewed') {
        // In this case the page is completed by viewing it but we still want to bind an event to capture any answers
        // given by the learner in case they are required for page rule checks later.
        context._complete_page( current_page_id);
    }

    setTimeout(function () {
 


        // now set up listeners
        var completion_sent_already = false;
        // listen out for completions from all of the scorable sections
        // and all viewable sections

        // otherwise we need a completion listener
        $page_wrapper.off('page_complete').on('page_complete', function (e, result) {
            // record for scoring
            // record for scoring

            // record for scoring
            if (result && (result.answers || result.outcome)) {
                // record for scoring
                // if !this.options.allow_retakes only first score is recorded
                if ( context.pages[ current_page_id ].score == null || context.options.allow_retakes || current_page.completed_by == 'correct-score' ) {

                    // IF there is a score already, and this replaces it - we need to flag it - as the result will need to be resent
                    if ( context.sent_result )
                        context.has_retaken_questions = true;

                    // otherwise calculate score
                    if (result.outcome) {
                        if (result.outcome == 'correct')
                            context.pages[ current_page_id ].score = 1;
                        else if (current_page.completed_by !== 'correct-score' && context.options.score_partially_correct && result.outcome && result.outcome == 'partially-correct')
                            context.pages[ current_page_id ].score = 0.5;
                        else
                            context.pages[ current_page_id ].score = 0;
                    } else {
                        if (isNumber(result.score))
                            context.pages[ current_page_id ].score = parseFloat(result.score).between(0,1);

                    }
                    // store interaction type, choices, 
                    if (result.answers)
                        context.pages[ current_page_id ].answer = result.answers;
                }

                // then work out if page has been completed
                if (current_page.completed_by == 'correct-score') {
                    if (result.outcome && result.outcome == 'correct') {
                        context._complete_page( current_page_id );
                    }
                    // redo navigation rules (as we are allowed to progress now)
                    context._manage_progress();
                } else {
                    // page is completed by any score
                    context._complete_page( current_page_id );
                    // redo navigation rules (as we are allowed to progress now)
                    context._manage_progress();
                }

            // send completion event for normal pages
            } else if (!completion_sent_already) {
                completion_sent_already = true;
                context._complete_page( current_page_id );
                // redo navigation rules (as we are allowed to progress now)
                context._manage_progress();
            }
            
            // if we auto progress - skip to next page
            if (current_page.auto_progress)
                Elucidat.navigate('next');
                
            e.stopPropagation();
        });

        // page is completed by opening ALL PARTS of the page
        var answers = context.pages[current_page_id].answer || [];

        $('div#pew').off('section_complete answered').on('section_complete answered', function (e, result) {
            var all_complete = true;
            var all_scored = true;
            // if current_page.completed_by == 'viewed-all' - we just need all sections completed -
            // mark this one as complete
            for (var i=0;i<current_page.completable_sections.viewed.length;i++) {
                if (e.type == 'section_complete' && current_page.completable_sections.viewed[i].target === e.target)
                    current_page.completable_sections.viewed[i].completed = true;
                // if not complete - mark as such
                else if (current_page.completable_sections.viewed[i].completed == false)
                    all_complete = false;
            }
            // answered
            for (var i=0;i<current_page.completable_sections.scored.length;i++) {
                if (e.type == 'answered' && current_page.completable_sections.scored[i].target_id === e.target.id) {
                    current_page.completable_sections.scored[i].completed = true;
                    if (result.outcome) {
                        // also record the score for the interaction
                        if (result.outcome == 'correct')
                            result.score = 1;
                        else if (context.options.score_partially_correct && result.outcome && result.outcome == 'partially-correct')
                            result.score = 0.5;
                        else
                            result.score = 0;
                    } else {
                        if (isNumber(result.score))
                            result.score = parseFloat(result.score).between(0,1);
                    }
                    // and make sure the id of the item is in
                    if ($(e.target).attr('id'))
                        result.interaction_id = $(e.target).attr('id').replace(/(pa|pr)_[a-z0-9]+_/i,'');

                    //Special Case: Likerts and multi-response questions need to keep the little bit after the part code
                    // because they can have multiple questions within the same part.
                    //Multi-repsonse are only detectable because they are in a TR. Gross.
                    if(result.interaction_id && result.interaction_type !== 'likert' && $(e.target).prop('tagName') !== 'TR') {
                        result.interaction_id = result.interaction_id.replace(/-(.*)/g,'');
                    }

                    if(result.interaction_id) {
                        //Check if this specific question has already been answered and remove any previous answer.
                        for (var j = answers.length - 1; j >= 0; j--) {
                            var loopedAnswer = answers[j];

                            if (loopedAnswer.interaction_id === result.interaction_id) {
                                answers.splice(j, 1);
                            }
                        }
                    } else {
                        //if there is no interaction_id (e.g. the question is in a form without an id) then there cant possibly be multiple
                        //questions on the page and we can just empty the array rather than trying to maintain a list of answers.
                        answers = [];
                    }
                    // and store answer
                    answers.push(result);

                // if not complete - mark as such
                } else if (current_page.completable_sections.scored[i].completed === false) {
                    all_complete = all_scored = false;
                }
            }
            
            var response = {};
            if (answers.length)
                response.answers = answers;

            //When there are multiple answers being submitted at the same time, don't mark the page as complete after each one,
            //only the last one will have dont_send_complete as false.
            if(result) {
                if(result.dont_send_complete) {
                    //now we have checked dont_send_complete, remove it so it's not sent to back end.
                    result.dont_send_complete = undefined;
                    e.stopPropagation();
                    return;
                }
                result.dont_send_complete = undefined;
            }

            if(current_page.completed_by === 'viewed') {

                $page_wrapper.trigger('page_complete', response);

            } else if (current_page.completed_by == 'viewed-all' && all_complete) {

                $page_wrapper.trigger('page_complete', response);

            } else if ((current_page.completed_by == 'any-score' || current_page.completed_by == 'correct-score') && all_scored) {
                //var answers = [];
                var has_outcome = false;
                var all_correct = true;
                var all_incorrect = true;
                var scores = [];
                // now we need to go through, and aggregate results from multiple
                for (var i=0;i<answers.length;i++) {
                    if (answers[i].outcome) {
                        has_outcome = true;
                        if (answers[i].outcome != 'correct')
                            all_correct = false;
                        if (answers[i].outcome != 'wrong')
                            all_incorrect = false;
                        
                    } else if (isNumber(answers[i].score)) {
                        scores.push(answers[i].score);
                    }
                    // answers.push(current_page.completable_sections.scored[i].result);
                }
                if (has_outcome) {
                    // overall completion
                    response.outcome = 'partially-correct';
                    if (all_correct)
                        response.outcome = 'correct';
                    else if (all_incorrect)
                        response.outcome = 'wrong';

                } else if (scores.length) {
                    // if there are scores - 
                    response.score = scores.average();

                }

                // now send completion
                $page_wrapper.trigger('page_complete', response);
            }

            e.stopPropagation();

        });

    }, 5);

};

// Include: javascript/release/build/elucidat//_page_open.js

// now open up a pre-loaded page
Elucidat.prototype._open_page = function ( page_object ) {

    // do not allow two overlapping calls to load pages - the sequence all breaks
    if (this.navigating == 'opening')
        return false;
    this.navigating = 'opening';

    // if navigation is not in place, pause until it is
    var context = this;

    // tell the app everything is going swimmingly
    if (typeof this.options.loader == "object")
        if (this.options.loader.success)
            this.options.loader.success();

    // mark this page as current
    // now trigger google analytics page log - should have enough information to identify source
    ga('send', 'pageview', page_object.content_id );
    // gac is the custom code for this account
    if (gac.length) ga('c.send', 'pageview', page_object.content_id );
    // and log the page load to the LMS
    setTimeout(function () {
        context.options.lms.SetLocation( page_object.page_id );
    },50);
    // the json_id of the page contains several different numbers - the last one is the page id and should be marked as the current page
    context.current_page = page_object.page_id;
    // mark page as visited
    this.pages[page_object.page_id ].visited = true;

    // swap out any dates that are still in the HTML
    this._handle_dates(page_object.page_id);

    var $body = $('body');
    // event handler to say that page is about to change
    $body.trigger('elucidat.page.change', page_object);

    var $pew = $body.find('#pew');

    // create a new dom object
    var $new_element = $('<div />');

    $new_element.html(page_object.html);

    // clear out any templates that have made it this far
    $new_element.find('.add-option-template').remove();

    // pages can contain all sorts of elements that can 'complete' a page
    // they all need to be 'completed' for the page to be complete
    var $paw = $new_element.find('#paw');


    // initialise the completable_sections object if it's not been done yet.
    if(page_object.completable_sections === null) {
        page_object.completable_sections = {scored: [], viewed: []};
    }

    //If we haven't yet registered any scored completable sections, set up a listener. If we've already got data in this
    //array then we don't re-create it so that scored sections are maintained across page navigation within the course.
    if(!page_object.completable_sections.scored.length) {
        $paw.off('scorable_section').on('scorable_section', function (e) {
            //Each time a scored section is encountered, store a reference to it here.
            page_object.completable_sections.scored.push({target_id: e.target.id, completed: false});
            e.stopPropagation();
        });
    }

    //Unlinke scored sections, viewed section completion is not persistent across page navigation so each time the page is opened, reset this array.
    page_object.completable_sections.viewed = [];
    $paw.off('completable_section').on('completable_section', function(e) {
        //if the page is completed, all the sections in it are marked as completed.
        page_object.completable_sections.viewed.push({target: e.target, completed: page_object.completed});
        e.stopPropagation();
    });

    // and set up questionnaires
    $paw.find('.answer, .question td').questionnaire_answer({previous_answer: page_object.answer});
    $paw.find('.e-blank-to-fill').fill_blank_answer({previous_answer: page_object.answer});
    $paw.find('form.drag_drop').drag_drop_form({previous_answer: page_object.answer});
    $paw.find('form.sortable').sortable_form({previous_answer: page_object.answer});
    $paw.find('div.e-slider').input_slider();
    $paw.find('form.likert,form.poll').likert_form();
    //$paw.find('form.poll').polling_form();
    $paw.find('form.questionnaire_multiple_response,form.multiple_response').multiple_response();
    $paw.find('form.fill_blanks').fill_blanks();
    $paw.find('form.questionnaire').questionnaire_form();
    $paw.find('.score_summary').score_summary();

    // video is handled below too

    $new_element.find('input.learner_input,textarea.learner_input').learner_input( this.options.inputs ).on('elucidat.learner.input', function (e, input_name, input_value) {
        // send to the LRS - only once every 2 seconds -
        clearTimeout(this.commenting_in_progress);
        this.commenting_in_progress = setTimeout(function () {
            context.lrs.queue ({
                'url': context.lrs.activity_id,
                'verb': 'commented',
                //'name': 'Name of the course',
                'page_url': input_name,
                'answer': input_value
            });
        },2000);
    });
    $new_element.find('span.learner_input').learner_output();
    // ensure that each carousel has a selected item
    $new_element.find('[data-slide], [data-slide-to]').fix_carousel_slides( $new_element );
    // insert learner name if applicable
    // LRS only has a learner name in very specific mode - so that is trusted over the LMS (which is always present)
    var $learner_names = $new_element.find('span.learner_name');
    if ($learner_names.length) {
        if (this.lrs && this.lrs.learner_name !== null)
            $learner_names.text(this.lrs.learner_name);
        else if (this.options.lms && context.options.lms.GetLearnerName) {
            setTimeout(function () {
                if (context.options.lms.learner_name === undefined)
                    context.options.lms.learner_name = context.options.lms.GetLearnerName();
                //context.options.lms.learner_name = context.options.lms.GetLearnerName();
                $learner_names.text(context.options.lms.learner_name);
            },1);
        }
    }

    // now access fixes
    // hotspots and other items must have link titles (which cannot be set through the GUI) // not in IE7 though
    //console.log('@todo FIX TITLES restore')
    if (!$('html').hasClass('ie7'))
        $new_element.find( '[data-toggle],[data-slide]' ).fix_titles( $new_element );
        
    // and bring in new page
    // this is if there is no page loaded already
    if (!$pew.length) {
        // console.log(context.pages);
        // first run - add the html into the body
        $new_element.hide();
        $body.prepend( $new_element );
        
        // mark element containing paw
        $paw.contains_paw();

        // now initialise the navigation
        this._init_navigation( $new_element );

        // aria live
        $pew = $body.find('#pew').attr('aria-live','polite');

        // set up swipe events
        $pew.gestures();

        // event handler to say that page is about to change
        $body.trigger('elucidat.page.open', [ page_object, $new_element ]);

        // we need to get the animation settings off the body (if there are any)
        // it will be stored in $new_element.find('#__body__moved') - see backend docs to understand why
        var $anim_source = $new_element.find('#__body__moved');
        // update body classes
        $body.body_class({
            class_src: $anim_source
        });
        
        // and set up the page animation
        if ($anim_source.length && $anim_source.attr('data-animation')) {
            var anim_attrs = $anim_source.attr('data-animation').split('|');
            if (anim_attrs[0] && anim_attrs[0] != '-') this['animation']['in']['style'] = anim_attrs[0];
            if (anim_attrs[1]) this['animation']['in']['speed'] = anim_attrs[1] + 's';
            if (anim_attrs[3] && anim_attrs[3] != '-') this['animation']['out']['style'] = anim_attrs[3];
            if (anim_attrs[4]) this['animation']['out']['speed'] = anim_attrs[4] + 's';
        }

        // Wait for animation to start displaying page so elements have height.
        setTimeout(function() {
            $pew.calc_fixed_header_size(true);
        },50);

        // A strange quirk of _manage_progress is that it must be run twice to work (it's a big loop and the first time
        // through it sets some variables which it later relies on... so we ensure it's run here if it's never been run before).
        if(!context.options.has_manage_progress_run) {
            context._manage_progress();
        }

        // bring in the content, with enough time for the page to have been loaded
        setTimeout(function () {
            $new_element.hide().fadeIn(500);

            var $paw = $new_element.find('div#paw');
            context._animate_in( $paw.parent().hide(), function () {
                $body.accessibility_fixes();
                $body.trigger('elucidat.page.ready', [ page_object, $new_element ]);
            });

            $pew.calc_fixed_header_size(true);

            // and videos
            $new_element.find('div.video_player').video();
            $new_element.find('div.audio_player').audio();

            // and completions
            $paw.find('div.carousel').carousel_complete();
            $paw.find('div.modal').modal_complete();
            $paw.find('div.collapse, [data-toggle=collapse-next], [data-toggle=collapse]').collapse_complete();
            $paw.find('div.tab-pane').tabs_complete();

            // tooltips
            $new_element.find('a[data-toggle="tooltip"]').tooltip_extended();

            // body height fix
            $pew.find('div.body_height').body_height();

            // timers
            context.timer.register( $new_element.find('.session_time,.page_time,.page_time_remaining,.chapter_time,.chapter_time_remaining') );

            // charts
            $new_element.find('div.chart,span.chart,span.chart_result').charts( context );

            // badges
            context._award_achievement_badges();

            // now focus on the anchor to tell JAWS that the page has changed
            var $load_anchor = $('<a id="load_anchor" name="load_anchor" tabIndex="-1" title="Top of page" />');//++'
            $pew.prepend($load_anchor);
            $load_anchor.focus();

            // mark as completed if completed_by is viewed or create custom handlers
            context._page_setup_completed_listener( page_object );

            context._manage_progress();
            // take over all links so that they link back into the same function
            context._fix_links( $new_element );
            for (var i=0; i<context.page_order.length;i++) {
                var loopedPage = context.pages[context.page_order[i]];
                context._set_link_visibility(loopedPage);
            }

            ie8bg.updateElems().getElems().ie8poly_bg_size();

            // allow navigation again
            context.navigating = 'ready';

        },500);

    // this is the loader if there is a page loaded already and we need a fade In / Out
    } else {

        // get reference to old page
        var $old_page_wrapper = $('div#paw');
        // now we suspend aria change announcements
        $pew.attr('aria-busy','true');

        // otherwise we are going to swap in and out the page content only
        context._animate_out($old_page_wrapper.parent(), function () {
            // update body classes
            $body.body_class({
                class_src: $new_element.find('#__body__moved')
            });
            
            // find the page content from the new element
            var $this = $(this);

            var $new_page = $new_element.find('div#paw').parent();

            var $placeholder = $('<div />');
            $this.after( $placeholder );

            // destroy any videos
            $pew.find('div.video_player').video_destroy();
            $pew.find('div.audio_player').audio_destroy();
            // remove full screen class from html
            $('html').removeClass('mejs-fullscreen');

            // destroy tooltips
            $pew.find('a[data-toggle="tooltip"]').tooltip_extended('destroy');

            // and any modals that are still on their way out
            $("#pew div:first > div.modal_wrapper > div").modal_destroy();

            // and ditch page
            $this.remove();

            // find any element with data-role="page.something and replace it in the document
            $pew.find('[data-role^="page."]').each(function () {
                var $this = $(this);
                // only switch if nodeName and class match
                var selector = $this.get(0).nodeName;
                if ($this.attr('class')) {
                    var classes = $this.attr('class').split(' ');
                    for (var c = 0; c < classes.length; c++)
                        if (classes[c].substring(0,2) !== 'e-' && classes[c] !== 'visited' && classes[c] !== 'shown' && classes[c] !== 'completed')
                            selector += '.'+classes[c];
                }

                selector += '[data-role="'+$(this).attr('data-role')+'"]';
                //console.log(selector);

                $(this).replaceWith( $new_element.find(selector) );
            });

            // now copy in the new page
            // there must be a better way of doing this
            $placeholder.after( $new_page.hide() );
            $placeholder.remove();

            // turn gestures back on in case they have been killed (by Brightcove for instance)
            $pew.gestures("enable");



            // event handler to say that page is about to change
            $body.trigger('elucidat.page.open', [ page_object, $new_page ]);

            // now animate
            context._animate_in( $new_page, function () {
                $body.accessibility_fixes();
                $body.trigger('elucidat.page.ready', [ page_object, $new_page ]);
            });

            $pew.calc_fixed_header_size(true);

            // videos
            $pew.find('div.video_player').attr('aria-busy', 'true');
            $pew.find('div.video_player').video();
            $pew.find('div.audio_player').audio();

            // and completions
            $new_page.find('div.carousel').carousel_complete();
            $new_page.find('div.modal').modal_complete();
            $new_page.find('div.collapse, [data-toggle=collapse-next], [data-toggle=collapse]').collapse_complete();
            $new_page.find('div.tab-pane').tabs_complete();

            // tooltips
            $new_page.find('a[data-toggle="tooltip"]').tooltip_extended();

            // body height fix
            $pew.find('div.body_height').body_height();

            // timers
            context.timer.register( $pew.find('.session_time,.page_time,.page_time_remaining,.chapter_time,.chapter_time_remaining') );

            // charts
            if (!$('html').hasClass('ie-lt9'))
                $pew.find('div.chart,span.chart,span.chart_result').charts( context );

            // badges
            context._award_achievement_badges();

            // mark as completed if completed_by is viewed or create custom handlers
            context._page_setup_completed_listener( page_object );
            context._manage_progress();

            // take over all links so that they link back into the same function
            context._fix_links( $pew );

            ie8bg.updateElems().getElems().ie8poly_bg_size();


            // allow navigation again
            context.navigating = 'ready';

            // now focus on the anchor to tell JAWS that the page has changed
            $pew.attr('aria-busy', 'false');
            // move focus
            $('#load_anchor').focus();

        });
    }

};

// Include: javascript/release/build/elucidat//_progress_get.js
// load a url
Elucidat.prototype._get_progress = function () {
    var num_completed = 0,num_pages = 0;
    for ( var i in this.pages ) {
        if (this.pages[i].completed)
            num_completed++;
        num_pages++;
    }
    return this.progress = 1 / num_pages * num_completed;
};
// Include: javascript/release/build/elucidat//_progress_manage.js



// load a url
Elucidat.prototype._manage_progress = function () {
    
    var c = this;

    // find out if we are allowed to view a particular page
    // and calculate running scores
    var global_pass = new Elucidat_Milestone ( c.options.global_pass_rate );
    var current = false;
    var last_page_is_completed = false;
    var page_lock_active = false;
    var all_questions_answered = true;
    //Set init to true if this is the first time this function has been called.
    var init = !c.options.has_manage_progress_run;
    c.options.has_manage_progress_run = true;

    //var last_milestone = null;
    // here we will go through the nav, working out if each item is allowed not
    
    // global pass rate needs some extra variables for progress passing
    global_pass.completion_rate = parseInt(c.options.global_completion_rate);
    global_pass.progress_possible = 0;
    var none_scored = true;

    for (var i=0; i<c.page_order.length;i++) {
        var loopedPage = c.pages[ c.page_order[i] ];
        // if a page is hidden, it is disregarded from progress, and scoring
        if (!loopedPage.hidden) {
            
            // we also skip if the parent is hidden
            if ( !loopedPage.parent || !c.pages[ loopedPage.parent ].hidden ) {

                // topic completion 
                // if this page is part of a chapter, we need it here
                var chapter = null;
                // set up a new milestone
                if (loopedPage.is_section) {
                    // console.log( '///\\///\\//\\//' );
                    // console.log( loopedPage.children );
                    // create a milestone for the section
                    chapter = loopedPage.chapter = new Elucidat_Milestone ( c.options.global_pass_rate );
                    chapter.progress_possible = 0;

                } else if (loopedPage.parent && c.pages[ loopedPage.parent ].chapter)
                    chapter = c.pages[ loopedPage.parent ].chapter;


                // reset page lock if we are in a new chapter
                if ( loopedPage.is_section )
                    page_lock_active = false;

                // if page lock is active
                if ( page_lock_active )
                    loopedPage.allowed = false;

                // if page is completed, and !config.allow_completed_pages = NO
                else if ( !c.options.allow_completed_pages && loopedPage.completed)
                    loopedPage.allowed = false;

                // if page is after current one (and current one completed) and !config.allow_future_pages = NO
                else if ( ( i > current && !last_page_is_completed) && !c.options.allow_future_pages)
                    loopedPage.allowed = false;

                // otherwise ok
                else 
                    loopedPage.allowed = true;

                // put page lock on if page has a lock and is not completed
                if ( loopedPage.page_lock && !loopedPage.completed )
                    page_lock_active = true;

                // mark as passed_current
                if ( c.page_order[i] == c.current_page )
                    current = i;

                // record the completion for the next iteration
                if (loopedPage.completed)
                    last_page_is_completed = true;
                else
                    last_page_is_completed = false;

                /* otherwise we also calculate the global score */
                // record that the page is possible
                global_pass.progress_possible++;
                // now chapter
                if (chapter)
                    chapter.progress_possible++;

                // pass fail based on completion
                if (loopedPage.completed) {
                    global_pass.progress++;
                    // now chapter
                    if (chapter)
                        chapter.progress++;
                }
                
                // if this has a score, then mark it too.
                if (isNumber(loopedPage.score)) {
                    none_scored = false;
                    global_pass.addScore( loopedPage.score, 1, loopedPage.weighting );
                    // now chapter
                    if (chapter)
                        chapter.addScore( loopedPage.score, 1, loopedPage.weighting );

                } else if (loopedPage.has_score) {
                    none_scored = false;
                    global_pass.addScore( 0, 1, loopedPage.weighting );
                    // now chapter
                    if (chapter)
                        chapter.addScore( 0, 1, loopedPage.weighting );
                    // mark to show that 
                    all_questions_answered = false;
                }


            }
        }
    }
    
    // is the current page a milestone
    // with an unsubmitted result
    // then send to the LMS!
        // not implemented yet!

    var score_result = global_pass.getScoreResult();
    var score = parseInt(global_pass.getScore());
    var completion_result = global_pass.getProgressResult();
    var progress = parseInt(global_pass.getProgress());


    // finally print out the global scores
    if(!init) {
        console.log('//\n//\n// Overall Result: Progress: '+progress+'%'+(completion_result?' (Completed)':'')+', Score: '+score+'%'+(score_result?' (Passed)':'')+'\n//');
    }

    var currentChapter = null;
    if(c.pages[c.current_page].parent) {
        currentChapter = c.pages[c.pages[c.current_page].parent].chapter;
    } else if(c.pages[c.current_page].chapter) {
        currentChapter = c.pages[c.current_page].chapter;
    }
    if(currentChapter) {
        $('span.total_chapter_score').html( currentChapter.getScore() + '%' );
        $('span.total_chapter_score_raw').html( currentChapter.score );
    }
    // and replace them in the DOM
    $('span.total_score').html( score+'%' );
    $('span.total_score_raw').html( global_pass.score );
    $('span.total_result').html( (score_result?'Pass':'Fail') );

    // and trigger event for external javascript
    $('body').trigger('elucidat.progress', [ progress, global_pass.score, score ]);

    // now we have the final score, we go through the navigation and hide any items that have rules that are not passed
    // this might need delaying so that things aren't slowed down
    // keep a count of how many pages we are, and the position of each item (according to the rules)
    c.total_pages = 0;
    // now go through
    for (var p=0; p<c.page_order.length;p++) {
        var loopedPage = c.pages[c.page_order[p]];
        if (loopedPage.show_if) {
            if (global_pass.evaluateStatement(loopedPage.show_if, c.pages)) {
                // mark as allowed / not
                loopedPage.allowed_by_rule = true;
                // show item and mark as not hidden
                if (loopedPage.hidden) {
                    // page is just being turned on by the rule, and so should be allowed
                    loopedPage.allowed = true;
                    loopedPage.hidden = false;

                    if (loopedPage.nav_item && loopedPage.nav_item.length)
                        loopedPage.nav_item.show();
                }
                // increment total and position
                c.total_pages++;
                loopedPage.position_label = c.total_pages;

            } else {
                // show item and mark as hidden
                loopedPage.hidden = true;
                loopedPage.allowed_by_rule = false;

                if (loopedPage.nav_item && loopedPage.nav_item.length)
                    loopedPage.nav_item.hide();
            }

        } else {
            loopedPage.allowed_by_rule = true;

            if (!loopedPage.hidden) {
                // increment total and position
                c.total_pages++;
                loopedPage.position_label = c.total_pages;
            }
        }
        
        //console.log('-----------------')
        //console.log(loopedPage.name, loopedPage.page_id)
        //console.log('allowed:'+loopedPage.allowed)
        //console.log('allowed_by_rule:'+loopedPage.allowed_by_rule)

        // lets do a log
        //console.log('Page '+(i+1)+': '+c.page_order[i]+' | completed: '+(c.pages[c.page_order[i]].completed?'yes':'no')+' | score: '+(c.pages[c.page_order[i]].score!==undefined?c.pages[c.page_order[i]].score:'null'));

        // // now manage the navigation and decide if links are enabled or not
        // c._set_link_visibility(loopedPage);
    }

    // now we create custom markers

    // we add classes to the body to show progress, page number and score
    // first remove any that were added before
    var body_classes = [];
    var $body = $('body');
    var existing_classes = ( $body.attr('class') || '' ).split(/\s+/);

    for (var i = 0; i < existing_classes.length; i++) {
        if (
                existing_classes[i].substring(0,6) != 'score-' && 
                existing_classes[i].substring(0,9) != 'progress-' &&
                existing_classes[i].substring(0,5) != 'page-'
            ) {
            //allow through
            body_classes.push ( existing_classes[i] );
        }
    }

    // page number
    body_classes.push ( 'page-'+c.pages[ c.current_page ].position_label );
    // first and last
    if ( c.current_page == c.page_order[0])
        body_classes.push ( 'page-first' );
    else if (c.current_page == c.page_order[c.page_order.length-1] || c.pages[ c.current_page ].send_score)
        body_classes.push ( 'page-last' );
    
    // progress
    body_classes.push ( 'progress-'+progress );
    body_classes.push ( 'progress-lt-'+(Math.ceil(progress/5)*5) );
    body_classes.push ( 'progress-gt-'+(Math.floor(progress/5)*5) );
    // pass / fail
    body_classes.push ( 'score-'+(score_result?'pass':'fail') );
    // score
    body_classes.push ( 'score-eq-'+score );
    if (score) {
        body_classes.push ( 'score-lt-'+(Math.ceil(score/5)*5) );
        body_classes.push ( 'score-gt-'+(Math.floor(score/5)*5) );
    }
    $body.attr('class', body_classes.join(' ') );
    
    // now update navigation based on current status
    // now update navigation based on current status
    // now update navigation based on current status
    c._make_page_active( c.current_page );
    // c._set_link_visibility(c.current_page);
    c._fix_links( $('#pew' ) );
    // now manage the navigation and decide if links are enabled or not
    for (var q=0; q<c.page_order.length;q++) {
        var loopedPage = c.pages[c.page_order[q]];
        c._set_link_visibility(loopedPage);
    }


    // Init is true the first ever time this loops we don't wanna send anything it just has to loop to set up some initial values.
    if(init) {
        return;
    }

    /*
    
    NOW TRACKING - 

    SCORM 1.2 => Have to choose between ‘Completed’ or ‘Passed’

        If ‘Completed’ - 
            
            Send ‘completed’ to LMS as soon as Learner passes N% of pages viewed
            
            If Learner gets to final page and a result hasn’t already been sent, send ‘Incomplete’ or ‘Complete’ depending on whether they have seen N% of pages
            
        If ‘Passed’
            
            Send ‘Passed’ or ‘Failed’ on final page of content depending on whether they have or not
            (Note - questionnaires that have been skipped do not count towards scoring)

    SCORM 2004 => Can be ‘Completed’ and ‘Passed’
        
        Send ‘completed’ to LMS as soon as Learner passes N% of pages viewed
    
        If Learner gets to final page, send ‘Incomplete’ or ‘Complete’ depending on whether they have seen N% of pages
        
        Send ‘Passed’ or ‘Failed’ on final page of content depending on whether they have or not
            (Note - questionnaires that have been skipped do not count towards scoring)
    
    */
    var should_send_score = (current == c.page_order.length-1 || c.pages[ c.current_page ].send_score ? true : false );

    //We are on the last page or the page which the author has chosen as the scoring page.
    //Next time the learner navigates we should re-shuffle question pools.
    c.should_shuffle_pools = c.options.auto_shuffle_pools ? should_send_score : false;


    if (c.options.lms.mode) {


        // IF LAST PAGE, or SEND SCORE, or all_questions_answered
        if (should_send_score || all_questions_answered) {
            // if there are questions
            if (global_pass.score_possible) {
                if (!c.sent_result || ((c.has_retaken_questions || !all_questions_answered) && should_send_score && c.options.allow_retakes)) {
                    // reset retaken questions flag
                    c.has_retaken_questions = false;

                    setTimeout(function () {
                        c.options.lms.SetScore( score, 0, 100 );
                    },50);

                    if (score_result) {
                        if (c.options.completion_action == 'passed' || c.options.lms.mode != '1.2') {
                            setTimeout(function () {
                                c.options.lms.SetPassed();
                            },50);
                        }
                        // if an outcome has been sent to the LMS, send it to Elucidat too
                        
                        c.lrs.queue ({
                            'url': c.lrs.activity_id,
                            'verb': 'passed',
                            'passed': true,
                            'score': score,
                            'duration': c.timer.session_time,
                            'course_name': c.course_name
                        });
                        // and send to google
                        ga('send', 'event', 'Result', 'Pass');
                        if (gac.length) ga('c.send', 'event', 'Result', 'Pass');

                    } else {
                        if (c.options.completion_action == 'passed' || c.options.lms.mode != '1.2') {
                            setTimeout(function () {
                                c.options.lms.SetFailed();
                            },50);
                        }
                        // if an outcome has been sent to the LMS, send it to Elucidat too
                        c.lrs.queue ({
                            'url': c.lrs.activity_id,
                            'verb': 'failed',
                            'passed': false,
                            'score': score,
                            'duration': c.timer.session_time,
                            'course_name': c.course_name
                        });

                        // and send to google
                        ga('send', 'event', 'Result', 'Fail');
                        if (gac.length) ga('c.send', 'event', 'Result', 'Fail');

                    }

                    c.sent_result = true;
                }
            }
        }

        // IF COMPLETE
            // IF completion_result OR LAST PAGE OR send_score selected
            // 2004 - Send Completion
            // 1.2 - Send Completion if completion_action = 'completed'
        if ((!c.sent_lrs_completion || c.sent_lms_completion) && (completion_result || should_send_score)) {
            
            if (!c.sent_lms_completion) {
                if (c.options.completion_action == 'completed' || c.options.lms.mode != '1.2') {
                    if (completion_result) {
                        // send to lms
                        setTimeout(function () {
                            c.options.lms.SetCompleted();
                        },50);
                        // only send complete one
                        c.sent_lms_completion = true;
                    } else {
                        // send to lms
                        setTimeout(function () {
                            c.options.lms.SetIncomplete();
                        },50);
                    }
                }
            }

            if (!c.sent_lrs_completion) {
                // if an outcome has been sent to the LMS, send it to Elucidat too
                var completion_statement = {
                    'url': c.lrs.activity_id,
                    'verb': 'completed',
                    //'name': 'Name of the course'
                    'completed': completion_result ? true : false,
                    'duration': c.timer.session_time,
                    'course_name': c.course_name
                };
                // add passed, if appropriate
                if (global_pass.score_possible && all_questions_answered)
                    completion_statement.passed = score_result ? true : false;
                // now send
                c.lrs.queue (completion_statement);
                // and send to google
                ga('send', 'event', 'Progress', 'Completion');
                if (gac.length) ga('c.send', 'event', 'Progress', 'Completion');
                // only send complete one
                if (completion_result)
                    c.sent_lrs_completion = true;
            }
        }

        //IF the course has no scored questions OR the result has been sent) AND completion has been sent.Then tell the LMS that it shouldn't restore (once)
        if(none_scored || c.sent_result && c.sent_lms_completion){
            //Triage - SetExit is not defined in the scorm wrapper in older releases.
            if(typeof c.options.lms.SetExit === 'function') {
                c.options.lms.SetExit("logout");
            }
        }

        // finally terminate session
        // send termination if we've completed, and are on the last page
        if (!c.sent_termination && progress == 100 && should_send_score) {
            // send session time (also sent on every page completion)
            if (c.options.lms.SetSessionTime) {
                setTimeout(function () {
                    c.options.lms.SetSessionTime ( c.timer.session_time );
                },50);
            }
            setTimeout(function () {
                console.log('//\n//\n// Session terminated\n//');
                c.lrs.queue ({
                    'url': c.lrs.activity_id,
                    'verb': 'terminated',
                    'duration': c.timer.session_time,
                    'course_name': c.course_name
                });
            }, 1000);// Reduced this as it was often not sending the terminated singnal on time

            c.sent_termination = true;
        }
        
    }
    return true;
};

// Include: javascript/release/build/elucidat//_question_pools.js
Elucidat.prototype._shuffle_question_pools = function (reshuffle) {
    //Shuffle the questions shown from any question pools and show/hide the correct pages.
    this.question_pools._shuffle();
    var pagesToHide = this.question_pools._get_all_pages_to_hide();
    var pagesToShow = this.question_pools._get_all_pages_to_show();

    for (var i = 0; i < pagesToShow.length; i++) {
        this.pages [ pagesToShow[i] ].hidden = false;
    }

    for (var j = 0; j < pagesToHide.length; j++) {
        this.pages [ pagesToHide[j] ].hidden = true;
    }


    //The first time this is called, there is no need to reassess the learner's progress by calling _manage_progress as it will be called later.
    //If it's being called part way through a course it needs to unset any answers and re-assess the progress and rebuild the nav menu.
    if(reshuffle) {

        //remove scores, progress etc  from all the pages in question pools.
        var allQuestionPoolPages = this.question_pools._get_all_pages_in_pools();
        for (var i=0; i<allQuestionPoolPages.length;i++) {
            var loopedPage = this.pages[allQuestionPoolPages[i]];
            loopedPage.answer = null;
            loopedPage.completed = false;
            loopedPage.score = false;
            loopedPage.visited = false;
        }

        // Manage progress to tidy up score/progress.
        this._manage_progress();

        // Init navigation will re-build the nav based on the newly shown/hidden pages.
        this._init_navigation();

        //Bind new links in the nav.
        this._fix_links(this.$nav_container);

        // Set link visibility/styles on all pages - the whole nav has been re-drawn so all the links have been effected.
        for (var i=0; i<this.page_order.length;i++) {
            this._set_link_visibility(this.pages[this.page_order[i]]);
        }

        //Edge case: if the current page is part of a question pool, move to the first valid page in the pool.
        if(this.question_pools._find_page(this.current_page)) {
            var currentPool = this.question_pools._get_pool(this.question_pools._find_page(this.current_page));
            // send user to the first valid page from the pool.
            Elucidat.navigate(currentPool.pagesToShow[0]);


        }
    }


};
// Include: javascript/release/build/elucidat//_set_current_page.js


// now open up a pre-loaded page
Elucidat.prototype._set_current_page = function ( current_page ) {

    // if navigation is not in place, pause until it is
    var context = this;
    // This is a simple page log - to tell the API that we're on this page

    //JB TODO we should put this back in - it will allow us to restore page views from bookmarking if we store this data and send it back with page history.

    // var xapi_data = {
    //     'url': context.lrs.activity_id,
    //     'verb': 'visited', //this.pages[ current_page ].has_score || this.pages[ current_page ].answer ? 'answered' :
    //     'course_name': context.course_name,
    //     'page_name': context.pages[ current_page ].name,
    //     'page_url': current_page
    // };
    //
    // context.lrs.queue (xapi_data);

    // save history to lms, if in offline mode
    if (this.options.mode == 'offline')
        setTimeout(function () {
            context._save_history_to_lms();
        }, 100);

};
// Include: javascript/release/build/elucidat//_set_link_visibility.js
Elucidat.prototype._set_link_visibility = function ( page ) {

    var e = this;

    //Handle navigation links to this page.
    if (page.nav_item && page.nav_item.length) {
        if (page.allowed && page.allowed_by_rule) {
            page.nav_item.removeAttr('disabled').addClass('enabled');

        }
        else {
            page.nav_item.attr('disabled', 'disabled').removeClass('enabled');
        }


        // completed/visited class is the old style one - left in for backwards compatibility
        if (page.completed)
            page.nav_item.addClass('completed').addClass('e-completed');

        if (page.visited)
            page.nav_item.addClass('visited').addClass('e-visited');
    }

    //Handle all links to this page. (page.links_to_page includes navigation links!)
    for (var i = 0; i < page.links_to_page.length; i++) {
        var $link = page.links_to_page[i];

        //Links can optionally be hidden if they link to a page that is hidden by a rule. Otherwise they are just greyed out.
        var shouldBeHidden = $link.attr('data-hidden-by-rule') === 'true' || $link.attr('data-hidden-by-rule') === '1';

        //if the page is not allowed, or it's parent is not allowed.
        if((!page.allowed || !page.allowed_by_rule) ||  (page.parent && (!e.pages[page.parent].allowed || !e.pages[page.parent].allowed_by_rule ))) {
            if(shouldBeHidden) {
                $link
                    .addClass('e-link-hidden-by-rule')
                    .attr({
                        'aria-hidden': 'true',
                        'disabled': 'true'
                    });
            } else {
                $link.addClass('e-link-disabled-by-rule');
            }
        } else {
            if(shouldBeHidden) {
                $link
                    .removeClass('e-link-hidden-by-rule')
                    .removeAttr('aria-hidden')
                    .removeAttr('disabled');
            } else {
                $link.removeClass('e-link-disabled-by-rule');
            }
        }


        // mark on the link if found
        $link.attr('data-page-id', page.page_id);

        if (page.visited) {
            $link
                .addClass('visited')
                .addClass('e-visited');
        }

        if(page.chapter) {
            $link.chapter_link(page.chapter);
        } else if (page.completed) {
            // completed is legacy, e-completed is the future!
            $link
                .addClass('completed')
                .addClass('e-completed');
        }

        // add markers for chapter and progress
        if (page.is_section) {
            $link
                .addClass('e-is-chapter')
                .addClass('e-chapter-'+page.page_id);
        }
    }
};
// Include: javascript/release/build/elucidat//Elucidat_Milestone.js

/* Elucidat_Milestone PUBLIC CLASS DEFINITION
* ============================== */
var Elucidat_Milestone = function ( pass_rate ) {
    this.pass_rate = parseInt( pass_rate );//ep.options.global_pass_rate );
    this.score = 0;   
    this.score_possible = 0;
    this.progress = 0;
    this.progress_possible = 100;
    this.completion_rate = 100; 
};
Elucidat_Milestone.prototype.addScore = function (score, out_of, weighting) {
    this.score += parseFloat(score) * parseInt(weighting);
    this.score_possible += out_of * parseInt(weighting);
};
Elucidat_Milestone.prototype.getScore = function () {
    if (this.score == 0) return 0;
    return Math.round(100/this.score_possible*this.score);
};
Elucidat_Milestone.prototype.getScoreResult = function () {
    // assume a pass if there is no scoring at all
    return (!this.score_possible || this.getScore() >= this.pass_rate ? true : false );
};
Elucidat_Milestone.prototype.getProgress = function () {
    if (this.progress == 0) return 0;
    return Math.round(100/this.progress_possible*this.progress);
};
Elucidat_Milestone.prototype.getAnswerGiven = function (answerToFind, pages) {
    //Returns true if the answer id has been submitted by the user.
    var answerFound = false;
    $.each(pages, function(i, page) {

        if(answerFound) return false;

        if(page.answer && typeof page.answer === 'object' && page.answer.length) {
            // A page can have multiple questions, loop through questions here.
            for(var j=0; j<page.answer.length; j++) {
                if(answerFound) break;
                var answer = page.answer[j];

                for(var k=0; k<answer.answer.length; k++) {
                    var answerID = answer.answer[k];

                    //After bookmarking the answer ID has the answer's text appended to it after a [:], remove it.
                    if(answerID.indexOf('[:]') !== -1) {
                        answerID = answerID.split('[:]')[0]
                    }
                    if('pa_' + page.page_id + '_' + answerID === answerToFind) {
                        answerFound = true;
                    }
                }
            }
        }
    });
    return answerFound;
};
Elucidat_Milestone.prototype.getProgressResult = function () {
    return this.getProgress() >= this.completion_rate;
};

// these are the page processing 
Elucidat_Milestone.prototype.evaluateStatement = function ( statement, pages ) {

    // if it has with brackets, then it contains groups of statements, and needs to be split
    if ( statement.indexOf('(') !== -1 &&  statement.indexOf(')') !== -1) {
        return this.splitStatement( statement, pages );

    } else {
        // now work out if the statement is true
        // each statement has <variable> <operator> <value>
        // 
        var variable = null;
        var split = statement.split(' ');

        if (split.length == 3) {

            // there is a special case - pages_seen
            if (split[0] == 'page_seen') {
                //console.log(pages[ split[2] ]);
                if (!pages[ split[2] ])
                    return false;
                else {
                    //console.log('result',pages[ split[2] ].completed);
                    return pages[ split[2] ].completed ? true : false;
                }
            } else if (split[0] == 'page_passed') {
                if (!pages[ split[2] ])
                    return false;
                else
                    return pages[ split[2] ].score === 1 ? true : false;

            } else if (split[0] == 'page_failed') {
                if (!pages[ split[2] ])
                    return false;
                else
                    // no submitted score is a false - 
                    return pages[ split[2] ].score === null || pages[ split[2] ].score === 1 ? false : true;
            } else if (split[0] === 'page_answer') {
                //Check all the answers given so far and see if they include the id at split[2].
                return this.getAnswerGiven(split[2], pages);

            }
            // otherwise if it is numeric, make it into a number
            if (!isNaN(split[2]))
                split[2] = parseInt(split[2]);

            //  otherwise clean up boolean values
            if (split[2] == 'pass' || split[2] == 'yes' || split[2] == 'true')
                split[2] = true;

            else if (split[2] == 'fail' || split[2] == 'no' || split[2] == 'false')
                split[2] = false;

            // now do the heavy lifting
                // this needs customising of course
            if (split[0] == 'score')
                variable = this.getScore();

            else if (split[0] == 'completion')
                variable = this.getProgressResult();

            else if (split[0] == 'result')
                variable = this.getScoreResult();

            else if (split[0] == 'percentage_complete')
                variable = this.getProgress();

            else
                return false;

            // now process
            if (split[1] == '>') {
                if (variable > split[2])
                    return true;

            } else if (split[1] == '>=') {
                if (variable >= split[2])
                    return true;

            } else if (split[1] == '<') {
                if (variable < split[2])
                    return true;

            } else if (split[1] == '<=') {
                if (variable <= split[2])
                    return true;

            } else if (split[1] == '==') {
                if (variable == split[2])
                    return true;

            } else if (split[1] == '!=') {
                if (variable != split[2])
                    return true;

            }

        }
        return false;

    }
};

Elucidat_Milestone.prototype.splitStatement = function ( conditions, pages ) {

    //regex to get array of all the <variable> <operator> <value> parts. E.g. page_seen = 57839b28c27c6
    //https://regex101.com/r/qD4uV4/4
    var groups = conditions.match(/\w+\s[^\|\&\(\)]{1,2}\s[\w\-]+/g);

    for(var i=0; i<groups.length; i++) {
        //evaluate each part and replace it in the original string with just true or false.
        var answer = this.evaluateStatement( groups[i], pages ).toString();
        conditions = conditions.replace(groups[i], answer);
    }

    // Eval the whole thing.
    return eval (conditions);

};
// Include: javascript/release/build/elucidat//Elucidat_Question_Pools.js
var QuestionPoolContainer = function() {

    this.pools = {};
};

//Adds a page from the original json_object with a q property and puts it into the correct pool. Creates pools as required.
QuestionPoolContainer.prototype._add_page = function(page) {
    if(!page.q) return;
    var poolName = page.q;

    if (!this.pools[ poolName ]) {
        this._create_pool(poolName);
    }

    this.pools[ poolName ].pages.push( page.id );

};

//Creates a new pool with a given name in format name:percent e.g. myPool:20
QuestionPoolContainer.prototype._create_pool = function(poolName) {
    var q_name_split = poolName.split(':'); // first get the name and percentage of the question pool
    var percentageToHide = 1 - (1 / 100 * parseInt(q_name_split[1])); // calculate the number of pages from the question pool that should be hidden

    this.pools[ poolName ] = {
        pages: [],
        percentageToHide:percentageToHide,
        numToHide: -1,
        name: q_name_split[0],
        pagesToShow : [],
        pagesToHide : []
    };
};

QuestionPoolContainer.prototype._get_pool = function(poolName) {
    //returns a specific pool or all pools if poolName not passed.
    if(poolName && this.pools[poolName]) {
        return this.pools[poolName];
    } else if(poolName) {
        throw 'Pool ' + poolName + ' not found.';
    }
    return this.pools;
};

//Returns list of pages hidden by all question pools.
QuestionPoolContainer.prototype._get_all_pages_to_hide = function() {
    var pagesToHide = [];

    $.each(this.pools, function(i, pool) {
        pagesToHide = pagesToHide.concat(pool.pagesToHide);
    });

    return pagesToHide;
};

//Returns list of pages shown by all question pools.
QuestionPoolContainer.prototype._get_all_pages_to_show = function() {
    var pagesToShow = [];

    $.each(this.pools, function(i, pool) {
        pagesToShow = pagesToShow.concat(pool.pagesToShow);
    });

    return pagesToShow;
};

//Returns list of all pages in quesiton pools.
QuestionPoolContainer.prototype._get_all_pages_in_pools = function() {
    var pages = [];

    $.each(this.pools, function(i, pool) {
        pages = pages.concat(pool.pages);
    });

    return pages;
};

//Takes a page ID and returns the pool it belongs to. Returns false if not found.
QuestionPoolContainer.prototype._find_page = function(pageID) {
    var found = false;
    $.each(this.pools, function(poolName,pool) {
        for(var i=0; i<pool.pages.length; i++) {
            if(pool.pages[i] === pageID) {
                found = poolName;
                break;
            }
        }
        if(found){
            return false; //return false = break from jQuery each.
        }

    });
    return found;
};

// Reshuffle the question pools and select differnet questions. Works in conjunction with Elucidat._shuffle_question_pools
// It will re-populate the pagesToShow and pagesToHide objects.
QuestionPoolContainer.prototype._shuffle = function() {

    $.each(this.pools, function(i, pool) {
        // only drop questions if needed
        if (pool.percentageToHide < 1) {
            // how many should we pick?
            pool.numToHide = pool.pages.length * pool.percentageToHide;

            // randomise the array
            pool.pagesToShow = pool.pages.shuffle();

            //repopulate pagesToHide
            pool.pagesToHide = [];

            for (var i = 0; i < pool.numToHide; i++) {
                pool.pagesToHide.push(pool.pagesToShow.shift())
            }
        }
    });


};
// Include: javascript/release/build/elucidat//Elucidat_Timer.js

/* Elucidat_Timer PUBLIC CLASS DEFINITION
* ============================== */
var Elucidat_Timer = function ( ep ) {

    this.elucidat = ep;
    // current page and chapter
    this.current_page = false;
    this.current_chapter = false;
    // timestamp for start times
    this.session_start = Date.now();
    this.session_time = 0;
    this.chapter = {};
    this.page = {};
    
    // redirect rules
    this.timers = [];

    var t = this;
    setInterval(function () {
        t.clock();
    }, 1000);

};

Elucidat_Timer.prototype.redirect = function ( page_id ) {
    if (this.elucidat) {
        var page_request = this.elucidat.pages[ page_id ];
        if (page_request.allowed && page_request.allowed_by_rule) {   
            if (page_request.loaded)
                this.elucidat._open_page ( page_request );
            else
                this.elucidat._load_href ( page_request.url );
        }
    }
};
Elucidat_Timer.prototype.clock = function () {

    if (this.current_page) {
        var c = this;
        var now = Date.now();

        // time elapsed
        c.session_time = now - c.session_start;
        //c.chapter_time = now - c.session_start;
        if (c.page[ c.current_page ]) {
            c.page[ c.current_page ].time = now - c.page[ c.current_page ].start;
            // page time left
            if (c.page[ c.current_page ].limit) {
                c.page[ c.current_page ].remaining = c.page[ c.current_page ].limit - c.page[ c.current_page ].time;
                
                // redirect rules - here
                if (c.page[ c.current_page ].remaining <= 0) {
                    // set to 0
                    c.page[ c.current_page ].remaining = 0;
                    // if there is a redirect - do it
                    if (c.page[ c.current_page ].redirect && !c.page[ c.current_page ].redirected) {
                        c.page[ c.current_page ].redirected = true;
                        c.redirect( c.page[ c.current_page ].redirect );
                        return;
                    }
                }
            } else {
                c.page[ c.current_page ].remaining = null;
            }
        }
        if (c.chapter[ c.current_chapter ]) {
            c.chapter[ c.current_chapter ].time = now - c.chapter[ c.current_chapter ].start;
            // chapter time left
            if (c.chapter[ c.current_chapter ].limit) {
                c.chapter[ c.current_chapter ].remaining = c.chapter[ c.current_chapter ].limit - c.chapter[ c.current_chapter ].time;

                // redirect rules - here
                if (c.chapter[ c.current_chapter ].remaining <= 0) {
                    // set to 0
                    c.chapter[ c.current_chapter ].remaining = 0;
                    // if there is a redirect - do it
                    if (c.chapter[ c.current_chapter ].redirect && !c.chapter[ c.current_chapter ].redirected) {
                        c.chapter[ c.current_chapter ].redirected = true;
                        c.redirect( c.chapter[ c.current_chapter ].redirect );
                        return;
                    }
                }
            } else {
                c.chapter[ c.current_chapter ].remaining = null;
            }
        }
        // now update display of timers
        c._update( this.timers );

    }
};

Elucidat_Timer.prototype.page_start = function ( page_id, limit, redirect ) {

    if (page_id != this.current_page) {
        // are are starting a new page

        // if this page isn't running already - add it into register
        if (this.page[ page_id ] == undefined ) {
            // init
            this.page[page_id] = {};
            // set start time
            this.page[page_id].start = Date.now();
            this.page[page_id].time = 0;
            // set limit and redirect
            if (limit) {
                this.page[page_id].limit = limit * 1000; // convert to milliseconds
                this.page[page_id].remaining = limit * 1000; // convert to milliseconds
                // now redirect
                if (redirect)
                    this.page[page_id].redirect = redirect;
            }
        } else {
            // if page has been visited already, there will be some time already
            // so we reset the start time to now - time already - so that clock is always right
            this.page[page_id].start = Date.now() - this.page[page_id].time;
        }
        // now set current page
        this.current_page = page_id;
    }    
};

Elucidat_Timer.prototype.chapter_start = function ( page_id, limit, redirect ) {
    
    if (page_id != this.current_chapter) {
        // are are starting a new page

        // if this page isn't running already - add it into register
        if (this.chapter[ page_id ] == undefined ) {
            // init
            this.chapter[page_id] = {};
            // set start time
            this.chapter[page_id].start = Date.now();
            this.chapter[page_id].time = 0;
            // set limit and redirect
            if (limit) {
                this.chapter[page_id].limit = limit * 1000; // convert to milliseconds
                this.chapter[page_id].remaining = limit * 1000; // convert to milliseconds
                // now redirect
                if (redirect)
                    this.chapter[page_id].redirect = redirect;
            }
        } else {
            // if page has been visited already, there will be some time already
            // so we reset the start time to now - time already - so that clock is always right
            this.chapter[page_id].start = Date.now() - this.chapter[page_id].time;
        }
        // now set current page
        this.current_chapter = page_id;
    }    
};


Elucidat_Timer.prototype.register = function ( $timers ) {
    // first clean up the timers we have
    var new_timers = [];
    var static_timers = [];
    // go through and check they are still there
    for (var i=0; i<this.timers.length;i++) {
        if (this.timers[i].length) {
            // if timer is still there,
            // add back to new_timers array
            new_timers.push( this.timers[i] );
        }
    }
    // now do the same for the new timers coming in (and mark them as done if they are)
    $timers.each(function () {
        var $timer = $(this);
        if (!$timer.hasClass('e-timer')) {
            if ($timer.hasClass('static')) {
                // static timers are not added to our array - they are updated once, and left
                static_timers.push( $timer );
            } else { 
                // add to updating array
                new_timers.push( $timer );
            }
            // and mark as setup
            $timer.addClass('e-timer');
        }
    });
    // update static timers - once
    this._update( static_timers );

    // now write back to object
    this.timers = new_timers;
};

Elucidat_Timer.prototype._format_time = function ( milliseconds ) {

    if (!milliseconds)
        return '';

    var time = new Date(milliseconds);

    var h = time.getUTCHours();
    var m = time.getMinutes();
    var s = time.getSeconds();
    
    return (h ? h + ':' : '') + (m < 10 && h ? '0' : '') + (m ? m + ':' : '') + (s < 10 && m ? '0' : '') + s;
};

Elucidat_Timer.prototype._update = function ( timers_array ) {
    /*
    console.log('---------------------');
    console.log('session_time: '+this._format_time( this.session_time ));
    console.log('page_time: '+this._format_time( this.page[ this.current_page ].time ));
    console.log('chapter_time: '+this._format_time( this.chapter[ this.current_chapter ].time ));

    console.log('page_time_remaining: '+this._format_time( this.page[ this.current_page ].remaining ));
    console.log('chapter_time_remaining: '+this._format_time( this.chapter[ this.current_chapter ].remaining ));
    */
    for (var i=0; i<timers_array.length;i++) {
        if (timers_array[i].length) {
            var $timer = timers_array[i];

            if ($timer.hasClass('session_time'))
                $timer.text( this._format_time( this.session_time ) );

            else if ($timer.hasClass('chapter_time') && this.chapter[ this.current_chapter ])
                $timer.text( this._format_time( this.chapter[ this.current_chapter ].time ) );

            else if ($timer.hasClass('page_time') && this.page[ this.current_page ])
                $timer.text( this._format_time( this.page[ this.current_page ].time ) );

            else if ($timer.hasClass('chapter_time_remaining') && this.chapter[ this.current_chapter ])
                $timer.text( this._format_time( this.chapter[ this.current_chapter ].remaining ) );

            else if ($timer.hasClass('page_time_remaining') && this.page[ this.current_page ])
                $timer.text( this._format_time( this.page[ this.current_page ].remaining ) );
            
        }
    }
};

// Include: javascript/release/build/elucidat//Elucidat_Xapi_Queue.js

var Elucidat_Xapi_Queue = function () {
    //
    this.activity_id = '';
    this.learner_name = null;
    this.endpoints = [];
    this.statement_queue = [];
    this.processing = false;
};

// In offline mode, the registration id (probably) comes after the page load
Elucidat_Xapi_Queue.prototype.set_registration = function ( reg_id ) {
    // then do lms attempted call
    for (var i = 0; i < this.endpoints.length; i ++ ) {
        this.endpoints[i].registration = reg_id;
    }
};

Elucidat_Xapi_Queue.prototype.queue = function (statement_options, callback ) {
    var c = this;

    // insert timestamp onto statement
    var timestamp = new Date();
    statement_options.timestamp = timestamp.toISOString();
    
    // convert duration to the right format - if exists - will arrive in milliseconds
    if (statement_options.duration !== null && statement_options.duration !== undefined) 
        statement_options.duration = 'PT'+(Math.round(parseInt(statement_options.duration)/1000))+'S';
    
    // tmp
    // console.log( statement_options );

    // queue a statement for each endpoint
    for (var i = 0; i < c.endpoints.length; i ++) {
        c.statement_queue.push({
            'endpoint': i,
            'statement_options': statement_options,
        // only callback once per queue
            'callback': (i == 0 ? callback : null)
        });
    }

    // attempt a send
    setTimeout(function () {
        c.send();
    },15);
};

Elucidat_Xapi_Queue.prototype.send = function () {

    var new_queue = [];
    var registration, authentication, statement, endpoint, callback;
    // make sure we only run once at a time
    if (this.processing)
        return;
    this.processing = true;

    for (var i = 0; i < this.statement_queue.length; i ++) {
        // temp logging

        // see if the endpoint has a registration id
        registration = this.endpoints [ this.statement_queue[i].endpoint ].registration;
        if (!registration) {
            // requeue this item if no registration id (meaning the lrs is not active)
            new_queue.push(this.statement_queue[i]);

        } else {
            // good to send, so put the request together
            authentication = this.endpoints [ this.statement_queue[i].endpoint ].authentication;
            endpoint = this.endpoints [ this.statement_queue[i].endpoint ].endpoint;
            // this needs optimisation, as similar statements shouldn't need recompiling
            statement = this._make_xapi_statement ( registration, this.statement_queue[i].statement_options );
            callback = this.statement_queue[i].callback;

            this._do_ajax_call (endpoint, authentication, statement, callback);

        }

    }
    // reset the queue
    this.statement_queue = new_queue;
    // mark processing as finished
    this.processing = false;

};

Elucidat_Xapi_Queue.prototype._do_ajax_call = function (endpoint, authentication, statement, callback) {

    var ajax_options = {
        url: endpoint,
        type: 'POST',
        crossDomain: true,
        dataType: "json",
        data: {},
        success: function(data, textStatus, xhr) {
            if (callback)
                callback(data);
        },
        error: function(xhr) {
            //console.log("Error calling TinCanAPI, status code " + xhr.status + ", message: " + xhr.responseText);
        }
    };

    if (!xhr2) {
        ajax_options.dataType = "jsonp";
        ajax_options.data.credentials = authentication;
        ajax_options.data.statement = statement;
    } else {
        ajax_options.beforeSend = function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic "+authentication);
            xhr.setRequestHeader ("X-Experience-API-Version", "1.0.0");
        };
        ajax_options.data = JSON.stringify( statement );
    }

    $.ajax(ajax_options);

};

Elucidat_Xapi_Queue.prototype._make_xapi_statement = function ( registration, options ) {

    var statement = {
        'actor': {},
        'context': {
            'contextActivities': {
                "parent": [{
                    "id": options.url
                }],
                "category": [{
                    "id":"https://elucidat.com",
                    "definition": {
                        "name":{
                            "en-US":"Elucidat.com"
                        },
                        "description": {
                            "en-US": "Course lovingly crafted with the Elucidat.com rapid authoring tool"
                        }
                    }
                }]
            }
        },
        "object":{
            "objectType": "Activity",
            "definition": {
                "type": null
            }
        },
        "verb": {
            "id": "http://adlnet.gov/expapi/verbs/"+options.verb,
            "display": {
                "en-US": options.verb
            }
        },
        "result": {},
        "timestamp": options.timestamp
    }
    // registration id
    statement.context.registration = registration;

    // activity id
    // if page url add onto main url
    if (options.page_url) {
        // url might contain a ? 
        // split the URL into parts
        var spl_url = unescape(options.url).split('?');
        statement.object.id = spl_url[0] + '/' + options.page_url + (spl_url[1] ? escape('?' + spl_url[1]) : '');

    } else
        // otherwise just the URL 
        statement.object.id = options.url;

    // if one of the start/end calls
    if (options.verb == "attempted"  || options.verb == "commented" || options.verb == "completed" || options.verb == "passed" || options.verb == "failed" || options.verb == "terminated") {
        if (options.verb == "commented")
            statement.object.definition.type = "http://adlnet.gov/expapi/activities/commented";
        else
            statement.object.definition.type = "http://adlnet.gov/expapi/activities/course";
        // course name
        statement.object.definition.name = { "en-US": options.course_name };

    // otherwise it is scored
    } else {

        if (options.verb == "answered") {
            // cmi interaction type
            statement.object.definition.type = "http://adlnet.gov/expapi/adlnetctivities/cmi.interaction";

            // question definition
            if (options.choices) 
                statement.object.definition.choices = options.choices;

            if (options.scale) 
                statement.object.definition.scale = options.scale;

            if (options.interaction_type) 
                statement.object.definition.interactionType = options.interaction_type;
            else
                statement.object.definition.interactionType = "other";

            if (options.correct_responses_pattern) 
                statement.object.definition.correctResponsesPattern = options.correct_responses_pattern;

            if (options.source)
                statement.object.definition.source = options.source;

            if (options.target)
                statement.object.definition.target = options.target;

        // otherwise it is a page
        } else
            statement.object.definition.type = "http://activitystrea.ms/schema/1.0/page";

        // activity name (page name)
        statement.object.definition.name = { "en-US": options.page_name };

    }
    // add description if apt
    if (options.description) 
        statement.object.definition.description = { "en-US": options.description };

    // add result if apt
    if (options.score !== null && options.score !== undefined) 
        statement.result.score = { "scaled": options.score / 100 };

    // completed
    if (options.completed)
        statement.result.completion = true;
    else
        statement.result.completion = false;

    // passed
    if (options.passed === true)
        statement.result.success = true;
    
    // failed
    else if (options.passed === false)
        statement.result.success = false;

    // duration
    if (options.duration)
        statement.result.duration = options.duration;

    // answer
    if (options.answer)
        statement.result.response = options.answer;

    if (options.revision)
        statement.context.revision = options.revision;

    // remove empty result
    if (jQuery.isEmptyObject(statement.result))
        delete statement.result;

    return statement;

};

// Include: javascript/release/build/forms//jquery._form_common.js
(function($){
    $.fn.extend({
        form_common: function(options) {

            var defaults = {
                set_interactions: null,
                interactions: null,
                submit_form: null,
                allow_hidden_save_button: false
            };

            options = $.extend(defaults, options);

            return this.each(function() {
                var set_interactions = options.set_interactions;
                var $interactions = options.interactions;
                var submit_form = options.submit_form;
                
                var $form = $(this);

                // we only want one type of form initialised, per form
                if ($form.data('initialised')) return;
                $form.data('initialised', true);
                
                // define the interaction
                // if no interaction info is sent
                // or if there is only one of them
                // then set the entire form as the interaction
                if ( $interactions === null ) {
                    $interactions = $form;
                }
                
                // tell the app it is scorable
                $interactions.trigger('scorable_section').addClass('e-scorable-section');
                
                // find the form type
                // assessment: no feedback modal
                // survey: neutral feedback modal
                // knowledge check: graded modals
                var form_type;
                var form_types = ['assessment', 'survey', 'knowledge-check'];
                for ( var i = 0; i < form_types.length; i++ ) {
                    var type = form_types[i];
                    if ( $form.hasClass('e-form-'+type) ) {
                        form_type = type;
                    }
                }
                
                // if form type is survey remove data-status from the answers
                if (form_type === 'survey') {
                    var $answers = $form.find('.answer[data-status]');
                    
                    for (var j = 0; j < $answers.length; j++) {
                        var $answer = $($answers[j]);
                        $answer.removeAttr('data-status');
                    }
                }
                
                // find the save button
                $form.find('a.save_button, button.save_button').each(function () {
                    var $button = $(this);
                    // make sure there is an appropriate link title
                    if (!$button.attr('title')) {
                        $button.attr('title','Submit form');
                    }
                    // links need an href to appear in the tab order
                    if (!$button.attr('href')) {
                        $button.attr('href','#');
                    }
                    
                    // set each interaction
                    var set_form_data = set_interactions( form_type );
                    var form_data = set_form_data.form_data;
                    
                    // by default all forms are scored
                    var is_scored = true;
                    // with the exception of polls and likerts
                    // set_form_data.is_scored is a variable returned only on click input questionnaires
                    // if the form has no correct answers is_score = false
                    if (set_form_data.is_scored === false || form_type === 'survey') {
                        is_scored = false;
                    }
                    
                    // disable the button unless the form has been answered
                    if ( !$form.hasClass('answered') ) {
                        $button.attr('disabled', true);
                    }

                    var submitOptions = {
                        form_data: form_data,
                        submit_form: submit_form,
                        form_type: form_type,
                        interactions: $interactions,
                        is_scored: is_scored
                    };
                    
                    $button.click(function(e){
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // don't do anything if the button is disabled (means the form as not been answered)
                        if( $button.attr('disabled') === 'disabled' ) {
                            return;
                        }
                        
                        // submit the form
                        $form.submit_form_common(submitOptions);
                    });
                    
                    // if the form does not have a submit button submit the form when an answer is selected
                    if ( options.allow_hidden_save_button && $button.hasClass('e-hidden') ) {
                        $form.find('div.answer').on('selected', function () {
                            // submit the form
                            $form.submit_form_common(submitOptions);
                        });
                    }
                });
            });
        },
        submit_form_common: function(options) {
            
            var defaults = {
                form_data: null,
                submit_form : null,
                form_type : null,
                interactions: null,
                is_scored: null
            };

            options = $.extend(defaults, options);

            return this.each(function() {
                // options variables
                var form_data = options.form_data;
                var submit_form = options.submit_form;
                var form_type = options.form_type;
                var is_scored = options.is_scored;
                var $interactions = options.interactions;
                
                var $form = $(this);
                
                // go through each answer, find out if is_checked or not, and if the answer is correct. assume incorrect
                var form_outcome;
                var all_correct = true;
                var num_correct = 0;
                
                $interactions.each(function (i) {
                    var $interaction = $(this);
                    
                    // var question_data = $interaction.data('tracking_data');
                    var question_data = jQuery.extend({}, form_data[i]);
                    
                    // run form specific function to get correct answers
                    var submit_return = submit_form( $interaction, is_scored );
                    
                    // record selected answers
                    question_data.answer = submit_return.user_answer;
                    // record duration
                    var start_time = question_data.duration;
                    question_data.duration = (Date.now() - start_time);
                    
                    // if there is an outcome
                    if ( is_scored ) {
                        // get outcome
                        var interaction_outcome = submit_return.interaction_outcome;
                        
                        if (interaction_outcome === 'correct') {
                            num_correct++;
                        }
                        else if ( interaction_outcome === 'partially-correct') {
                            num_correct++;
                            all_correct = false;
                        }
                        else {
                            all_correct = false
                        }
                        
                        // record outcome
                        question_data.outcome = interaction_outcome;
                    } else if ( $form.hasClass('likert') ) {
                        // if the form is not scored 
                        question_data.score = submit_return.score;
                    }
                    
                    // add styling class
                    $interaction.removeClass( 'answered', 'answered-correct', 'answered-partially-correct', 'answered-wrong');
                    // add class according to the outcome
                    $interaction.addClass( is_scored ?  'answered-'+interaction_outcome : 'answered' );
                    
                    // only trigger complete on the last el - otherwise it submits too many times.
                    question_data.dont_send_complete = true;
                    if (i === $interactions.length-1) {
                        question_data.dont_send_complete = false;
                    }
                    
                    // trigger completion of element
                    $interaction.trigger('answered', question_data );
                });
                
                // if there are possibly correct answers and form type is not a survey
                if ( is_scored ) {
                    if (all_correct) {
                        form_outcome = 'correct';
                    }
                    else if (!all_correct && num_correct) {
                        form_outcome = 'partially-correct';
                    }
                    else {
                        form_outcome = 'incorrect';
                    }
                }
                else {
                    form_outcome = 'answered';
                }
                
                // add a styling class
                $form.addClass('e-form-submitted');
                
                // show the correct modal
                $form.show_form_modal({
                    form_type: form_type,
                    form_outcome: form_outcome,
                    is_scored: is_scored
                });
                
            });
        },
        show_form_modal: function(options) {

            var defaults = {
                form_type: null,
                form_outcome: null,
                is_scored: null
            };

            options = $.extend(defaults, options);

            return this.each(function() {
                var form_type = options.form_type;
                var form_outcome = options.form_outcome;
                var is_scored = options.is_scored;
                var $partial;
                var $form = $(this);
                
                // if form type is set use that to decide which popup to show
                // if the form is an 'individual feedback' show the modal that matches the selected answer
                if  ( $form.hasClass('e-form-individual-feedback') && form_type != 'assessment' ) {
                    var $chosen_answer = $form.find('.answer.selected');
                    
                    if ( $chosen_answer.length === 1 && $chosen_answer.attr('data-toggle') === 'modal' ) {
                        var data_target = $chosen_answer.attr('data-target');
                        
                        if (data_target) {
                            var $target_modal = $( data_target );
                            if ($target_modal.length) {
                                $target_modal.modal_show();
                            }
                        }
                    }
                    return false;
                }
                else if ( form_type ) {
                    // if form is an assessment do not display modal
                    if ( form_type === 'assessment' ) {
                        return false;
                    }
                    // if form is a survey display the generic modal
                    else if ( form_type === 'survey' || !is_scored ) {
                        if ($form.find('div.answered').length) {
                            $form.find('div.answered').modal_show();
                        }
                        else {
                            $form.find('div.answered_incorrect').modal_show();
                        }
                        return false;
                    }
                    // if form is a knowledge check look at form score and display the right modal
                    else if ( form_type === 'knowledge-check' ) {
                        if ( form_outcome === 'correct' ) {
                            $form.find('div.answered_correct').modal_show();
                        }
                        else if ( form_outcome === 'partially-correct' ) {
                            $partial = $form.find('div.answered_partially_correct');
                            // if the partially correct modal does not exist show the incorrect modal
                            $partial.length ? $partial.modal_show() : $form.find('div.answered_incorrect').modal_show();
                        }
                        else if ( form_outcome === 'incorrect' ) {
                            $form.find('div.answered_incorrect').modal_show();
                        }
                        else {
                            $form.find('div.answered_incorrect').modal_show();
                        }
                        return false;
                    }
                }
                // if form type is not set just do the old way
                else {
                    // if there is a generic feedback popup AND there are not correct answers - show generic popup
                    if ( $form.find('div.answered').length ) {
                        if ( $form.hasClass('poll') || !is_scored ) {
                            $form.find('div.answered').modal_show();
                            return false;
                        }
                    }
                    // if the selected answer is correct
                    if ( form_outcome === 'correct' ) {
                        $form.find('div.answered_correct').modal_show();
                    }
                    // if the selected answer is partially correct
                    else if ( form_outcome === 'partially-correct' ) {
                        $partial = $form.find('div.answered_partially_correct');
                        // if the partially correct modal does not exist show the incorrect modal
                        $partial.length ? $partial.modal_show() : $form.find('div.answered_incorrect').modal_show();
                    }
                    // if no correct answer was chosen
                    else if ( form_outcome === 'incorrect' ) {
                        $form.find('div.answered_incorrect').modal_show();
                    }
                    // if none of the above works show the incorrect popup
                    else {
                        $form.find('div.answered_incorrect').modal_show();
                    }
                    return false;
                }
                return false;
                
            });
        },
        update_form_status: function(options) {
            // used directly in form answer. run when an answer is clicked or text is typed in input

            var defaults = {
                is_answered: false
            };

            options = $.extend(defaults, options);

            return this.each(function() {
                var $form = $(this);
                var $save_button = $form.find('a.save_button, button.save_button');
                
                // if form is answered 
                if ( options.is_answered ) {
                    // add answered
                    $form.addClass('answered');
                    // enable the save button
                    $save_button.attr('disabled', false);
                }
                else {
                    // remove answered
                    $form.removeClass('answered');
                    // disable the save button
                    $save_button.attr('disabled', true);
                }
                
                // remove form status classes added when the form is submitted
                $form.removeClass('e-form-submitted');
                $form.removeClass('answered-correct');
                $form.removeClass('answered-partially-correct');
                $form.removeClass('answered-wrong');
            });
        }
    });
})(jQuery);

// Include: javascript/release/build/forms//jquery.drag_drop_handler.js
(function($){
    $.fn.extend({
        drag_drop_form: function(options) {
            
            var defaults = {
                previous_answer: []
            };
            options = $.extend(defaults, options);

            return this.each(function() {
                var $form = $(this);
                var $interactions = $form;
                var chosen_matching = {};
                
                // returns object with all the form data
                var set_interactions = function() {
                    // set up tincan reports
                    var form_data = {};
                    
                    if (options.previous_answer.length) {
                        // if there are previous answers add class answered to the form
                        // drag and drop form does not restore droppers to previous location
                        $form.addClass('answered')
                    }
                    
                    $interactions.each(function(i) {
                        
                        form_data[i] = {
                            'duration': Date.now(),
                            'interaction_type': 'matching',
                            'source': [],
                            'target': []
                        }
                        
                        // items should all have ids
                        var correct_matching = [];
                        
                        // find draggable items, and then find droppable items
                        var $draggable = $form.find( ".draggable" );
                        $draggable
                        .click(function (e) {
                            return false;
                        })
                        .each(function () {
                            var $this = $(this);
                            var id = $this.attr('id').replace(/pa_[a-z0-9]+_/i,'');
                            
                            form_data[i].source.push({
                                'id': id,
                                "description": {
                                    "en-US": $this.text().trim()
                                }
                            });
                            // before item is dragged, it is incorrect, unless it doesn't have an href
                            if ( $this.attr('href') && $this.attr('href').length > 1) {
                                $this.attr('data-status','incorrect');
                                // now track
                                var target_id = $this.attr('href').replace(/pa_[a-z0-9]+_/i,'').replace('#','');
                                correct_matching.push( id+'[.]'+target_id);
                                
                            } else {
                                $this.attr('data-status','correct');
                            }
                            
                            $('body').one('elucidat.page.ready',function() {
                                
                                var start_position_type = $this.css('position') == 'absolute' ? 'absolute' : 'relative';
                                // make draggable
                                // theses are the options for draggable elements
                                var draggable_options = {
                                    start: function( event, ui ) {
                                        // remove dragged marker
                                        ui.helper.removeAttr('data-status');
                                    },
                                    stop: function( event, ui ) {
                                        // if there is no data-status - and no href - we are correct
                                        if (!ui.helper.attr('data-status')) {
                                            if (ui.helper.attr('href') == '#')
                                            ui.helper.attr('data-status','correct');
                                            else
                                            ui.helper.attr('data-status','incorrect');
                                        }
                                    }
                                };
                                if ($form.hasClass('drag_revert'))
                                draggable_options.revert = "invalid";
                                
                                $this.draggable(draggable_options);
                            });
                        });
                        console.log('correct_matching', correct_matching)
                        // store correct if there are any and form type is not survey
                        if ( correct_matching.length ) {
                            form_data[i].correct_responses_pattern = [
                                correct_matching.join("[,]")
                            ];
                        }
                        
                        $form.find( ".droppable" ).each(function() {
                            // store reference
                            var $this = $(this);
                            var id = $this.attr('id').replace(/pa_[a-z0-9]+_/i,'');
                            form_data[i].target.push({
                                'id': id,
                                "description": {
                                    "en-US": $this.text().trim()
                                }
                            });
                        }).droppable({
                            accept: ".draggable",
                            activeClass: "ui-state-hover",
                            hoverClass: "ui-state-active",
                            drop: function( event, ui ) {
                                
                                var $this = $(this);
                                var target_id = $this.attr('id').replace(/pa_[a-z0-9]+_/i,'');
                                var source_id = ui.draggable.attr('id').replace(/pa_[a-z0-9]+_/i,'');
                                // store for report
                                chosen_matching[source_id] = target_id;
                                
                                // see if dropped item matches where it was dropped.
                                if ( $this.attr('id') == ui.draggable.attr('href').replace('#','')) {
                                    ui.draggable.attr('data-status','correct');
                                } else {
                                    ui.draggable.attr('data-status','incorrect');
                                } 
                                
                                // mark this item as dragged
                                ui.draggable.attr('data-dragged',true);
                                
                                var all_answered = true;
                                $draggable.each(function () {
                                    if (!$(this).attr('data-status'))
                                    all_answered = false;
                                });
                                if (all_answered)
                                $form.addClass('all_answered');
                                else
                                $form.removeClass('all_answered');
                                
                                // add answered once one has been dragged
                                $form.update_form_status({
                                    is_answered: true
                                })
                                
                                // if snap - snap the draggable to the center of the drop area
                                if ($form.hasClass('drag_snap')) {
                                    // find center point of drop area
                                    var dropper_offset = $this.offset();
                                    dropper_offset.top += $this.height() / 2;
                                    dropper_offset.left += $this.width() / 2;
                                    // find center point of dragger
                                    var dragger_offset = ui.draggable.offset();
                                    dragger_offset.top += ui.draggable.height() / 2;
                                    dragger_offset.left += ui.draggable.width() / 2;
                                    
                                    // find where dragger is now, relative to dropper
                                    ui.draggable.animate({
                                        left: '-=' + ( dragger_offset.left - dropper_offset.left ) + 'px',
                                        top: '-=' + ( dragger_offset.top - dropper_offset.top ) + 'px'
                                    },200);
                                }
                                // if helper - we need to move the original to the drop location, and animate in    
                            }
                        });
                    });
                    return {
                        form_data: form_data
                    }
                }
                
                // returns object with outcome and list of chosen answers.
                var submit_form = function( $interaction, is_scored ) {
                    // record the interaction outcome
                    var interaction_outcome;
                    // record selected answers
                    var user_answer = [];
                    // count the correct droppers
                    var correct_droppers = 0;
                    var all_correct = true;
                    
                    if ( is_scored ) {
                        
                        var dropper_is_correct;
                        // go through each dropper to find if correct or incorrect
                        $form.find('.draggable:visible').each(function () {
                            var $dropper = $(this);
                            dropper_is_correct = ( $dropper.attr('data-status') == 'correct' ? true : false );
                            
                            if ( dropper_is_correct ) {
                                correct_droppers++;
                            }
                            else {
                                all_correct = false;
                            }
                        });
                        
                        // find the form outcome
                        if (all_correct) {
                            interaction_outcome = 'correct';
                        }
                        else if (!all_correct && correct_droppers) {
                            interaction_outcome = 'partially-correct';
                        }
                        else {
                            interaction_outcome = 'wrong';
                        }
                    }
                    
                    for (var c in chosen_matching) {
                        user_answer.push( c+'[.]'+chosen_matching[c]);
                    }
                    
                    return {
                        user_answer: user_answer,
                        interaction_outcome: interaction_outcome
                    };
                }
                
                $form.form_common({
                    set_interactions : set_interactions,
                    submit_form: submit_form,
                    interactions: $interactions
                })
            });
        }   
    });
})(jQuery);

// Include: javascript/release/build/forms//jquery.fill_blank_answer.js

(function($){
    $.fn.extend({
        
        fill_blank_answer: function(options) {

            //Settings list and the default values
            var defaults = {
                previous_answer: []
            };
            
            var options = $.extend(defaults, options);

            return this.each(function() {

                // ignore if we have a parent that is '.add-option-template'
                if ( !$(this).closest('.add-option-template').length ) {
                    // every 'answer div is taken over'
                    // we ensure every input starts de-selected
                    // then on press of the parent, the input is toggled
                    // on input change, a class is toggled on the parent
                    var $blank = $(this);
                    var answer_id = $blank.attr('id');
                    var $form = $blank.closest('form');
                    
                    // find if it is a clickable questionnaire or text input
                    var input_type;
                    
                    
                    if (options.previous_answer && typeof options.previous_answer === 'object' &&  options.previous_answer.length) {
                        $form.addClass('answered');
                        
                        // loop through the previous answers
                        for (var i = 0; i < options.previous_answer.length; i++ ) {
                            
                            // find the previous answers interaction id
                            var previous_answer_id = options.previous_answer[i].interaction_id;
                            // console.log(previous_answer_id)
                            
                            // if the 'previous answer interaction ID' matches the 'current blank ID'
                            // get the previous answer and update the blank's val()
                            if ( answer_id === previous_answer_id ) {
                                var answer = options.previous_answer[i].answer[0];
                                $blank.val(answer)
                            }
                        }
                    }
                    
                    $blank.update_blank_status();
                    
                    // update when text input
                    $blank.keyup(function(event){
                        $blank.update_blank_status();
                        $form.fill_blank_update_form();
                    });
                    
                    $form.fill_blank_update_form();
                    
                }
            });
        },
        
        update_blank_status: function(options) {
            var defaults = {};
            var options = $.extend(defaults, options);
            
            return this.each(function() {
                var $blank = $(this);
                
                // check if the 'blank' has any text
                if ( !$.trim($blank.val()).length ) {
                    $blank.addClass('e-blank-empty');
                    $blank.removeClass('e-blank-filled');
                }
                else {
                    $blank.addClass('e-blank-filled');
                    $blank.removeClass('e-blank-empty');
                }
                $blank.removeClass('answered-correct');
                $blank.removeClass('answered-wrong');
            });
        },
        
        fill_blank_update_form: function(options) {
            var defaults = {};
            var options = $.extend(defaults, options);
            
            return this.each(function() {
                var $form = $(this);
                
                // check if there is at least one answered blank
                var blanks_filled = 0;
                
                var $siblings = $form.find('.e-blank-to-fill')
                
                $siblings.each(function(){
                    var $this = $(this);
                    if ( $this.hasClass('e-blank-filled') ){
                        blanks_filled++;
                    }    
                })
                
                if ( blanks_filled > 0 ){
                    $form.update_form_status({
                        is_answered: true
                    })
                }
                else {
                    $form.update_form_status({
                        is_answered: false
                    })
                }
            });
        }
    });

})(jQuery);

// Include: javascript/release/build/forms//jquery.fill_blanks_handler.js
( function($) {
    $.fn.extend({
        fill_blanks: function(options) {
            
            var defaults ={};
            options = $.extend(defaults, options);
            
            return this.each(function() {
                var $form = $(this);
                // find the blanks container
                var $blanks_container = $form.find('.fill_blanks_text');
                // find the blanks
                var $interactions = $blanks_container.find('input.e-blank-to-fill');
                
                // returns object with all the form data
                var set_interactions = function() {
                    // set up tincan reports
                    var form_data = {};
                    
                    $interactions.each(function(i) {
                        var $interaction = $(this);
                        
                        form_data[i] = {
                            'duration': Date.now(),
                            'interaction_type': 'fill-in'
                        };
                        
                        // store correct answer
                        var correct_answer_texts = $interaction.attr('data-correct-pattern').split(',');
                        for(var j=0; j<correct_answer_texts.length; j++) {
                            correct_answer_texts[j] = correct_answer_texts[j].trim().toLowerCase();
                        }
                        form_data[i].correct_responses_pattern = correct_answer_texts;
                    });
                    
                    return {
                        form_data: form_data
                    }
                }
                
                // returns object with outcome and list of chosen answers.
                var submit_form = function ( $interaction, is_scored ) {
                    // record selected answers
                    var user_answer = [];
                    user_answer.push( $interaction.val().trim().toLowerCase() );
                    
                    if ( is_scored ) {
                        // record the interaction outcome
                        var interaction_outcome;
                        
                        //compare to correct answers for blank with this id
                        var correct_answers = $interaction.attr('data-correct-pattern').split(',');
                        
                        // trim the answers
                        for(var j=0; j<correct_answers.length; j++) {
                            correct_answers[j] = correct_answers[j].trim().toLowerCase();
                        }
                        
                        // find if the user answer is in the list of correct answers
                        var answered_correct = false;
                        for (var c = 0; c<correct_answers.length; c++) {
                            if(user_answer == correct_answers[c]){
                                answered_correct = true;
                            }
                        }
                        
                        // find the interaction outcome
                        if( answered_correct ) {
                            interaction_outcome = 'correct';
                        }
                        else {
                            interaction_outcome = 'wrong';
                        }
                    }
                    
                    return {
                        user_answer: user_answer,
                        interaction_outcome: interaction_outcome
                    };
                }
                
                $form.form_common({
                    set_interactions : set_interactions,
                    submit_form: submit_form,
                    interactions: $interactions
                })
                
            });
        }
    });
})(jQuery);

// Include: javascript/release/build/forms//jquery.likert_handler.js
(function($){
    $.fn.extend({
        likert_form: function() {
            
            var defaults = {};

            return this.each(function( ) {
                var $form = $(this);
                var $fieldsets = $form.find('fieldset');
                
                var $interactions = $fieldsets.length > 1 ? $fieldsets : $form;
                
                // returns object with all the form data
                var set_interactions = function() {
                    // set up tincan reports
                    var form_data = {};
                    // variable to tell the main function if there are any correct answers
                    var is_scored = false;
                    
                    $interactions.each(function(i) {
                        var $interaction = $(this);
                        
                        form_data[i] = {
                            'duration': Date.now(),
                            'interaction_type': 'likert',
                            'scale': []
                        };
                        
                        // find the question (if there is a fieldset legend)
                        var $legend = $interaction.find('legend');
                        if ($legend.length) {
                            form_data[i].page_name = $legend.text();
                        }
                        
                        // array to store correct answer
                        var correct_answers = [];
                        // find the correct answer by looping all answers
                        $interaction.find('div.answer').each(function (){
                            var $answer = $(this);
                            var id = $answer.attr('id').replace(/pa_[a-z0-9]+_/i,'');
                            form_data[i].scale.push({
                                'id': id,
                                "description": {
                                    "en-US": $answer.text().trim()
                                }
                            });
                            if ($answer.attr('data-status') == 'correct') {
                                correct_answers.push( id );
                            }
                        });
                        // store correct
                        if ( correct_answers.length ) {
                            is_scored = true;
                            form_data[i].correct_responses_pattern = [
                                correct_answers.join("[,]")
                            ];
                        }
                    });
                    
                    return {
                        form_data: form_data,
                        is_scored: is_scored
                    };
                };
                
                // returns object with outcome and list of chosen answers.
                var submit_form = function( $interaction, is_scored ) {
                    // record selected answers
                    var user_answer = [];
                    // count the correct answers
                    var correct_answers = 0;
                    var all_correct = true;
                    
                    // if there is a correct answer - then we'll use the conventional scoring mode - based on correct / partially correct
                    var $answers = $interaction.find('div.answer:visible');
                    
                    // conventional mode
                    if ( is_scored ) {
                        var interaction_outcome;
                        // loop each answer
                        $answers.each(function () {
                            var $answer = $(this);
                            var $answer_input = $answer.find('input');
                            var answer_is_correct;
                            var is_checked;
                            
                            if ($answer.length) {
                                if ($answer_input.length) {
                                    // check the answer data-status
                                    answer_is_correct = ( $answer.attr('data-status') == 'correct' ? true : false );
                                    
                                    // see if it's checked
                                    is_checked = $answer_input.get(0).checked;
                                    
                                    // if checked store for tracking
                                    if ( is_checked ) {
                                        user_answer.push($answer.attr('id').replace(/pa_[a-z0-9]+_/i,''));
                                    }
                                    // now assess
                                    if ( is_checked && answer_is_correct ) {
                                        // if the chosen answer is correct then up the number of correct answers
                                        correct_answers++;
                                    }
                                    else if ( !answer_is_correct && !is_checked ) {
                                        // if the answer is incorrect and is not selected do nothing
                                    }
                                    else {
                                        // if a selected answers is incorrect
                                        // or if one of the unselected answers is correct
                                        // it means not all answers are correct
                                        all_correct = false;
                                    }
                                }
                            }
                        });
                        
                        // find the form outcome
                        if (all_correct) {
                            interaction_outcome = 'correct';
                        }
                        else if (!all_correct && correct_answers) {
                            interaction_outcome = 'partially-correct';
                        }
                        else {
                            interaction_outcome = 'wrong';
                        }
                        
                        return {
                            user_answer: user_answer,
                            interaction_outcome: interaction_outcome
                        };
                    }
                    else {
                        // otherwise - with scores - each answer is scored by position
                        // each answer is given a score
                        // first is highest (1), last is lowest (0)
                        // others are inbetween
                        var num_answers = $answers.length - 1;
                        var scaling_score = 0;
                        
                        $answers.each(function (i) {
                            var $answer = $(this);
                            var $answer_input = $answer.find('input');
                            
                            if ($answer.length) {
                                if ($answer_input.length) {
                                    // is chosen
                                    if ($answer_input.get(0).checked) {
                                        // if for is a likert - we also track a score
                                        if ($form.hasClass('likert')) {
                                            if ($answer.data('score') !== undefined) {
                                                // if we have a score set from the input slider
                                                scaling_score = parseFloat( $answer.data('score') );
                                            }
                                            else {
                                                // otherwise we'll set one by position
                                                scaling_score = 1 - ( i / num_answers);
                                            }
                                        }
                                        // record id of chosen answer
                                        user_answer.push($answer.attr('id').replace(/pa_[a-z0-9]+_/i,''));
                                    }
                                }
                            }
                        });
                        
                        return {
                            user_answer: user_answer,
                            score: scaling_score
                        };
                    }
                };
                
                $form.form_common({
                    set_interactions : set_interactions,
                    submit_form: submit_form,
                    interactions: $interactions
                });

            });
        }   
    });
})(jQuery);

// Include: javascript/release/build/forms//jquery.multiple_response_handler.js
(function($){
    $.fn.extend({
        multiple_response: function(options) {
            
            var defaults = {};
            options = $.extend(defaults, options);
            
            return this.each(function() {
                var $form = $(this);
                var $interactions = $form.find('tr.question');
                
                // returns object with all the form data
                var set_interactions = function() {
                    // set up tincan reports
                    var form_data = {};
                    
                    // get the text in the true / false table cells
                    var $header_tds = $form.find('table:first').find('tr:first').find('td,th');
                    var choices = [];
                    
                    $header_tds.each(function(i) {
                        var text = $(this).text().trim();
                        
                        if (i > 0 && text.length) {
                            choices.push({
                                'id': i,
                                "description": {
                                    "en-US": text
                                }
                            });
                        }
                    });
                    
                    // track data for each interaction
                    for (var i = 0; i < $interactions.length; i++) {
                        var $interaction = $($interactions[i]);
                        
                        form_data[i] = {
                            'duration': Date.now(),
                            'interaction_type': 'choice',
                            'choices': choices
                        };
                        
                        // find correct answer
                        // if correct answer is not defined then default to '1' (true)
                        $interaction.attr('data-status', ($interaction.attr('data-status')) ? parseInt($interaction.attr('data-status')) : 1);
                        var correct_answer = $interaction.attr('data-status');
                        // save to tracking
                        form_data[i].correct_responses_pattern = [ correct_answer ];
                    }
                    
                    return {
                        form_data: form_data
                    }
                }
                
                // returns object with outcome and list of chosen answers.
                var submit_form = function ( $interaction, is_scored ) {
                    // record selected answers
                    var user_answer = [];
                    
                    if ( is_scored ) {
                        // record the interaction outcome
                        var interaction_outcome;
                        // find correct answer - if data-status is not set then the default is '1' (true)
                        var correct_answer = $interaction.attr('data-status') ? parseInt($interaction.attr('data-status')) : 1;
                    }
                    
                    // loop throught the TR's TDs
                    $interaction.children().each(function(i) {
                        // if this is the right TD
                        var $answer_input = $(this).find('input');
                        
                        if ($answer_input.length) {
                            // if the input is checked - we're correct
                            var is_checked = $answer_input.get(0).checked;
                            
                            // if checked store for tracking
                            if ( is_checked ) {
                                // simply stores the number of the column
                                user_answer.push( i );
                            }
                            
                            // find the interaction outcome
                            if ( is_scored && correct_answer == i ) {
                                if ( is_checked ) {
                                    interaction_outcome = 'correct';
                                }
                                else {
                                    interaction_outcome = 'wrong';
                                }
                            }
                        }
                    });
                    
                    return {
                        user_answer: user_answer,
                        interaction_outcome: interaction_outcome
                    };
                }
                
                $form.form_common({
                    set_interactions: set_interactions,
                    submit_form: submit_form,
                    interactions: $interactions
                })
            });
        }   
    });
})(jQuery);

// Include: javascript/release/build/forms//jquery.questionnaire_answer.js

(function($){
    $.fn.extend({
        
        questionnaire_answer: function(options) {

            //Settings list and the default values
            var defaults = {
                previous_answer: []
            };
            options = $.extend(defaults, options);

            function updateAnswerStatus ($input, $answer) {
                var $form = $answer.closest('form');
                
                // if the input was checked
                if ($input.get(0).checked) {
                    $answer.addClass('selected');

                    // check if single choice (radio) rather than multiple choice (checkbox)
                    if ( $input.attr('type') === 'radio' ) {
                        var $answer_siblings = $answer.siblings().removeClass('selected');

                        //This remains to support legacy courses. Radio buttons used to all have unique
                        //name attributes so we'd deselect all the others manually each time the selection changed.
                        $answer_siblings.each(function () {
                            $(this).find('input').prop('checked', false);
                        });
                    }

                    // tell the form that it has been answered
                    $form.update_form_status({
                        is_answered: true
                    });

                    // trigger event to inform any sliders
                    $answer.trigger('selected');
                }
                // if the input was unchecked
                else {
                    $answer.removeClass('selected');
                    
                    // trigger event to inform any sliders
                    // if there is a slider it forces the answer to remain selected
                    $answer.trigger('unselected');
                    
                    // if the form is a likert force the check again because 
                    // there is always on option selected in likerts
                    if ($form.hasClass('likert')) {
                        updateAnswerStatus ($input, $answer);
                        return;
                    }

                    // see if there is any selected answer left in the form
                    var $selected_answers = $form.find('.answer.selected');
                    if ( !$selected_answers.length ) {
                        // if no selected answers are found disable the save button
                        $form.update_form_status({
                            is_answered: false
                        })
                    }

                }
            }


            return this.each(function() {

                // ignore if we have a parent that is '.add-option-template'
                if ( !$(this).closest('.add-option-template').length ) {
                    // every 'answer div is taken over'
                    // we ensure every input starts de-selected
                    // then on press of the parent, the input is toggled
                    // on input change, a class is toggled on the parent
                    var $answer = $(this);
                    var answer_id;
                    var $form = $answer.closest('form');
                    
                    // find if it is a clickable questionnaire or text input
                    var input_type;

                    var $input_wrapper = $answer.find('span.input');
                    var $blank_to_fill = $answer.hasClass('e-blank-to-fill');
                    
                    // questionnaire types with radio/checkbox type questions
                    if ($input_wrapper.length) {

                        $input_wrapper.form_input();

                        var $input = $input_wrapper.find('input');

                        if ($input.length) {

                            var start_selected = false;
                            // see if should be selected
                            if ($answer.first().prop('tagName') == 'TD') {
                                // question td mode - multiple response - this needs doing still
                                    // the answer will be a number (e.g. 1)
                                    // if this input is in the (e.g. 2nd td for '1' (0,1,2) td - then it would be selected)
                                // my number
                                if (options.previous_answer && options.previous_answer.length) {
                                    
                                    answer_id = $answer.parent().attr('id').replace(/pa_[a-z0-9]+_/i,'');
                                    var n = 0;
                                    var my_number = -1;
                                    $answer.parent().children().each(function () {
                                        if ( $(this).get(0) === $answer.get(0) )
                                            my_number = n;
                                        n++;
                                    });
                                    for (var i = 0; i < options.previous_answer.length; i++ ) {
                                        //console.log(answer_id +' == '+ options.previous_answer[i].answer);

                                        var answerKey = options.previous_answer[i].answer[0];

                                        if(typeof answerKey === 'string' && answerKey.indexOf('[:]') !== -1) {
                                            answerKey = answerKey.split('[:]')[0];
                                        }

                                        if (answer_id === answerKey) {
                                            start_selected = true;
                                        }

                                        if (answer_id == options.previous_answer[i].interaction_id && answerKey == my_number) {
                                            start_selected = true;
                                        }
                                    }
                                }

                            } else {
                                // normal div mode
                                answer_id = $answer.attr('id').replace(/pa_[a-z0-9]+_/i,'');
                                if (options.previous_answer && typeof options.previous_answer === 'object' &&  options.previous_answer.length) {
                                    
                                    //Loop through multiple parts on a single page
                                    for (var i = 0; i < options.previous_answer.length; i++ ) {

                                        if(typeof options.previous_answer[i].answer === 'object') {
                                            //Handle mulitple answers to a single question (multiple choice)
                                            for(var j=0; j<options.previous_answer[i].answer.length; j++) {

                                                var answerKey = options.previous_answer[i].answer[j];

                                                if(answerKey.indexOf('[:]') !== -1) {
                                                    answerKey = answerKey.split('[:]')[0];
                                                }

                                                if (answer_id === answerKey) {
                                                    start_selected = true;
                                                }
                                            }
                                        } else {
                                            if(options.previous_answer[i].answer.split('[:]')[0] === answer_id) {
                                                start_selected = true;
                                            }
                                        }

                                    }
                                } else if(typeof options.previous_answer === 'string') {
                                    if(options.previous_answer.split('[:]')[0] === answer_id) {
                                        start_selected = true;
                                    }
                                }
                            }
                            
                            // start unselected // unless in previous answers
                            $input.get(0).checked = start_selected;
                            if (start_selected) {
                                $answer.addClass('selected');
                                $form.addClass('answered');
                            }
                            
                            // add (and remove a class for focus)
                            $answer.focusin(function () {
                                $answer.addClass('has-focus');
                            });
                            $answer.focusout(function () {
                                $answer.removeClass('has-focus');
                            });

                            var timeout_;
                            var block_for_a_second = false;

                            /// input, label, and answer itself have separate actions
                            $input.bind('click', function (event) {
                                event.stopPropagation();
                            }).change(function () {
                                // update answer with right style
                                clearTimeout(timeout_);
                                timeout_ = setTimeout(function() {
                                    updateAnswerStatus($input, $answer);
                                },20);
                            });

                            // now do click on answer div
                            $answer.bind('click',function (event) {
                                // don't do too often
                                if (block_for_a_second)
                                    return false;

                                block_for_a_second = true;
                                setTimeout(function () { block_for_a_second = false; }, 250);

                                // otherwise it was the div
                                if ( $(this).hasClass('selected') )
                                    $input.get(0).checked = false;
                                else
                                    $input.get(0).checked = true;

                                clearTimeout(timeout_);
                                timeout_ = setTimeout(function() {
                                    updateAnswerStatus($input, $answer);
                                },20);

                                // don't pass on click
                                event.preventDefault();
                                event.stopPropagation();

                            });

                        }
                    }
                    // if the form is fill in the blanks
                    else if ( $blank_to_fill ) {
                        // get the answer id
                        answer_id = $answer.attr('id');
                        
                        if (options.previous_answer && typeof options.previous_answer === 'object' &&  options.previous_answer.length) {
                            
                            // loop through the previous answers
                            for (var i = 0; i < options.previous_answer.length; i++ ) {
                                
                                // find the previous answers interaction id
                                var previous_answer_id = options.previous_answer[i].interaction_id;
                                // console.log(previous_answer_id)
                                
                                // if the 'previous answer interaction ID' matches the 'current blank ID'
                                // get the previous answer and update the blank's val()
                                if ( answer_id === previous_answer_id ) {
                                    var answer = options.previous_answer[i].answer[0];
                                    $answer.val(answer)
                                }
                            }
                        }
                    }

                }
            });
        }
    });

})(jQuery);

// Include: javascript/release/build/forms//jquery.questionnaire_handler.js
(function($){
    $.fn.extend({
        questionnaire_form: function() {

            return this.each(function() {
                var $form = $(this);
                var $interactions = $form
                
                // returns object with all the form data
                var set_interactions = function() {
                    // set up tincan reports
                    var form_data = {};
                    // variable to tell the main function if there are any correct answers
                    var is_scored = false;
                    
                    $interactions.each(function(i) {
                        var $interaction = $(this);
                        
                        form_data[i] = {
                            'duration': Date.now(),
                            'interaction_type': 'choice',
                            'choices': []
                        };
                        
                        // check answers
                        var correct_answers = [];
                        $interaction.find('div.answer').each(function() {
                            var $answer = $(this);
                            var id = $answer.attr('id').replace(/pa_[a-z0-9]+_/i,'');
                            form_data[i].choices.push({
                                'id': id,
                                "description": {
                                    "en-US": $answer.text().trim()
                                }
                            });
                            if ($answer.attr('data-status') == 'correct') {
                                // if the answer's data-status is correct add it to the list of correct answers
                                correct_answers.push( id );
                            }
                        });
                        // store correct answers
                        if (correct_answers.length) {
                            is_scored = true;
                            form_data[i].correct_responses_pattern = [
                                correct_answers.join("[,]")
                            ];
                        }
                    });
                    
                    return {
                        form_data: form_data,
                        is_scored: is_scored
                    }
                };

                // returns object with outcome and list of chosen answers.
                var submit_form = function( $interaction, is_scored ) {
                    // record the interaction outcome
                    var interaction_outcome;
                    // record selected answers
                    var chosen_answers = [];
                    // count the correct answers
                    var correct_answers = 0;
                    var all_correct = true;
                    
                    // evaluate each answer
                    $interaction.find('div.answer:visible').each(function () {
                        var $answer = $(this);
                        var $answer_input = $answer.find('input');
                        var answer_is_correct;
                        var is_checked;

                        if ($answer.length) {
                            if ($answer_input.length) {
                                // check the answer data-status
                                answer_is_correct = ( $answer.attr('data-status') === 'correct' );

                                // see if it's checked
                                is_checked = $answer_input.get(0).checked;

                                // if checked store for tracking
                                if ( is_checked ) {
                                    chosen_answers.push($answer.attr('id').replace(/pa_[a-z0-9]+_/i,''));
                                }
                                // now assess
                                if ( is_checked && answer_is_correct ) {
                                    // if the chosen answer is correct then up the number of correct answers
                                    correct_answers++;
                                }
                                else if ( !answer_is_correct && !is_checked ) {
                                    // if the answer is incorrect and is not selected do nothing
                                }
                                else {
                                    // if a selected answers is incorrect
                                    // or if one of the unselected answers is correct
                                    // it means not all answers are correct
                                    all_correct = false;
                                }
                            }
                        }
                    });
                    
                    // find the interaction outcome
                    if ( is_scored ) {
                        if (all_correct) {
                            interaction_outcome = 'correct';
                        }
                        else if (!all_correct && correct_answers) {
                            interaction_outcome = 'partially-correct';
                        }
                        else {
                            interaction_outcome = 'wrong';
                        }
                    }
                    
                    return {
                        user_answer: chosen_answers,
                        interaction_outcome: interaction_outcome
                    };
                };
                
                $form.form_common({
                    set_interactions : set_interactions,
                    submit_form: submit_form,
                    allow_hidden_save_button: true,
                    interactions: $interactions
                })
            });
        }
    });
})(jQuery);

// Include: javascript/release/build/forms//jquery.sortable_handler.js
(function($){
    $.fn.extend({
        sortable_form: function(options) {
            
            var defaults = {
                previous_answer: []
            };
            options = $.extend(defaults, options);
            
            return this.each(function() {
                var $form = $(this);
                var $interactions = $form;
                // find the sortable container
                var $ol = $form.find('ol:first');
                // items should all have ids
                var correct_order = [];
                
                // returns object with all the form data
                var set_interactions = function() {
                    // set up tincan reports
                    var form_data = {};
                    var choices = [];
                    
                    // loop sortable items
                    $ol.children().each(function (i) {
                        var $sortable_item = $(this);
                        var sortable_item_id = $sortable_item.attr('id').replace(/pa_[a-z0-9]+_/i,'');
                        
                        choices.push({
                            'id': sortable_item_id,
                            "description": {
                                "en-US": $sortable_item.text().trim()
                            }
                        });
                        
                        correct_order.push(sortable_item_id);
                    });
                    
                    // track data for each interaction
                    for (var i = 0; i < $interactions.length; i++) {
                        var $interaction = $($interactions[i]);
                        
                        form_data[i] = {
                            'duration': Date.now(),
                            'interaction_type': 'sequencing',
                            'choices': choices,
                            'correct_responses_pattern': correct_order.join('[,]')
                        };
                    }
                    
                    // if there are previous answers, get the previous order and arrange the items by that same order
                    if (options.previous_answer && typeof options.previous_answer === 'object' &&  options.previous_answer.length) {
                        // if there are previous answers add class answered to the form
                        $form.addClass('answered');
                        
                        // create array with the order of the previous answer
                        var $previous_order = [];
                        // loop the previous answers to populate the previous order array
                        for (var i = 0; i < options.previous_answer.length; i++ ) {
                            if(typeof options.previous_answer[i].answer === 'object') {
                                for(var j=0; j<options.previous_answer[i].answer.length; j++) {
                                    // get the ID
                                    var item_id = options.previous_answer[i].answer[j];
                                    // find the item whose ID ends with 'item_id'
                                    var $item = $ol.find('[id$="' + item_id + '"]')
                                    // push item to previous order array
                                    $previous_order.push($item)
                                    // detach item (temove from DOM but keep data)
                                    $item.detach();
                                }
                            }
                        }
                        // append items back to the DOM in the previous order
                        for (var j = 0; j < $previous_order.length; j++) {
                            $ol.append($previous_order[j][0])
                        }
                    }
                    // if there are no previous answers randomize the sortable list
                    else {
                        // randomize order of form
                        $ol.randomize();
                    }
                    
                    // turn gestures off as it conflicts
                    $('body').one('elucidat.page.open', function () {
                        $('#pew').gestures("disable");
                        $ol.sortable({
                            change: function( event, ui ) {
                                $form.update_form_status({
                                    is_answered: true
                                })
                            },
                            appendTo: '#pew',
                            containment: '#paw',
                            scroll: false,
                            helper: 'clone'
                        });
                    });
                    
                    return {
                        form_data: form_data
                    }
                }
                
                // returns object with outcome and list of chosen answers.
                var submit_form = function( $interaction, has_outcome ) {
                    // record the interaction outcome
                    var interaction_outcome;
                    // record selected answers
                    var user_answer = [];
                    // count the correct droppers
                    var correct_answers = 0;
                    var all_correct = true;
                    
                    // loop sortable items
                    $ol.children().each(function (i) {
                        var id = $(this).attr('id').replace(/pa_[a-z0-9]+_/i,'');

                        user_answer.push(id);
                        
                        if ( has_outcome ) {
                            var answer_is_correct = ( id == correct_order[i] ? true : false );
                            
                            if ( answer_is_correct ) {
                                correct_answers++;
                            } else {
                                all_correct = false;
                            }
                        }

                    });
                    
                    // find the form outcome
                    if ( has_outcome ) {
                        if (all_correct) {
                            interaction_outcome = 'correct';
                        }
                        else if (!all_correct && correct_answers) {
                            interaction_outcome = 'partially-correct';
                        }
                        else {
                            interaction_outcome = 'wrong';
                        }
                    }
                    
                    return {
                        user_answer: user_answer,
                        interaction_outcome: interaction_outcome
                    };
                }
                
                $form.form_common({
                    set_interactions : set_interactions,
                    submit_form: submit_form
                })
            });
        }
    });
})(jQuery);

// Include: javascript/release/build/page_complete//jquery.carousel_complete.js



(function($){
    $.fn.extend({
        carousel_complete: function(options) {
        
            //Settings list and the default values
            var defaults = {};
            var options = $.extend(defaults, options);
            
            return this.each(function() {
                
                var $carousel = $(this);
                var page_parts = {};

                $carousel.trigger('completable_section').addClass('e-completable-section');

                // set up the item
                $carousel.find('.item').each(function () {
                    var $item = $(this);
                    // @todo - this does not work where the $item is visible already - consider new approach based on .active class
                    page_parts[ $item.attr('id') ] = ($item.is(':visible') && $item.height()?true:false);
                });

                // and listen for the show
                $carousel.on('slid', function (event) {
                    var active = $carousel.find('.item.active').attr('id');
                    if (active) {
                        
                        page_parts[ active ] = true;
                        
                        // see if all parts have been seen
                        var complete = true;
                        for (var t in page_parts)
                            if (!page_parts[t])
                                complete = false;

                        // send complete event if so
                        if (complete)
                            $carousel.trigger('section_complete');

                    }
                });
                
            });
        }   
    });
        
})(jQuery);
// Include: javascript/release/build/page_complete//jquery.collapse_complete.js
(function($){
    $.fn.extend({
        collapse_complete: function(options) {

            //Settings list and the default values
            var defaults = {};
            var options = $.extend(defaults, options);

            return this.each(function() {

                var $collapse = $(this);

                if($collapse.prop("tagName") === 'A') {
                    //The selector that calls this wil have already initialised any div.collapse elements so we don't need to do it here.
                    if($collapse.parent().hasClass('collapse')) {
                        return;
                    }
                    $collapse = $collapse.parent();
                }



                if ($collapse.hasClass('answered_incorrect') ||
                    $collapse.hasClass('answered_correct') ||
                    $collapse.hasClass('answered_partially_correct') ||
                    $collapse.hasClass('answered')) {
                    return;
                }

                // and listen for the show
                $collapse.on('shown', function () {
                    // If the collapsible div contains a video then do not trigger
                    // section_complete - the video will do that later
                    if ( !$collapse.find('.media.video').length ) {
                        $collapse.trigger('section_complete');
                    }
                });

                //Sections that are visible when the page loads will never be showen so don't track them as viewable sections.
                //We have to wait briefly here in case there is a fade when the page is shown.
                setTimeout(function() {
                    if (!$collapse.is(':visible') || !$collapse.height() || parseFloat( $collapse.css('opacity') ) === 0) {
                        $collapse.trigger('completable_section').addClass('e-completable-section');
                    }
                }, 250);


            });
        }
    });

})(jQuery);

// Include: javascript/release/build/page_complete//jquery.modal_complete.js



(function($){
    $.fn.extend({
        modal_complete: function(options) {
        
            //Settings list and the default values
            var defaults = {};
            var options = $.extend(defaults, options);
            
            return this.each(function() {
                
                var $collapse = $(this);
                
                if (!$collapse.hasClass('answered_incorrect') && !$collapse.hasClass('answered_correct') && !$collapse.hasClass('answered_partially_correct') && !$collapse.hasClass('answered')) {
                    // set up the item
                    // if not visible
                    if (!$collapse.is(':visible') || !$collapse.height()) {
                        // init
                        $collapse.trigger('completable_section').addClass('e-completable-section');
                        // IF the collapse or modal has completable sections itself - then we wait for 
                        // whatever the sub-item is before we complete
                        // slight delay to let the completable sections to be registered
                        // (as the event is on close there's no great hurry)
                        setTimeout(function () {
                            // if there are no child completable sections - add a close listener 
                            var $completable = $collapse.find('.e-scorable-section,.e-completable-section');
                            if (!$completable.length) {
                                // and listen for the modal to hide
                                $collapse.on('hidden.bs.modal', function () {
                                    $collapse.trigger('section_complete');
                                });
                            // and if there are - when any of the completable bits are complete - 
                            // we also need to complete the modal
                            } else {
                                $completable.on('section_complete',function () {
                                    $collapse.on('hidden.bs.modal', function () {
                                        $collapse.trigger('section_complete');
                                    });
                                });
                            }
                            
                            // Now finally add a trigger to pause video and audio
                            $collapse.on('hidden.bs.modal', function () {
                                $collapse.find('div.video_player').video('pause');
                                $collapse.find('div.audio_player').audio('pause');
                            });
                        },100);
                    }
                }
                
            });
        }   
    });
        
})(jQuery);

// Include: javascript/release/build/page_complete//jquery.tabs_complete.js



(function($){
    $.fn.extend({
        tabs_complete: function(options) {
        
            //Settings list and the default values
            var defaults = {};
            var options = $.extend(defaults, options);
            
            return this.each(function() {
                var $collapse = $(this);
                if (!$collapse.is(':visible') || !$collapse.height()) {
                    // init
                    $collapse.trigger('completable_section').addClass('e-completable-section');
                    // find the related link
                    var pane_id = $collapse.attr('id');
                    $collapse.parents('#paw').find('a[href=#'+pane_id+']').on('shown', function () {
                        // mark this one as complete
                        $collapse.trigger('section_complete');
                    });
                }
            });
        }   
    });
        
})(jQuery);
// Include: javascript/release/build/plugins//jquery.audio.js

(function($){

    var audio_id_overall = 0;
    
    var ua = window.navigator.userAgent.toLowerCase(),
        isiPad = (ua.match(/ipad/i) !== null),
        isiPhone = (ua.match(/iphone/i) !== null),
        isAndroid = (ua.match(/android/i) !== null),
        isMobile = isiPhone || isiPad || isAndroid,
        isIE9 = $('html').hasClass('ie9') || $('html').hasClass('ie8');
        //
        
    $.fn.extend({
        audio_destroy: function(options) {
            return this.each(function() {
                var $audio_player = $(this);
                if ( $('html').hasClass('ie8') && $audio_player.get(0).player)
                    $audio_player.get(0).player.remove();
                // remove has audio flag
                $audio_player.parent().removeClass('e-has-audio');

            });
        },
        audio: function(input_options) {
            // pause
            if (input_options == 'pause') {
                return this.each(function() {
                    var $audio_player = $(this);
                    if ($audio_player.parent().hasClass('e-has-audio') && $audio_player.data('player'))
                        $audio_player.data('player').pause();
                });
            }

            var options = $.extend({}, $.fn.audio.defaults, input_options);

            // this is a bit of a hack - but if there are non-visible video players, we trigger a resize to make sure their size updates
            var done_resize = false;
            
            return this.each(function() {
                // find the html, which should be json
                var $audio_player = $(this);
                // don't reinitialise
                if (!$audio_player.parent().hasClass('e-has-audio')) {
                    
                    // tell the app that this can be completed
                    $audio_player.trigger('completable_section').addClass('e-completable-section');

                    if (!$audio_player.is(':visible')) {
                        // delay until the video player is visible - then show it
                        var cant_wait_forever = 0;
                        var wait_until_visible = setInterval(function () {
                            if ($audio_player.is(':visible')) {
                                if (!$audio_player.find('.mejs-container').length) {
                                    // if not there already - pass back to itself
                                    $audio_player.audio( input_options );
                                } else {
                                    // otherwise - trigger a resize
                                    if (!done_resize) {             
                                        $(window).trigger('resize','completed');
                                        done_resize = true;
                                    }
                                }
                                clearInterval(wait_until_visible);
                            }

                            cant_wait_forever++;
                            if (cant_wait_forever > 30)
                                clearInterval(wait_until_visible);
                        },100);

                    // if visible already
                    } else {
                        var audio_object;
                        // increment the id
                        audio_id_overall++;
                        var audio_id = audio_id_overall;

                        if ($audio_player.attr('data-media')) {
                            audio_object = $audio_player.attr('data-media').split(':');
                        } else {
                            $audio_player.attr('data-media', $audio_player.text());
                            audio_object = $audio_player.text().split(':');
                        }
                        $audio_player.empty();

                        var track = '';
                        // if we have a second parameter, then that is a captioning file
                        if ($audio_player.attr('data-caption')) {
                            var caption_object = JSON.parse($audio_player.attr('data-caption'));
                            if (caption_object && caption_object.captions) {
                                for (var t = 0; t < caption_object.captions.length; t++)
                                    track += '<track kind="subtitles" label="'+caption_object.captions[t].name+'" src="'+caption_object.captions[t].url+'" srclang="'+getSrcLang(caption_object.captions[t].name)+'" />';// 
                            }
                        }

                        if (audio_object[0] == 'audio') {
                            var audio_url = (audio_object[1]+(audio_object[2]?':'+audio_object[2]:'')).replace('~[^a-z0-9\.\_\-\:\/]~gi','');

                            if (audio_url) {

                                var audio_id_array = audio_url.split('/');
                                //var audio_id = audio_id_array[audio_id_array.length-1].replace('.mp4','');

                                var base_url = audio_url.substring(0, audio_url.lastIndexOf("."));

                                var html = '<audio class="e-mejs-player" id="audio'+ (audio_id) +'" src="'+base_url +'.mp3" preload="none">'+//'
                                    //'<source src="'+ base_url +'.mp4" type="audio/mp4" />' +
                                    //'<source src="'+ base_url +'.ogg" type="audio/ogg" />' +
                                    //'<source src="'+ base_url +'.mp3" type="audio/mp3" />' +
                                    track +
                                '</audio>';

                                $audio_player.html( html );

                                if (options.allowAutoplay && $audio_player.parent().attr('data-autoplay') == 'yes')
                                    $audio_player.find('audio').attr('autoplay',true);

                                var me_delay = isIE9 ? 1000 : 0;
                                setTimeout(function () {

                                    var assetFilePath = '/static';
                                    if(typeof e !== 'undefined') {
                                        if(e.elucidat.options.mode === 'scorm') {
                                            assetFilePath = 'https://learning.elucidat.com' + assetFilePath;
                                        } else if(e.elucidat.options.mode === 'offline') {
                                            assetFilePath = 'vendor'
                                        }
                                    }
                                    var player = new MediaElementPlayer( '#audio'+audio_id, {
                                        //mode: 'shim',
                                        audioWidth: $audio_player.width(),
                                        flashName: 'flashmediaelement-cdn-2.22.0.swf',
                                        pauseOtherPlayers: false,
                                        autoRewind: false,
                                        loop: $audio_player.parent().attr('data-loop') == 'yes' ? true : false,
                                        //autoplay: (options.allowAutoplay && $audio_player.parent().attr('data-autoplay') == 'yes'? true : false),
                                        pluginPath: assetFilePath + '/mediaelement/',
                                        success: function (mediaElement, domObject) { 
                                            // add event listener
                                            if (mediaElement) {
                                                // add event listener
                                                mediaElement.addEventListener('ended', function(e) {
                                                    // mark completion       
                                                    $audio_player.trigger('audio_complete').trigger('section_complete'); 
                                                }, false);
                                            }
                                        },
                                        enableKeyboard: options.enableKeyboard

                                    });

                                    $audio_player.data('player', player);

                                },me_delay);

                                // add a class to container
                                $audio_player.parent().addClass('e-has-audio');

                            }

                        }

                    }

                }
            });
        }   
    });

    //Settings list and the default values
    $.fn.audio.defaults = {
        enableKeyboard: true,
        allowAutoplay: true
    };
        
})(jQuery);

// Include: javascript/release/build/plugins//jquery.charts.js

(function($){

    function check_graph_style ( $chart ) {
        // console.log($chart)
        // create a temporary element to extract the styles from the colorways
        // var $style_helper = $('<span class="e-graph-style-helper"></span>');   
        var $placeholder_key = $('<span class="key e-hide"></span>');
        var $placeholder_key_item = $('<span class="item"></span>');
        var $style_helper = $('<div class="e-graph-style-helper"></div>');
        $placeholder_key.append($placeholder_key_item, $style_helper);
        $chart.append($placeholder_key);
        
        // get the style from the helper
        // the font size needs to be only the value, without the px
        var font_color = $placeholder_key_item.css('color');
        var font_size = parseInt($placeholder_key_item.css('font-size'));
        var font_family = $placeholder_key_item.css('font-family');
        // assume it is not responsive (old default)
        // if helper height is 1px make responsive = true
        var is_responsive = false;
        is_responsive = ($style_helper.css('height') == '1px') ? true : false;
        
        // remove the helper
        $placeholder_key.remove();
        
        return {
            graph_is_responsive: is_responsive,
            graph_font_color: font_color,
            graph_font_size: font_size,
            graph_font_family: font_family
        };
    }

    function populateBar ( options ) {
        return {
            labels : options.labels,
            datasets : [
                {
                    fillColor : options.colors[0],
                    data : options.data
                }
            ]
        };
    }

    function populatePie ( options ) {
        var return_data = [];
        for (var i = 0; i < options.data.length; i++) {
            return_data.push({
                value: options.data[i],
                color: options.colors[i] ? options.colors[i] : options.colors[0]
            });
        }
        return return_data;
    }

    function makeLabels ( options ) {
        var $item = $('<div class="key"></div>'), $key;
        for (var i = 0; i < options.data.length; i++) {
            $key = $( '<div class="item"><span class="color"></span> <span class="text">'+options.labels[i]+'</span> <span class="value"></span></div>' );
            $key.find('span.color').css({
                'background-color': options.colors[i] ? options.colors[i] : options.colors[0]
            });
            $key.find('span.value').text('(' + options.data[i] + ')');
            $item.append($key);
        }
        return $item;
    }

    function howYouAnswered(clip) {
        // Takes a clip and returns a string showing the learner's responses to a given page or question.
        // clips can be in the format chart:1:586bb7fa0035c:question-1 or chart:1:586bb7fa0035c
        // question_id is used to get the response to a specific row in either a likert or multi response. https://docs.google.com/document/d/1sB6y7_4H7kONj7NkqJxGmO2sHJu4JVv5YzwRUxiHc5o/edit#bookmark=id.svzorutw8sn4
        //TODO: support multiple question parts on the same page.

        var split = clip.split(':'),
            page_id = split[2],
            page = e.elucidat.pages[page_id],
            answer_id = split[3];

        //should output a text list of all the learners answers for all questions on the page.
        var how_you_answered_arr = [];
        for(var i = 0; i<page.answer.length; i++) {
            // If we are looking for a specific answer id (the clip has specified one) then only add that one,
            // otherwise add all the answers.
            var pageAnswers = page.answer[i].answer;
            var currentAnswerLessPartCode = page.answer[i].interaction_id.substring(page.answer[i].interaction_id.indexOf('-') + 1);

            if(answer_id === currentAnswerLessPartCode || !answer_id) {

                var answerTexts = [];
                for (var j = 0; j < pageAnswers.length; j++) {
                    answerTexts.push(pageAnswers[j].split('[:]')[1]);
                }
                how_you_answered_arr.push(answerTexts.join([', ']));

                //if we are looking for a specific answer id and we found it, stop looking.
                //TODO: Known issue: multiple questions on a page (but in different parts) can share the same id...
                //...any further answers with this ID won't be displayed.
                if(answer_id === currentAnswerLessPartCode) {
                    break;
                }
            }
        }
        return how_you_answered_arr.join('. ');
    }

    $.fn.extend({
        charts: function( Elucidat ) {
            

            return this.each(function() {
                var $this = $(this);
                // console.log('this', $this)

                // now populate real data, if we have it
                // if we have it, the last bit of this item's id should refer to 
                
                
                var achievement_parts = $this.attr('data-chart') ? $this.attr('data-chart') : $this.attr('id');
                achievement_parts = achievement_parts.split(':');
                // if length is 4 - we have a question id
                var achievement_id, question_id;

                if (achievement_parts.length === 4) {
                    achievement_id = achievement_parts[ achievement_parts.length - 2];
                    question_id = achievement_parts[ achievement_parts.length - 1];
                } else
                    achievement_id = achievement_parts[ achievement_parts.length - 1];

                var total = 0;
                var same_as_you = 0;

                if (Elucidat) {
                    if (achievement_id) {
                        var page = null;
                        // is either an achievement id OR a page_od
                        var page_id = Elucidat.achievements [ achievement_id ];
                        if (page_id)
                            page = Elucidat.pages [ page_id ];
                        else
                            page = Elucidat.pages [ achievement_id ];
                            
                        if (page) {
                            if (page.answer.length) {
                                // otherwise we choose 0
                                var answer_num = 0;
                                var answer_choices;
                                if (question_id) {
                                    // we search through the array of answer choices to find the right one
                                    for ( var a = 0; a < page.answer.length; a++) {
                                        if (page.answer[a].interaction_id == question_id) {
                                            answer_num = a;
                                            break;
                                        }
                                    }
                                }

                            }

                            if (page.answers) {
                         
                                var page_answers;
                                // If PAGE.ANSWERS is empty, then put in some fake data -so that preview works
                                if ( $.isEmptyObject (page.answers) ) {
                                    page_answers = {
                                        graph1: {
                                            '1[:]Answer 1': Math.floor(Math.random() * 60) + 1,
                                            '2[:]Answer 2': Math.floor(Math.random() * 60) + 1,
                                            '3[:]Answer 3': Math.floor(Math.random() * 60) + 1,
                                            '4[:]Answer 4': Math.floor(Math.random() * 60) + 1,
                                            '5[:]Answer 5': Math.floor(Math.random() * 60) + 1,
                                            '6[:]Answer 6': Math.floor(Math.random() * 60) + 1
                                        }
                                    };
                                } else {
                                    page_answers = jQuery.extend(true, {}, page.answers);
                                }
                                
                                // console.log(page_answers);
                                
                                var graphs = [ ];
                                for(var q in page_answers) {
                                    if(page_answers.hasOwnProperty(q)) {
                                        var answers = page_answers[q];
                                        
                                        var opts = {
                                            labels: [],
                                            data: []
                                        };

                                        for(var label in answers) {
                                            if(answers.hasOwnProperty(label)) {
                                                var num = parseInt(answers[label]);
                                                opts.data.push(num);
                                                opts.labels.push(label.split('[:]')[1]);
                                                total += num;

                                                // answerTexts.push(label.split('[:]')[1]);
                                                // set same_as_you to be the number of people that have the same answer as you.

                                                for(var k = 0; k<page.answer.length; k++) {
                                                    if(page.answer[k].interaction_id === q) {
                                                        for(var l=0; l<page.answer[k].answer.length; l++) {
                                                            var answerText = page.answer[k].answer[l];
                                                            if(answerText) {
                                                                same_as_you = page_answers[page.answer[k].interaction_id][answerText];
                                                                console.log(same_as_you);
                                                            }
                                                        }
                                                    }
                                                }

                                            }
                                        }
                                        graphs.push(opts);
                                    }
                                }
                            }
                        } 
                    }
                }

                if ($this.hasClass('score')) {
                    if (isNumber(page.score)) 
                        $this.text( Math.round( page.score * 100 ) + '%' );
                    else
                        $this.text( '0%' );

                } else if ($this.hasClass('score_raw')) {
                    if (isNumber(page.score)) 
                        $this.text( Math.round( page.score * page.weighting ) );
                    else
                        $this.text( '0' );

                } else if ($this.hasClass('same_as_you_number')) {
                    $this.text(same_as_you);

                } else if ($this.hasClass('total')) {
                    $this.text(total);

                } else if ($this.hasClass('same_as_you_percentage')) {
                    if (total && same_as_you) {
                        $this.text( Math.round( 100 / total * same_as_you ) + '%' );//.toFixed(1)
                    } else {
                        $this.text( '0%' );
                    }

                } else if ($this.hasClass('how_you_answered')) {
                    //if (how_you_answered)
                        $this.text( howYouAnswered($this.attr('id')));

                } else if ($('html').hasClass('ie-lt9')) {
                    return; //Don't attempt to show graphs on IE8...
                }

                if($this.hasClass('chart') && graphs !== undefined) {
                    $this.empty();
                    $this.graph_build(graphs);
                }
            });
        },
        
        graph_build: function(graphs) {
            
            var swatches = [];
            var $parent = $(this).parent();
            function colorSwatches () {
                
                // create a temporary span to extract the colours from the colorways
                for (var i = 1; i <= 6; i++) {
                    var $swatch = $('<span class="graphSwatch graphSwatch--' + i + '"></span>');                    
                    $parent.append($swatch);
                    var swatch_color = $swatch.css('background-color');
                    // console.log(swatch_color)
                    $swatch.remove();
                    
                    // only add the colour to the swatches if it is not transparent
                    if (swatch_color !== 'rgba(0, 0, 0, 0)' && swatch_color !== 'transparent') {
                        swatches.push(swatch_color)
                    }
                }
                return swatches;
            }
            
            return this.each(function() {
                var $this = $(this);

                for(var i = 0; i<graphs.length; i++) {

                    var options = graphs[i];
                    // console.log('options',options);
                    // and populate colors, if we have it
                    if ($this.attr('data-colors'))
                        options.colors = $this.attr('data-colors').replace(/[^a-f0-9#\,]/gi, '').split(',');
                    
                    else {
                        options.colors = colorSwatches();
                        
                        if (!options.colors.length)
                            options.colors = [ "#69D2E7","#E0E4CC","#F38630", "#C7604C", "#21323D", "#9D9B7F", "#7D4F6D", "#584A5E" ];
                    }
                    
                    // chart of results
                    var chart_id = $this.attr('id') + '__chart';
                    // inside the div - create a canvas (taking the width and height from the object)
                    var $canvas = $('<canvas id="' + chart_id + '"></canvas>');

                    $this.append($canvas);

                    if ($canvas.width()) {
                        $canvas.attr('width', $canvas.width());
                    }
                    if ($canvas.height()) {
                        // console.log($canvas.height())
                        $canvas.attr('height', $canvas.height());
                    }
                    // see if we have a width and height (from CSS - otherwise use  width="'+($this.width()?$this.width():200)+'" height="'+($this.height()?$this.height():200)+'")

                    // now we'll attempt to get the chart options
                    var graph_style = check_graph_style( $this );
                    // console.log(graph_style)
                    
                    var chart_options = {
                        responsive: graph_style.graph_is_responsive,
                        scaleFontColor: graph_style.graph_font_color,
                        scaleFontSize: graph_style.graph_font_size,
                        scaleFontFamily: graph_style.graph_font_family,
                        tooltipFontSize: graph_style.graph_font_size,
                        tooltipTitleFontFamily: graph_style.graph_font_family,
                        tooltipCaretSize: 4,
                        maintainAspectRatio: false,
                        animationEasing: "easeOutQuad",
                        animationSteps: 60
                    };
                    
                    // console.log(chart_options)
                    if ($this.attr('data-options')) {
                        try {
                            chart_options = JSON.parse($this.attr('data-options').replace(/\'/g, '"'));
                        } catch (e) {
                            console.log(chart_id + ': data-options seems to be invalid json');
                        }
                    }

                    var chart_defaults = {
                    };

                    var ctx = $canvas.get(0).getContext("2d");


                    if ($this.hasClass('line')) {
                        chart_defaults = {
                            pointDot: false,
                            datasetStroke: false,
                            maintainAspectRatio: false
                        };
                        chart_options = $.extend(chart_defaults, chart_options);
                        new Chart(ctx).Line(populateBar(options), chart_options);


                    } else if ($this.hasClass('bar')) {
                        chart_defaults = {
                            barShowStroke: false,
                            maintainAspectRatio: false
                        };
                        chart_options = $.extend(chart_defaults, chart_options);
                        new Chart(ctx).Bar(populateBar(options), chart_options);

                    } else if ($this.hasClass('radar')) {
                        chart_defaults = {
                            pointDot: false
                        };
                        chart_options = $.extend(chart_defaults, chart_options);
                        new Chart(ctx).Radar(populateBar(options), chart_options);
                        $this.append(makeLabels(options));

                    } else if ($this.hasClass('polar')) {
                        chart_defaults = {
                            segmentShowStroke: false
                        };
                        chart_options = $.extend(chart_defaults, chart_options);
                        new Chart(ctx).PolarArea(populatePie(options), chart_options);
                        $this.append(makeLabels(options));

                    } else if ($this.hasClass('pie')) {
                        chart_defaults = {
                            segmentShowStroke: false
                        };
                        chart_options = $.extend(chart_defaults, chart_options);
                        new Chart(ctx).Pie(populatePie(options), chart_options);
                        $this.append(makeLabels(options));

                    } else if ($this.hasClass('doughnut')) {
                        chart_defaults = {
                            segmentShowStroke: false
                        };
                        chart_options = $.extend(chart_defaults, chart_options);
                        new Chart(ctx).Doughnut(populatePie(options), chart_options);
                        $this.append(makeLabels(options));

                    }
                }
                
            });
        }
    });
        
})(jQuery);

// Include: javascript/release/build/plugins//jquery.form_input.js

(function($){

    var form_item_id = 0;

    $.fn.extend({
        form_input: function(options) {
        
            //Settings list and the default values
            var defaults = {};
            
            var options = $.extend(defaults, options);
            
            return this.each(function() {
                // find the html, which should be json
                var $item = $(this);
                var field_object = $item.html().split(':');
                var $form = $item.parents('form');
                
                if ((field_object[0] == 'checkbox' || field_object[0] == 'radio') && field_object[1]) {
                    var name = field_object[1].replace('~[^a-z0-9\_\-]~gi','');
                    if (name) {
                        // make a unique form id for radio buttons
                        form_item_id++;
                        var id = 'field_'+form_item_id;

                        //Radio's names should not be unique, whereas checkboxes should.
                        if(field_object[0] === 'radio') {
                            name = name.split('-')[0];
                            
                            if ( $form.hasClass('likert') ) {
                                var question_number = $item.parents('fieldset').index();
                                name = name+'-'+question_number;
                            }
                            else if ( $form.hasClass('multiple_response') ) {
                                var question_number = $item.parents('tr').index();
                                name = name+'-'+question_number;
                            }
                        }

                        $item.html('<input type="'+field_object[0]+'" name="'+name+'" id="'+id+'" />');
                        
                        // now find the closest label, and tag the two together
                        var $label;
                        // look to the brothers
                        $label = $item.siblings('label').first();
                        
                        // now cousins
                        if (!$label.length)
                            $label = $item.parent().parent().find('label').first();
                        // and now 2nd cousins 
                        if (!$label.length)
                            $label = $item.parent().parent().parent().find('label').first();

                        if ($label.length)
                            $label.attr('for', id);
                        
                    }
                }
                $(this).show();
            });
        }   
    });
        
})(jQuery);

// Include: javascript/release/build/plugins//jquery.ie8poly_bg_size.js
(function($){


    $.fn.extend({
        ie8poly_bg_size: function() {

            return this.each(function() {

                var $this = $(this);
                var bgSize = ie8bg.getBgSize($this[0]);

                // If the element doesnt have background-size then go away.
                if(!bgSize || bgSize === 'auto') {
                    return;
                }

                var elOuterHeight = $this.outerHeight();
                var elOuterWidth = $this.outerWidth();
                var elHeight = $this.height();

                //Set element to be relative so we can position stuff within it.
                if($this.css('position') === 'static') {
                    $this.css({'position' : 'relative'});
                }

                var bgImg, $elBgImg, $elBgContainer, $elContentContainer,$elContentSpacer;

                //We set this later to prevent creating more nested elements every time this is run.
                if(!$this.data('bg-size-done')) {

                    var bgImageUrl = ie8bg.getImagePath($this.css('background-image'));
                    if(!bgImageUrl) {
                        return;
                    }

                    bgImg = new Image();

                    bgImg.onload = function() {
                        onloadBgImg($this);
                    };
                    //Make a new image element with src the same as the background.
                    bgImg.src = bgImageUrl;

                } else {
                    onloadBgImg($this);
                }

                function onloadBgImg($this) {
                    if(!$this.data('bg-size-done')) {

                        $this.data('imgWidth',bgImg.width);
                        $this.data('imgHeight', bgImg.height);
                        $elBgImg = $(bgImg);
                        $elBgContainer = $('<div class="e-poly-bg-container"/>'); //Will contain the background image
                        $elContentContainer = $('<div class="e-poly-content-container" />'); //will contain whatever the original div contained.
                        $elContentSpacer = $('<div class="e-poly-spacer" />');

                        // Wrap existing content in a container so it
                        // can sit on top of the bg image.
                        $elContentContainer
                            .html($this.html());

                        // style the background image container, the bg image will sit inside it.
                        $elBgContainer.css({
                            'position': 'absolute',
                            'top': 0,
                            'bottom': 0,
                            'left': 0,
                            'right':0,
                            'overflow': 'hidden'
                        });

                        if(ie8bg.debug) {
                            $elBgContainer.css({
                                'background-color': 'rgb(255,0,0)'
                            });
                        }

                        $elBgImg.css({
                            'position': 'absolute'
                        });

                        //replace the content of the element with the wrapped content.
                        $this.html($elContentContainer);
                    } else {

                        $elBgContainer = $('> .e-poly-bg-container', $this); //Will contain the background image
                        $elContentContainer = $('> .e-poly-content-container', $this);
                        $elBgImg = $('img', $elBgContainer);
                        $elContentSpacer = $('> .e-poly-spacer', $this);
                        //bgImg = $elBgImg.get(0);
                        // imgWidth = bgImg.width;
                        // imgHeight = bgImg.height;

                    }

                    $elContentContainer
                        .css({
                            'position': 'absolute',
                            'top' : 0,
                            'bottom' : 0,
                            'left' : 0,
                            'right' : 0,
                            // 'height' : elHeight,
                            'padding': $this.css('padding')
                        });

                    // console.log('1 ####### ' + $elContentContainer.children().first().height() + ' or ' + elHeight);
                    $elContentSpacer
                        .css({
                            'height': $elContentContainer.children().first().height() || elHeight
                        });

                    // Depending on the value of the background-size property we need to position the
                    // new inner image differently.
                    var size;
                    switch(bgSize) {
                        case 'cover':
                            size = ie8bg.calculateAspectRatioCover($this.data('imgWidth'),$this.data('imgHeight'),elOuterWidth,elOuterHeight);
                            $elBgImg.css({
                                'width': size.width,
                                'height': size.height
                            });

                            break;

                        case 'contain':
                            size = ie8bg.calculateAspectRatioContain($this.data('imgWidth'),$this.data('imgHeight'),elOuterWidth,elOuterHeight);
                            $elBgImg.css({
                                'width': size.width,
                                'height': size.height
                            });

                            break;

                        default:
                            var sizeArray = bgSize.split(' ');

                            $elBgImg.css({
                                'width': sizeArray[0],
                                'height': sizeArray[1]
                            });

                            break;
                    }

                    if(!$this.data('bg-size-done')) {

                        //Let's not make all these elements twice!
                        $this.data('bg-size-done', true);

                        // Put the image in the container.
                        $elBgContainer.prepend($elBgImg);

                        // Prevent the background image showing behind the emulated bg image.
                        $this.css({
                            'background-image' :'none'
                        });

                        // Put the container and spacer in the original elem.
                        $this
                            .prepend($elBgContainer)
                            .prepend($elContentSpacer);
                    }

                    //This next bit relies on getting the size of the element so sadly we have
                    // to do these last few bits after the el has been added to the dom.
                    var pos = ie8bg.getBgPos($this[0]);

                    var marginLeft = 0,
                        marginTop = 0;

                    //CSS positions the background with the center of the image as the origin.
                    //Using negative margin to offset the image.

                    if(pos.x.indexOf('%')!==-1 && pos.x !== '0%') {
                        //Margin left needs to be negative pos.x % of the width of the image.
                        marginLeft = 0-($elBgImg.width()*(parseFloat(pos.x)/100))
                    }

                    if(pos.y.indexOf('%')!== -1 && pos.y !== '0%') {
                        //Margin top needs to be negative pos.y % of the height of the image.
                        marginTop = 0-($elBgImg.height()*(parseFloat(pos.y)/100))
                    }

                    $elBgImg.css({
                        'left': pos.x,
                        'top': pos.y,
                        'margin-left': marginLeft,
                        'margin-top': marginTop
                    });

                }

            });
        }
    });

})(jQuery);

var IE8_Bgsize = function (  ) {
    this.elems = [];
    this.debug = false;
};

IE8_Bgsize.prototype.getElems = function() {
    return $(this.elems);
};

IE8_Bgsize.prototype.updateElems = function() {
    if(this.debug || this.isIE()) {
        var allElemsOnPage = document.body.getElementsByTagName("*");
        for (var i = allElemsOnPage.length; i--;) {
            var loopedElem = allElemsOnPage[i];
            //Add all elems with background-size property that have not been polyfilled already.
            if(this.getBgSize(loopedElem)) {
                if(!$(loopedElem).data('bg-size-done')) {
                    this.elems.push(loopedElem);
                }
            }
        }
    }
    return this;
};


//IE8 hack to get background-size.
IE8_Bgsize.prototype.getBgSize = function(elem) {
    if(!this.debug || this.isIE()) {
        return  elem.style['background-size'] || elem.currentStyle['background-size'] || elem.style.getAttribute('backgroundSize') || elem.currentStyle.getAttribute('backgroundSize');
    } else {
        //if not IE, we can just use jQuery like a normal person. (should only be here if debugging).
        var bgSizeprop = $(elem).css('background-size');
        return bgSizeprop === 'auto' ? false : bgSizeprop;
    }
};

//IE8 hack to get background-position - 'elem' must be native dom elem, not jquery object.
IE8_Bgsize.prototype.getBgPos = function(elem) {
    if(!this.debug || this.isIE()) {
        var x = elem.style['background-position-x'] ||
            elem.currentStyle['background-position-x'] ||
            elem.style.getAttribute('backgroundPositionX') ||
            elem.currentStyle.getAttribute('backgroundPositionX');
        var y = elem.style['background-position-y'] ||
            elem.currentStyle['background-position-y'] ||
            elem.style.getAttribute('backgroundPositionY') ||
            elem.currentStyle.getAttribute('backgroundPositionY');
        return {x:x, y:y}
    }
    //if not IE (should really only be here if debugging.
    return {x:$(elem).css('background-position-x'), y: $(elem).css('background-position-y')};
};

IE8_Bgsize.prototype.isIE = function() {
    return $('html').hasClass('no-backgroundsize');
};

IE8_Bgsize.prototype.getImagePath = function(bgCssValue) {
    //Take string like url('http://google.com') and remove all but the actual url.

    var url = bgCssValue.match(/^url\("?(.+?)"?\)$/);
    if(ie8bg.debug) {
        var dt = new Date();
        return url[1] + '?' + dt.getTime();
    }
    if(url && url.length > 1) {
        return url[1];
    }
    return false;
};

IE8_Bgsize.prototype.calculateAspectRatioCover = function(srcWidth, srcHeight, maxWidth, maxHeight) {
    var ratio = Math.max(maxWidth / srcWidth, maxHeight / srcHeight);

    return { width: srcWidth*ratio, height: srcHeight*ratio };
};

IE8_Bgsize.prototype.calculateAspectRatioContain = function(srcWidth, srcHeight, maxWidth, maxHeight) {
    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

    return { width: srcWidth*ratio, height: srcHeight*ratio };
};

var ie8bg = new IE8_Bgsize();

// EXAMPLE
// $(document).ready(function() {
//
//     //Only do stuff in IE (or if debuggin').
//     if(!ie8bg.debug && !ie8bg.isIE() && !ie8bg.isBadIE()) {
//     } else {
//         ie8bg.updateElems().getElems().ie8poly_bg_size();
//     //
//     //     // IRL you'd wanna debounce this.
//         $(window)
//             .resize(function() {
//                 ie8bg.updateElems().getElems().ie8poly_bg_size();
//             })
//     }
// //
// });
// Include: javascript/release/build/plugins//jquery.input_slider.js

(function($){

    $.fn.extend({
        input_slider: function(input_options) {
            var options = $.extend({}, $.fn.audio.defaults, input_options);

            return this.each(function() {
                // make a slider, with values equivalent to the .answers that are it's siblings
                // find all of the sibling answers
                var $this = $(this);
                var $answers = $this.siblings('.answer');
                // if no answers - also check the parent
                if (!$answers.length)
                    $answers = $this.parent().find('.answer');

                if ($answers.length) {
                    var answers = [];
                    var num = 0;
                    var selected = 0;
                    var orientation = $this.attr('data-orientation') ? $this.attr('data-orientation') : 'horizontal';
                    var direction = $this.attr('data-mode') ? $this.attr('data-mode') : 'rtl';

                    $answers.each(function () {
                        var $a = $(this);
                        answers.push($a);
                        if ($a.find('input').get(0).checked)
                            selected = num;
                        // save number for later
                        $a.data('position', num);
                        // and put a score on each item
                        var score = 1 / ($answers.length-1) * num;
                        if (direction != 'ltr')
                            score = 1 - score;
                        $a.data('score', score);
                        // increment
                        num++;
                    });
                    // make sure first answer is selected (because a slider always has something selected)
                    if (!selected) {
                        if (direction == 'ltr') {
                            answers[ answers.length - 1 ].addClass('selected').find('input').get(0).checked = true;
                        } else {
                            answers[0].addClass('selected').find('input').get(0).checked = true;
                        }
                    }
                    var start_val = selected;
                    if (orientation == 'vertical' || direction == 'ltr')
                        start_val = answers.length - start_val;

                    // make sure change event is not fired if change comes from the input event
                    var change_is_from_input = false;
                    // init the slider
                    
                    // calculate the width of the slider based on the number of answers
                    $this.css('width', (100/(answers.length)) * ((answers.length)-1) + '%');
                    
                    $this.addClass('e-slider-items-'+(answers.length)).slider({
                        min: 0,
                        max: answers.length - 1,
                        value: start_val,
                        step: 1,
                        range: "min",
                        orientation: orientation,
                        start: function () {
                            // disable gestures when sliding
                            $('#pew').gestures("disable");
                        },
                        stop: function () {
                            // disable gestures when sliding
                            $('#pew').gestures("enable");
                        },
                        change: function (event, ui) {
                            // do not do change event
                            if (!change_is_from_input) {
                                // move event target 
                                $answers.each(function() {
                                    $(this).removeClass('selected').find('input').prop('checked', false);
                                });

                                var chosen = ui.value;
                                if (orientation == 'vertical')
                                    chosen = answers.length - 1 - chosen;

                                // find the answer with that key, and click the 
                                answers [ chosen ].addClass('selected').find('input').prop('checked', true);

                                // and add a styling class
                                var $form = $answers.parents('form');
                                $form.addClass('answered');
                                
                                // find save button to make sure it is enabled
                                var $save_button = $form.find('a.save_button, button.save_button');
                                $save_button.attr('disabled', false);
                            }
                        }
                    });

                    $answers.on('selected',function (e) {
                        var position = parseInt($(e.target).data('position'));
                        if (orientation == 'vertical')
                            position = answers.length - 1 - position;
                        // stop event telling input to change
                        change_is_from_input = true;
                        $this.slider('value', position);
                        change_is_from_input = false;
                    
                    }).on('unselected',function (e) {
                        // likerts always a selected. so reselect
                        $(this).addClass('selected').find('input').get(0).checked = true;
                    });
                }
            });
        }   
    });

    //Settings list and the default values
    $.fn.input_slider.defaults = {};
        
})(jQuery);

// Include: javascript/release/build/plugins//jquery.learner_input.js


(function($){
    var inputs = {};
    //
    $.fn.extend({
        learner_input: function( preentered_options ) {
            // save initial values
            inputs = preentered_options;
            // 
            return this.each(function() {
                // each input gets registered
                // when it changes, the variable gets changed
                // then the blockquotes live update
                var $input = $(this);
                // set the initial value
                $input.val( inputs[ $input.attr('name') ] );
                // 
                $input.change(function () {
                    // strip any dodginess
                    var $val = $('<div></div>');
                        $val.html( $input.val() );
                    // store the input
                    var attr_name = $input.attr('name');
                    inputs[ attr_name ] = $val.text();
                    // change any blockquotes to match
                    $('span.learner_input[data-input="'+attr_name+'"]').text( inputs[ attr_name ] );
                    // now fire off to the LRS to save
                    $input.trigger('elucidat.learner.input', [ attr_name, inputs[ attr_name ] ] );
                });
            });
        },
        learner_output: function() {
            return this.each(function() {
                // cache
                var $this = $(this);
                // change any blockquotes to match
                $this.text( inputs[ $this.attr('data-input') ] );
            });
        }  
    });
        
})(jQuery);

// Include: javascript/release/build/plugins//jquery.score-summary.js

(function($){
    var score_total = 0;

    function decimalPlaces(num) {
        var match = (''+num).match(/(?:\.(\d+))/);
        if (!match) {
            return 0;
        }
        return Math.max(
            0,
            // Number of digits right of decimal point.
            (match[1] ? match[1].length : 0)
        );
    }
    
    $.fn.extend({
        
        score_summary: function(options) {
            //Settings list and the default values
            var defaults = {
            };
            
            options = $.extend(defaults, options);
            
            return this.each(function() {
                // define needed variables
                var $this = $(this);
                var page_code, page_data;
                
                // find the table
                var $summary_table = $this.find('.scoreSummary__table');
                
                // // build the table head
                // var table_head = $summary_table.find('.scoreSummary__head');
                // var $thead = $('<thead></thead>');
                // 
                // table_head.remove();
                // $summary_table.prepend($thead);
                // $thead.append(table_head);
                
                var $table_footer = $summary_table.find('.scoreSummary__footer');
                var $tfoot = $('<tfoot></tfoot>');
                
                $table_footer.remove();
                
                // build the table body
                var $tbody = $summary_table.find('tbody');
                // find the template rows
                var $chapter_row = $summary_table.find('.scoreSummary__row--chapter');
                var $question_row = $summary_table.find('.scoreSummary__row--question');
                
                // define the template rows
                var $chapter_row_template = $($chapter_row);
                var $question_row_template = $($question_row);
                
                // remove the template rows
                $chapter_row.remove();
                $question_row.remove();
                
                // total weightning will later be used convert the page weighting into percentage
                var total_weighting = 0;
                // loop through all pages of the course to calculate
                for (var i = 0; i < e.elucidat.page_order.length; i++ ) {
                    page_code = e.elucidat.page_order[i];
                    page_data = e.elucidat.pages[ page_code ];
                    
                    // if the page is not hidden, has a score and weighting
                    // add it's weighting to the total weighting in order to later convert it to a percentage
                    if (!page_data.hidden) {
                        if (page_data.has_score && page_data.weighting) {
                            total_weighting += page_data.weighting;
                        }
                    }
                }
                
                
                score_total = 0;
                
                // loop through all pages of the course
                for (var j = 0; j < e.elucidat.page_order.length; j++ ) {
                    page_code = e.elucidat.page_order[j];
                    page_data = e.elucidat.pages[ page_code ];
                    // console.log(page_data);
                    
                    if ( page_data.is_section && !page_data.hidden || page_data.has_score && !page_data.hidden) {
                        
                        // if the page reached is the start of a chapter add a chapter row
                        if ( page_data.is_section ) {
                            
                            // if it is a chapter look at it's children to see if any of them is scored
                            // if there are no scored children do not add a row for this chapter
                            var page_children = page_data.children;
                            
                            // only add the chapter if it is a scored page
                            // or if at least one of the children is a scored page
                            var add_this_chapter = false;
                            
                            if (page_data.has_score) {
                                // if the chapter start itself is scored then add it
                                add_this_chapter = true;
                            }
                            else if (page_children) {
                                // if the chapter start is not scored and it has children assume negative
                                var add_this_chapter = false;
                                
                                // check it's children to see if any of them is scored
                                for (var k = 0; k < page_children.length; k++ ) {
                                    var children_data = e.elucidat.pages[ page_children[k] ];
                                    
                                    if (children_data.has_score && !add_this_chapter) {
                                        //if any of the children is scored then add the chapter row
                                        add_this_chapter = true;
                                    }
                                }
                            }
                            
                            if (add_this_chapter) {
                                $chapter_row_template.build_chapter_row({
                                    page_data : page_data,
                                    page_code : page_code,
                                    summary_table : $summary_table
                                });
                            }
                        }
                        // if the page reached has a score add a row
                        if ( page_data.has_score) {                            
                            $question_row_template.build_question_row({
                                page_data : page_data,
                                total_weighting : total_weighting,
                                summary_table : $summary_table
                            });
                        }
                    }
                }
                
                $summary_table.append($tfoot);
                $tfoot.append($table_footer);
                var $totalScore = $table_footer.find('.totalScore');
                var find_bold = $totalScore.find('strong');
                
                $totalScore.text(Math.round(score_total));
                
                if ( find_bold ) {
                    $totalScore.wrap('<strong>')
                }
                
            });
        },
        build_chapter_row: function(options) {
            var defaults = {
                page_data : null,
                page_code : null,
                summary_table : null
            };
            
            options = $.extend(defaults, options);
            
            return this.each(function() {
                var $template = $(this);
                var page_data = options.page_data;
                var page_code = options.page_code;
                var $summary_table = options.summary_table;
                
                // click action for the page link
                var click_action = function(e) {
                    // get the page code
                    var page_code = $(this).attr('href').replace('#','');
                    Elucidat.navigate(page_code);
                    return false;
                };
                
                // clone the template
                var $row = $template.clone();
                
                // add content to the row
                // add title
                var $row_title = $row.find('.scoreSummary__chapterTitle');
                var $row_title_text =  $row_title.find('.text');
                $row_title_text.text(page_data.name);
                
                // add link
                var $row_link = $row.find('.e-chapter-link');
                $row_link.attr('href', page_code).click( click_action );
                
                // append the row to the table
                $summary_table.append($row);
            });
        },
        build_question_row: function(options) {
            var defaults = {
                page_data : null,
                page_code : null,
                total_weighting : null,
                summary_table : null
            };
            
            options = $.extend(defaults, options);
            
            return this.each(function() {
                var $template = $(this);
                var page_data = options.page_data;
                var total_weighting = options.total_weighting;
                var $summary_table = options.summary_table;
                
                // find how many questions the page has
                // this is object is only created after visiting the page
                var $questions = page_data.answer;
                
                // $questions is only populated after the page is visited
                // if it doesn't exit yet assume there is one question on the page
                var questions_on_page = 1;
                
                if (!$questions || $questions.length == 0) {
                    questions_on_page = 1
                }
                else if ($questions.length) {
                    questions_on_page = $questions.length;
                }
                
                // loop through each question on the page
                // create a row for each question
                for (var l = 0; l < questions_on_page; l++) {
                    // find the question on the page
                    
                    if ($questions) {
                        var $question = $questions[l];
                    }
                    // console.log('questions on page ' + questions_on_page)
                    
                    // clone the template
                    var $row = $template.clone();
                    
                    // add content to the row
                    // add title
                    var $row_title = $row.find('.scoreSummary__title');
                    var $row_title_text =  $row_title.find('.text');
                    $row_title_text.text(page_data.name);
                    
                    // if there is more than one question add a suffix to identify the question number
                    if ( questions_on_page > 1 ) {
                        var question_indentify = '<span>(Question ' + l + ')</span>'
                        $row_title_text.append(question_indentify);
                    }
                    
                    var $row_score = $row.find('.scoreSummary__score');
                    var $row_weighting = $row.find('.scoreSummary__weighting');
                    
                    // if the page has been visited use the question score instead of the page score
                    var $score = $question ? $question.score : page_data.score;
                    // console.log(score)
                    // add score
                    $row_score.check_row_score({
                        score: $score
                    });
                    // add weighting
                    $row_weighting.weight_calc({
                        total_weighting: total_weighting,
                        page_weighting: page_data.weighting,
                        questions_on_page: questions_on_page,
                        score: $score
                    });
                    
                    // append the row to the table
                    $summary_table.append($row);
                }
            });
        },
        
        check_row_score: function(options) {
            //Settings list and the default values
            var defaults = {
                score : null
            };
            
            options = $.extend(defaults, options);
            
            return this.each(function() {
                var score = options.score;
                var $score_cell = $(this);
                
                var $ti = $score_cell.find('.ti');
                var ti_class = 'ti ti-close';
                var result = 'e-answered-incorrect';
                var title = 'Incorrect';
                
                if (score == 1) {
                    ti_class = 'ti ti-check';
                    result = 'e-answered-correct';
                    title = 'Correct';
                }
                else if (score > 0) {
                    ti_class = 'ti ti-check';
                    result = 'e-answered-partially-correct';
                    title = 'Partially Correct';
                }
                else if ( score === null || score === false) {
                    ti_class = 'ti ti-minus';
                    result = 'e-not-answered';
                    title = 'Page not visited';
                }
                
                // append the result icon with the corresponding class
                $ti.attr('class','');
                $ti.addClass( ti_class ).attr('title', title);
                // add the result class to the parent row
                $score_cell.closest( 'tr' ).addClass( result );
            });
        },
        weight_calc: function(options) {
            //Settings list and the default values
            var defaults = {
                total_weighting: 0,
                page_weighting: 0,
                questions_on_page: 1,
                score: 0
            };
            options = $.extend(defaults, options);
            
            return this.each(function() {
                //define needed variables
                var $weight_cell = $(this);
                var total_weighting = options.total_weighting;
                var page_weighting = options.page_weighting;
                var questions_on_page = options.questions_on_page;
                var score = options.score;
                
                // calculate the weighting as a percentage
                var weight_percent = (100 / (total_weighting / page_weighting));
                // divide by the number of questions on the page
                weight_percent = weight_percent / questions_on_page;
                // multiple by the question score
                weight_percent = weight_percent * score;
                score_total = score_total + weight_percent;
                
                // console.log(weight_percent)
                // maximum 1 decimal
                
                $weight_cell.text( '' );
                if (weight_percent % 1 != 0) {

                    // maximum 2 decimal places
                    var decimal_places = decimalPlaces(weight_percent);
                    if (decimal_places > 2) {
                        decimal_places = 2;
                    }
                    // round to the number of decimal places
                    weight_percent = weight_percent.toFixed(decimal_places);
                    
                    
                    var split_num = weight_percent.split('.');
                    var intt = split_num[0];
                    var dec = split_num[1];
                    
                    $weight_cell.text( '' );
                    $weight_cell.append( intt + '.' + '<small>' + dec + '</small>' );
                }
                else {
                    $weight_cell.append( weight_percent );
                }
                
            });
        }
    });
})(jQuery);    

// Include: javascript/release/build/plugins//jquery.tooltip_extended.js

(function($){
    var popovers = [];
    //
    $.fn.extend({
        tooltip_extended: function( options ) {
            // 
            return this.each(function() {

                var $link = $(this);

                if (options === 'destroy') {
                    // clear active popovers
                    for (var i = 0; i < popovers.length; i++)
                        popovers[i].popover('destroy');
                    popovers = [];

                    $link.find('.e-popover').each(function () {
                        $(this).stop().remove();
                    });

                } else {

                    // if has data-tooltip - it is a new style tooltip with title and text
                    if ($link.attr('data-tooltip')) {

                        var string_data = $link.attr('data-tooltip').replace(/&amp;/ig,'&').replace(/&quot;/ig,'"').replace(/&gt;/ig,'>').replace(/&lt;/ig,'<');
                        // this is actually a popover
                        var json_data = JSON.parse( string_data );
                        $link.popover({
                            'trigger': 'manual',
                            'html': true,
                            'placement': 'top',
                            'content': json_data.text,
                            'title': json_data.title,
                            'container': '#pew'
                        });
                        $link.on('mouseover focus', function () {
                            // clear active popovers
                            for (var i = 0; i < popovers.length; i++) {
                                if (popovers[i].get(0) !== $link.get(0) )
                                    popovers[i].popover('hide');
                            }

                            $link.popover('show');
                        });
                        // get the poover object
                        var $popover = $link.data('popover').tip();
                        $popover.addClass('e-popover');
                        // close
                        var $close = $('<button type="button" class="close">&times;</button>');
                        $popover.prepend($close);

                        $close.click(function () {
                            $link.popover('hide');
                        });

                        // store list of active ones
                        popovers.push( $link )

                    // otherwise it will be a title (old style one)
                    } else {
                        // is bootstrap default - so let it go
                        $link.tooltip();

                    }
                }
            });
        }
    });
        
})(jQuery);
// Include: javascript/release/build/plugins//jquery.video.js


// IF the user has entered a language in mejs.language.codes, we'll look up the srcLang
// otherwise it'll be a caption, so we'll make one up
// This is not allowed in the HTML spec, but until media element is updated it is the only way to get captions to work
// HACK!
var getSrcLang = (function($){
    var src_lang_int = 0;
    return function  (label) {
        for (var c in mejs.language.codes)
            if (mejs.language.codes[c] == label)
                return c;
        src_lang_int++;
        return 'en'+src_lang_int;
    }
}());

/**** Brightcove Learning Services Module ****/
// ON LOAD METHOD - triggers finish
var BCLS = (function () {
    // variables
    var player,
        APIModules,
        captionsEvent,
        mediaEvent,
        videoPlayer,
        captionsModule;

    var caption_data = {};
    
    function onMediaComplete(e) {
        // trigger page complete
        $('#'+e.target.experience.id).parent().trigger('section_complete');
    }
    // public functions and data
    return {
        /**** template loaded event handler ****/
        saveCaptionData : function ( id, caption) {
            caption_data [ id ] = caption;
        },
        /**** template loaded event handler ****/
        onTemplateLoad : function (experienceID) {

            // FIX FOR ANDROID FULLSCREEN
            var el = document.getElementById(experienceID);
            if (el.tagName === 'IFRAME') {
                el.setAttribute('allowfullscreen', 'allowfullscreen');
            }
            
            // cache id of player
            // get a reference to the player and API Modules and Events
            player = brightcove.api.getExperience(experienceID);
            APIModules = brightcove.api.modules.APIModules;
            captionsEvent = brightcove.api.events.CaptionsEvent;
            mediaEvent = brightcove.api.events.MediaEvent;
            videoPlayer = player.getModule(APIModules.VIDEO_PLAYER);
            captionsModule = player.getModule(APIModules.CAPTIONS);
        },
        /**** template ready event handler ****/
        onTemplateReady : function (e) {
            var experienceID = e.target.experience.id;
            // get references to modules
            if (caption_data[experienceID] && caption_data[experienceID].length) {
                videoPlayer.getCurrentVideo(function(videoDTO) {
                    var video_id_number = videoDTO.id;
                    captionsModule.setCaptionsEnabled(true);
                    // only get first one currently
                    captionsModule.addEventListener(captionsEvent.DFXP_LOAD_SUCCESS, function (e) { //console.log('Caption load success');
                    });
                    captionsModule.addEventListener(captionsEvent.DFXP_LOAD_ERROR, function (e) { console.log('Caption load error'); });
                    captionsModule.loadDFXP( caption_data[experienceID][0].url, video_id_number);
                });
            }
            // media complete
            // might fail, so done at end
            videoPlayer.addEventListener(mediaEvent.COMPLETE, onMediaComplete);
        }
    }

}());

(function($){
    
    var video_id_overall = 0;

    var ua = window.navigator.userAgent.toLowerCase(),
        isiPad = (ua.match(/ipad/i) !== null),
        isiPhone = (ua.match(/iphone/i) !== null),
        isAndroid = (ua.match(/android/i) !== null),
        isMobile = isiPhone || isiPad || isAndroid,
        isIE9 = $('html').hasClass('ie9') || $('html').hasClass('ie8');
        //

    $.fn.extend({
        video_destroy: function(options) {
            return this.each(function() {
                var $video_player = $(this);
                if ($video_player.get(0).player)
                    $video_player.get(0).player.remove();
                // remove has audio flag
                $video_player.parent().removeClass('e-has-video');
            });
        },
        video: function(input_options) {
            // pause
            if (input_options == 'pause') {
                return this.each(function() {
                    var $video_player = $(this);
                    if ($video_player.parent().hasClass('e-has-video') && $video_player.data('player'))
                        $video_player.data('player').pause();
                });
            }
            
            function endScreenPosition ($end_screen, $video_player) {
                // if there's an end screen - show it now (and size it nicely)
                if ($end_screen.length) {
                    var video_height = $video_player.height();
                    var video_margin = parseInt($video_player.parent().css('margin-top').replace('px',''));
                    // calculate the margin of the parent and remove px for calculations
                    $end_screen.css({
                       'min-height' : video_height,
                       'margin-top' : (0 - video_height - video_margin)
                    });
                }
            }
            
            // adapt bit rate to the bandwidth
            if (window['bandwidth'] && window.bandwidth > 0) {
                // new style detection for version 3.0 and forward
                // numbers may need tweaking
                if (window.bandwidth < 450)
                    $.fn.video.defaults.videoBitRate = 350;
                else if (window.bandwidth < 800)
                    $.fn.video.defaults.videoBitRate = 700;
                else if (window.bandwidth < 1350)
                    $.fn.video.defaults.videoBitRate = 1200;
            }
            
            var options = $.extend({}, $.fn.video.defaults, input_options);
            
            // this is a bit of a hack - but if there are non-visible video players, we trigger a resize to make sure their size updates
            var done_resize = false;
                        
            return this.each(function() {

                // find the html, which should be json
                var $video_player = $(this);
                // don't reinitialise
                if (!$video_player.parent().hasClass('e-has-video')) {
                    
                    // tell the app that this can be completed
                    $video_player.trigger('completable_section').addClass('e-completable-section');
                    // video completion action
                    $video_player.off('section_complete').on('section_complete', function (e) {
                        // video ended class
                        var $video_wrapper = $video_player.closest('.e-video-wrapper');
                        if (!$video_wrapper.length)
                            $video_wrapper = $video_player.parent();
                        $video_wrapper.addClass('e-video-completed');
                    });
                    
                    var w,h, video_url, video_html, do_media_element = true;

                    if (!$video_player.is(':visible')) {

                        // delay until the video player is visible - then show it
                        var cant_wait_forever = 0;
                        var wait_until_visible = setInterval(function () {
                            if ($video_player.is(':visible')) {
                                if (!$video_player.find('.mejs-container').length) {
                                    // if not there already - pass back to itself
                                    $video_player.video( input_options );
                                } else {
                                    // otherwise - trigger a resize
                                    if (!done_resize) {
                                        $(window).trigger('resize','completed');
                                        done_resize = true;
                                    }
                                }
                                clearInterval(wait_until_visible);
                            }
                            cant_wait_forever++;
                            if (cant_wait_forever > 30)
                                clearInterval(wait_until_visible);
                        },100);

                    // if visible already
                    } else {

                        // increment the id
                        video_id_overall++;
                        var video_id = video_id_overall;

                        var video_object;

                        if ($video_player.attr('data-media')) {
                            video_object = $video_player.attr('data-media').split(':');
                        } else {
                            $video_player.attr('data-media', $video_player.text());
                            video_object = $video_player.text().split(':');
                        }

                        // save original contents to data attribute for the app
                        $video_player.empty();

                        var track = '';
                        // if we have a second parameter, then that is a captioning file
                        if ($video_player.attr('data-caption')) {
                            var caption_object = JSON.parse($video_player.attr('data-caption'));
                            if (caption_object && caption_object.captions) {
                                for (var t = 0; t < caption_object.captions.length; t++)
                                    track += '<track kind="subtitles" label="'+caption_object.captions[t].name+'" src="'+caption_object.captions[t].url+'" srclang="'+getSrcLang(caption_object.captions[t].name)+'" />';//
                            }
                        }
                        
                        // now adjust the size and position of the end screen
                        var $end_screen = $video_player.parent().siblings('.e-video-ending-screen');
                        

                        // now do stuff with it
                        if (video_object[0] == 'video' || video_object[0] == 'youtube' || video_object[0] == 'external') {
                            
                            if (video_object[0] == 'video' || video_object[0] == 'external') {
                                video_url = (video_object[1]+(video_object[2]?':'+video_object[2]:'')).replace('~[^a-z0-9\.\_\-\:\/]~gi','');
                                
                                if (video_url) {

                                    var basename = video_url.replace('.mp4','').replace('.webm','');
                                    var poster ='';

                                    // Check to see if the url contains a learner id and if the LMS is available
                                    if (video_url.match(/({|%7B)+learner\.id(}|%7D)+/ig) && e.elucidat.lms)
                                    {
                                        // Get the learner id from the LMS
                                        var learnerID = e.elucidat.lms.GetLearnerID();

                                        // Check that we have a learner id and that its got a length
                                        if ( learnerID && learnerID.length > 0 )
                                            // If so then replace the learner ID in the url
                                            learnerID = video_url.replace( /({|%7B)+learner\.id(}|%7D)+/ig, learnerID )
                                    }
                                    
                                    // add the poster image in if one has been specified
                                    if ($video_player.attr('data-poster'))
                                        // if poster is defined
                                        poster = ' poster="'+$video_player.attr('data-poster')+'"';
                                    
                                    // load
                                    if (video_object[0] == 'video') {
                                        var bitrate_detect = video_url.indexOf('.1600.') != -1 ? true : false;
                                        // if no poster by now - add in the fallback
                                        if (poster === '') {
                                            // in 'bitrate' mode - the thumbnail is .thumbnail.jpg
                                            // otherwise it it -video-thumbnail.jpg
                                            poster = basename.replace('.1600','') + (bitrate_detect? '.thumbnail.jpg' : '-video-thumbnail.jpg' );
                                            poster = ' poster="'+poster+'"';
                                        }
                                        // we might have a name ending in a bitrate though - e.g.1600.mp4
                                        // if that is the case we will set the bit rate dynamically
                                        if (bitrate_detect) {
                                            basename = basename.replace('.1600','.'+options.videoBitRate);
                                            console.log('Video bitrate set at '+options.videoBitRate+'kbps');
                                        }

                                    }

                                    var video_style = 'style="width:100%;height:100%;" width="100%" height="100%"';

                                    if (isIE9) {
                                        w = $video_player.width();
                                        h = $video_player.height();
                                        if (h <= 100)
                                            h = Math.round(w / 16 * 9);
                                        video_style = 'width="'+w+'" height="'+h+'"';
                                    }

                                    video_html = '<video controls="controls"'+poster+' class="e-mejs-player" id="video'+video_id+'" '+video_style+'>';
                                    /*
                                        Setting preload to metadata causes Chrome to misload the mp4 file, after 8 videos

                                        But -
                                         preload="none" // metadata
                                    
                                    */
                                    //    // +'chrome has a snag about caching webm files, hence the timestamp
                                    var datestamp = '';//(navigator.userAgent.indexOf('Chrome') != -1 ? '?'+Date.now() : '' );

                                    video_html += '<source src="'+ basename +'.mp4'+datestamp+'" type="video/mp4" />';//'+datestamp+'
                                    video_html += track;
                                    video_html += '</video>';
                        
                                    $video_player.html( video_html );

                                    // add a class to container
                                    $video_player.parent().addClass('e-has-video');

                                }
                                
                            } else if (video_object[0] == 'youtube') {

                                video_url = (video_object[1]+':'+video_object[2]);

                                //https://www.youtube.com/watch?v=5NV6Rdv1a3I
                                //http://youtu.be/5NV6Rdv1a3I
                                //http://www.youtube.com/embed/5NV6Rdv1a3I

                                // change youtub.be URL
                                video_url = video_url.replace('\/youtu.be\/','/www.youtube.com/watch?v=');
                                //video_url = video_url.replace('\/www.youtube.com\/watch?v=','/www.youtube.com/embed/');
                                video_url = video_url.replace('\/www.youtube.com\/embed\/', '/www.youtube.com/watch?v=');
                                // must be https
                                video_url = video_url.replace('http:','https://');//+'?autoplay=1';

                                if (video_url.indexOf('youtube.com') != -1) {

                                    w = $video_player.width();
                                    h = $video_player.height();
                                    if (h <= 100)
                                        h = Math.round(w / 16 * 9);
                                    
                                    var video_style = 'style="width:100%;height:100%;" width="'+Math.round(w)+'" height="'+Math.round(h)+'"';
                                                                  
                                    if (isMobile ) {

                                        video_url = video_url.replace('\/www.youtube.com\/watch?v=', '/www.youtube.com/embed/');
                                        // problems with media element on mobile
                                        do_media_element = false;
                                        video_style = 'width="'+w+'" height="'+h+'"';
                                        
                                        video_html = '<iframe id="video'+ (video_id) +'" src="'+ video_url +'" '+video_style+' frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';

                                    } else {

                                        video_html = '<video class="e-mejs-player" id="video'+ (video_id) +'"'+video_style+'>'+
                                            '<source src="'+ video_url +'" type="video/youtube" />' +
                                            track +
                                        '</video>';

                                    }
                                    $video_player.html( video_html );
                                    $video_player.addClass('youtube');

                                    // add a class to container
                                    $video_player.parent().addClass('e-has-video');
                                }
                            }
                            
                            if (do_media_element) {

                                var me_delay = isIE9 ? 1000 : 0;

                                setTimeout(function () {

                                    var assetFilePath = '/static';
                                    if(typeof e !== 'undefined') {
                                        if(e.elucidat.options.mode === 'scorm') {
                                            assetFilePath = 'https://learning.elucidat.com' + assetFilePath;
                                        } else if(e.elucidat.options.mode === 'offline') {
                                            assetFilePath = 'vendor'
                                        }
                                    }

                                    var videoOptions = {
                                        flashName: 'flashmediaelement-cdn-2.22.0.swf',
                                        pauseOtherPlayers: false,
                                        autoRewind: false,
                                        enableAutosize: true,
                                        flashScriptAccess: 'always',
                                        pluginPath: assetFilePath + '/mediaelement/',
                                        loop: $video_player.parent().attr('data-loop') == 'yes' ? true : false,
                                        // if you change this path, remember to change in controller / release / _make_js() too
                                        success: function (mediaElement, domObject) {
                                            // add event listener
                                            if (mediaElement) {
                                                // completed
                                                mediaElement.addEventListener('ended', function(e) {
                                                    if ($video_player.length) {
                                                        $video_player.trigger('section_complete');
                                                        
                                                        if ( $video_player.closest('.modal').length ) {
                                                            $video_player.closest('.modal').trigger('section_complete');
                                                        }
                                                    }
                                                }, false);
                                                // fixes to make the video look right
                                                if ($video_player.length)
                                                    $video_player.find('.mejs-poster').css('background-size','cover');
                                                
                                                mediaElement.addEventListener('canplay', function(e) {
                                                    if (domObject) {
                                                        var $domObject = $(domObject);
                                                        if ($domObject.length)
                                                            $domObject.height('100.05%');
                                                    }
                                                    // reposition end screen
                                                    endScreenPosition($end_screen, $video_player);

                                                }, false);

                                                // Player is ready
                                                if (options.allowAutoplay && $video_player.parent().attr('data-autoplay') == 'yes') {
                                                    setTimeout(function () {
                                                        mediaElement.play();
                                                    },150);
                                                }

                                                // HACK!
                                                // remove sketchy buffering sign (doesn't go on firefox)
                                                $video_player.find('.mejs-time-buffering').remove();
                                            }
                                        },
                                        error: function(a,b,c,d) {
                                            console.log(a);
                                            console.log(b);
                                            console.log(c);
                                            console.log(d);
                                        },
                                        enableKeyboard: options.enableKeyboard
                                    };
                                    
                                    // if progress disable
                                    if ( $video_player.parent().hasClass('e-disable-progress') ) {
                                        
                                        videoOptions.features = ['playpause','current','duration','tracks','volume','fullscreen']
                                        
                                        var newKeyActions = [];
                                        // if progressBar should be disabled - we need to clear certain actions
                                            // the key actions we don't want
                                        var keyKillList = [ 35,36,37,39 ];
                                        var intersection;
                                        for (var i = 0; i < mejs.MepDefaults.keyActions.length; i++) {
                                            // go through and see if the action is associated with one of our 'to kill ones'
                                            intersection = mejs.MepDefaults.keyActions[i].keys.filter(function(val) {
                                                return keyKillList.indexOf(val) != -1;
                                            });
                                            // if the key action is found - kill the action
                                            if (!intersection.length)
                                                newKeyActions.push( mejs.MepDefaults.keyActions[i] );
                                        }
                                        // otherwise - use the defaults
                                        videoOptions.keyActions = newKeyActions;
                                    }
                                    
                                    
                                    var player = new MediaElementPlayer( '#video'+ video_id, videoOptions );
                                    $video_player.data('player', player);
                                
                                },me_delay);

                            } else {
                                // otherwise video is complete straight away
                                $video_player.trigger('section_complete');

                            }

                        } else if (video_object[0] == 'vimeo' || video_object[0] == 'embed') {

                            video_url = (video_object[1]+':'+video_object[2]);

                            w = $video_player.width();
                            h = $video_player.height();
                            if (h <= 100)
                                h = Math.round(w / 16 * 9);

                            // check url type
                            video_url = video_url.replace('http:','https://');//+'?autoplay=1';
                            if (video_url.substring(0,2)=='//')
                                video_url = 'https:'+video_url;

                            if (video_object[0] == 'vimeo') {
                                // vimeo
                                // change vimeo URL
                                //http://vimeo.com/88907972 to
                                video_url = video_url.replace('\/vimeo.com\/','/player.vimeo.com/video/');
                                // must be https
                                video_url += '?badge=0&amp;color=ffffff';
                                // add a class to container
                                $video_player.parent().addClass('e-has-video');
                                $video_player.addClass('vimeo');
                            } else {
                                $video_player.parent().addClass('e-has-embed');
                                $video_player.addClass('embed');

                            }
                            // otherwise no change

                            video_html = '<iframe id="video'+ (video_id) +'" src="'+ video_url+'" width="'+w+'" height="'+h+'" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
                            $video_player.html( video_html );
                            // class for reference
                            $video_player.addClass(video_object[0]);
                            $video_player.trigger('section_complete');

                        // brightcove player
                        } else if (video_object[0] == 'brightcove') {

                            var video_style = '';//'style="width:100%;height:100%;" width="100%" height="100%"';

                            //if (isIE9) {
                            w = $video_player.width();
                            h = $video_player.height();
                            if (h <= 100)
                                h = Math.round(w / 16 * 9);
                            video_style = 'width="'+w+'" height="'+h+'"';
                            //}
                            var auto_start = false;
                            
                            if (options.allowAutoplay && $video_player.parent().attr('data-autoplay') == 'yes')
                                auto_start = true;

                            //http://docs.brightcove.com/en/video-cloud/smart-player-api/samples/autoplay-with-captions.html
                            if ($.fn.swipe)
                                $('#pew').gestures("disable");

                            var brightcove_url = 'http://admin.brightcove.com/js/BrightcoveExperiences.js';
                            if (location.protocol === 'https:')
                                brightcove_url = 'https://sadmin.brightcove.com/js/BrightcoveExperiences.js';
                            
                            $.getScript( brightcove_url, function() {
                                // tell gestures to bug out and ignore this video
                                var $video_object = $('<object class="BrightcoveExperience" id="video'+ (video_id) +'"'+video_style+'></object>');

                                var params = {
                                    width: w,
                                    height: h,
                                    playerID: video_object[1],
                                    playerKey: video_object[2],
                                    '@videoPlayer': video_object[3],
                                    isVid: true,
                                    isUI: true,
                                    dynamicStreaming: true,
                                    wmode: 'transparent',
                                    htmlFallback: true,
                                    includeAPI: true,
                                    autoStart: auto_start,
                                    templateLoadHandler: 'BCLS.onTemplateLoad',
                                    templateReadyHandler: 'BCLS.onTemplateReady'
                                };
                                if (location.protocol === 'https:') {
                                    params['secureConnections'] = true;
                                    params['secureHTMLConnections'] = true;
                                }
                                for (var p in params)
                                    $video_object.append('<param name="'+p+'" value="'+params[p]+'" />');

                                $video_player.empty().append( $video_object );
                                
                                // class for reference
                                $video_player.addClass(video_object[0]);

                                // now add a reference to the captions
                                if (caption_object && caption_object.captions)
                                    BCLS.saveCaptionData( 'video'+video_id, caption_object.captions );

                                brightcove.createExperiences();

                            });

                            // add a class to container
                            $video_player.parent().addClass('e-has-video');
                            $video_player.addClass('brightcove');

                        }
                        
                        endScreenPosition($end_screen, $video_player);
                    }
                
                }
                
            });
        }
    });

    //Settings list and the default values
    $.fn.video.defaults = {
        enableKeyboard: true,
        videoBitRate: 1600,
        allowAutoplay: true
    };
        
})(jQuery);

// Include: javascript/release/build/plugins//jquery.video.translation.js

(function (originalFunction) {
    // keep 
    var translations_json = {"none":"None","play":"Play","pause":"Pause","mute":"Mute","fullscreen":"Fullscreen"};
    
    if (translations_json && typeof translations_json === 'object') {
        var found_matches = false;
        // make sure the defaults are up to date - because - annoyingly - some of the 
        // text is stored on initialisation - with different key names
        for (var t in translations_json) {
            // there are a few translations that need to be done to cover the bases
            // Keys should be Ucfirst
            translations_json[ t.charAt(0).toUpperCase() + t.slice(1) ] = translations_json[t];
            // and the defaults are lowercase with Text on the end
            if (mejs.MepDefaults[t + 'Text'] && typeof mejs.MepDefaults[t + 'Text'] == "string")
                mejs.MepDefaults[t + 'Text'] = translations_json[t];
            // show that we've found some
            found_matches = true;
        }
        //mejs.i18n.t_originalFunction = originalFunction;
        // if that worked, then we can overwrite the translation function - to use these in place
        if (found_matches) {
            mejs.i18n.t = function (string_requested) {
                // There is a slight tension here, because the 'string_requested' is the English phrase - so could be 'None' - which works here, because it
                // is also the key, but could also be 'Captions/Subtitles' - which isn't a key - and so won't work. If that becomes a problem, then we might need
                // to rethink a bit.
                // if it's in the JSON - return it
                if (translations_json[ string_requested ])
                    return translations_json[ string_requested ];
                // otherwise fall back to original function 
                return originalFunction( string_requested );
            };
        }
    }
})(mejs.i18n.t);

// Include: javascript/release/build/plugins//jquery.wait_until_on_screen.js

(function($){
    $.fn.extend({
        is_on_screen: function(options) {
            var element = this.get(0);
            var bounds = element.getBoundingClientRect();
            return bounds.top < window.innerHeight && bounds.bottom > 0;
        },
        wait_until_on_screen: function(options) {
            var $item = $(this);
            var test_on_screen = function () {
                if ($item.length) {
                	var on_screen = $item.is_on_screen();
                	if ( on_screen )
            			options.callback();
            		else
            			setTimeout(test_on_screen, 200);
                }
        	};
        	test_on_screen();
        }    
    });
})(jQuery);
// Include: javascript/release/build/plugins//mediaelement.caption.load.js
// this is a jsonp loading function to take in subtitle tracks
var me_subtitle_register = [];
function me_subtitle_loader ( response ) {
	if (response.filename && response.subtitles) {
		var new_register = [];
		// go through the register
		for (var i in me_subtitle_register) {
			// if the filename matches one in the register
			if (me_subtitle_register[i].filename == response.filename) {
				// run the success function
				me_subtitle_register[i].success( response.subtitles );
			} else
				// otherwise readd into register
				new_register.push(me_subtitle_register[i]);
		}
		me_subtitle_register = new_register;
	}
}
// punch out the loadTrack function
MediaElementPlayer.prototype.loadTrack = function(index){
	var
		t = this,
		track = t.tracks[index],
		after = function() {
			track.isLoaded = true;
			// create button
			t.enableTrackButton(track.srclang, track.label);
			t.loadNextTrack();
		};
	
	var on_subtitle_load = function(d) {
		// parse the loaded file
		if (typeof d == "string" && (/<tt\s+xml/ig).exec(d)) {
			track.entries = mejs.TrackFormatParser.dfxp.parse(d);					
		} else {	
			track.entries = mejs.TrackFormatParser.webvtt.parse(d);
		}
		after();
		if (track.kind == 'chapters') {
			t.media.addEventListener('play', function(e) {
				if (t.media.duration > 0) {
					t.displayChapters(track);
				}
			}, false);
		}
		if (track.kind == 'slides') {
			t.setupSlides(track);
		}					
	};
	// IF IE9 - we will use the JSONP version of the file instead
	// This might not exist - but it won't be any more broken than it was before
	var xhr_support = (new XMLHttpRequest().upload && window.FormData && !window.XDomainRequest? true : false );
	if (!xhr_support) {
		// register success functions
		var track_path = track.src.replace('.srt','').replace('.vtt','')+'.js';
		// because we could have multiple subtitles at once here - all overlapping
		// and we lose the context of this function - we are registering each file with a success function
		me_subtitle_register.push({
			filename: track_path.split('/').reverse()[0],
			success: on_subtitle_load
		});
		// now get via jsonp
		$.ajax({
			url: track_path,
			dataType: "jsonp",
			error: function() {
				t.loadNextTrack();
			}
		});

	} else {
		// otherwise we just do a standard ajax call - because if it ain't broke....
		$.ajax({
			url: track.src,
			dataType: "text",
			crossDomain: true,
			success: on_subtitle_load,
			error: function() {
				t.loadNextTrack();
			}
		});
	}
};

// Include: javascript/release/build/utilities//array.average.js
Array.prototype.average=function(){
    var sum=0;
    var j=0;
    for(var i=0;i<this.length;i++){
        if(isFinite(this[i])){
          sum=sum+parseFloat(this[i]);
           j++;
        }
    }
    if(j===0){
        return 0;
    }else{
        return sum/j;
    }

}
// Include: javascript/release/build/utilities//array.shuffle.js

Array.prototype.shuffle=function(){
	var o=this.slice();
	for(var j,x,i=o.length;i;j=parseInt(Math.random()*i),x=o[--i],o[i]=o[j],o[j]=x){};
	return o;
};
// Include: javascript/release/build/utilities//calc_fixed_header_size.js

(function($){

    var $header = null, $footer = null, $pawWrapper = null, $backgroundWrapperEdit = null;

    $.fn.extend({
        calc_fixed_header_size: function (updateSelectors) {

            return this.each(function() {

                var $pew = $(this);

                // In the editor, top padding should be added to .background__wrapper so edit button doesn't sit under header.
                // In this case, it should not be added to pawWrapper else the top padding will be doubled up.

                if ($header === null || !$header.length || updateSelectors) {
                    $header = $('.project__header', $pew);
                }
                if ($footer === null || !$footer.length || updateSelectors) {
                    $footer = $('.project__footer', $pew);
                }
                if ($backgroundWrapperEdit === null || !$backgroundWrapperEdit.length || updateSelectors) {
                    $backgroundWrapperEdit = $('.background__wrapper > .e-edit-toggle', $pew);
                }
                if ($pawWrapper === null || !$pawWrapper.length || updateSelectors) {
                    $pawWrapper = $('.e-contains-paw', $pew);
                }

                if (!$header.length || !$footer.length )
                    return false;

                if ($header.hasClass('e-pos--fixed')) {
                    $pawWrapper.css('padding-top', $header.height());
                }

                if ($footer.hasClass('e-pos--fixed') || $footer.hasClass('e-pos--bottom')) {
                    $pawWrapper.css('padding-bottom', $footer.height());
                }

                // The edit button on the background wrapper will sit under the header if we dont bump it down to sit underneath it.
                if ($backgroundWrapperEdit.length) {
                    $backgroundWrapperEdit.each(function() {
                        this.style.setProperty('top', $header.height() + 'px', 'important');
                    });
                }

            });

        }
    });


})(jQuery);

// Include: javascript/release/build/utilities//isNumber.js

function isNumber(n){return !isNaN(parseFloat(n))&&isFinite(n);};

// Include: javascript/release/build/utilities//jquery.accessibility_fixes.js
(function($){
    $.fn.extend({
        accessibility_fixes: function(){
            return this.each(function () {
                var $this = $(this);
                //body should have called this to make modals findable
                //Make the page title -if available- the first thing that is focused on for screen readers
                var $header_title = $this.find('[data-role="page.name"]').first();
                if($header_title.length){
                    $header_title.attr("tabindex", 0);
                    $header_title.focus();
                    $header_title.css("outline", "none");
                }
                
                var modalShow = function(e){
                    var $modal_shown = $(e.target);
                    var $mod_title = $modal_shown.find(".modal_title");
                    //if there is a modal title set up normally, focus on it
                    if($mod_title.length){
                        $mod_title.attr("tabindex", 0);
                        $mod_title.focus();
                    }else{
                        //if there is no title in the modal, just focus on the first div inside it so accessibility users don't
                        //have to scroll through whole page to focus on the modal content
                        var $firstChild = $modal_shown.find("div:first");
                        $firstChild.attr("tabindex", 0);
                        $firstChild.focus();
                    }
                }
                
                $this.find(".modal").off("shown", modalShow).on("shown", modalShow);
                
                var modalHide = function(event){
                    setTimeout(function(){
                        if(e.elucidat.navigating != "ready"){
                            //Timeout to allow  time for page to change if the modal close link takes you to next page
                            //modal closed, get modal id
                            var $modal = $(event.target);
                            var $modal_id = $modal.attr("id");
                            //find any links with the modal id as href, most common usage to open modals
                            var $modal_opener_link = $this.find('a[href="#'+$modal_id+'"]');
                            
                            //new modal system doesnt use attributes to link to a modal, they are just contained within the form
                            
                            if($modal_opener_link.length){
                                //modal link found, give focus upon returning
                                $modal_opener_link.focus();
                            }else{
                                //no modal link found in the most common way, check for a button with data-target
                                var $modal_opener_btn = $this.find('button[data-target="#'+$modal_id+'"]');
                                if($modal_opener_btn.length){
                                    //modal opening btn found, give it focus
                                    $modal_opener_btn.focus();
                                }else{
                                    // no links or buttons found opening the modal, find any other object that might open it
                                    var $modal_opener_any = $this.find('[data-target="#'+$modal_id+'"]');
                                    if($modal_opener_any.length){
                                        //found another element opening this modal, probs not a link or button so give it tabIndex to make it focusable
                                        $modal_opener_any.attr("tabindex", 0);
                                        //then focus
                                        $modal_opener_any.focus();
                                    }else{
                                        //Fallback, might use new method of putting modals in forms with no reference on buttons, check for a form parent, and whether that parent has a save button
                                        var $modal_same_form_save_btn = $modal.parents('form').find('.save_button');
                                        if($modal_same_form_save_btn.length){
                                            //yes it does ^^ so return focus to the save button that triggered the modal
                                            $modal_same_form_save_btn.focus();
                                        }else{
                                            //FALLBACK, no items found that have reference to opening the modal, so go back to header_title
                                            if($header_title.length){
                                                $header_title.focus();
                                            }else{
                                                //no header title, focus on page anchor, fallback for the fallback
                                                $("#load_anchor").focus();
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }, 10);
                }
                
                $this.find(".modal").off("hidden", modalHide).on("hidden", modalHide);
                
                //macs default screenreader wont read a link's title, it needs an aria-label, so if it has a title, and doesnt already
                // have a label (and isnt hidden to screenreaders) give it a label that matches the title (and if text is empty)
                $this.find("a[title]").each(function(){
                    var $titledLink = $(this);
                    if($titledLink.text() == ""){
                        var $linkTitle = $titledLink.attr("title");
                        if(!$titledLink.attr("aria-label") && !$titledLink.attr("aria-hidden") && $linkTitle.length > 0){
                            $titledLink.attr("aria-label", $linkTitle);
                        }
                    }else{
                        $titledLink.removeAttr("title");
                    }
                });
                
                //fallback in case controlsready doesnt fire to hide full screen button from screen readers for video
                var fscrnCount = 0;
                var $fsBtn;
                var $volSlider;
                var fsInterval = setInterval(function(){
                    //check every second for eleven secs to see if the controls are there
                    $fsBtn = $this.find('.mejs-fullscreen-button button[aria-label="Fullscreen"]');
                    $volSlider = $this.find("a.mejs-volume-slider");
                    if($fsBtn.length){
                        //fullscreen button exists, controls must be ready
                        $this.find('.flipcard .flipcard__back :focusable').attr('aria-hidden', true);
                        $this.find('div.video_player').attr('aria-busy', 'false');
                        $fsBtn.attr("aria-hidden", "true");
                        //give volume slider a positive tabindex to prevent tab blocks
                        $volSlider.attr("tabindex", 1);
                        clearInterval(fsInterval);
                    }else if(fscrnCount > 10){
                        clearInterval(fsInterval);
                    }else{
                        fscrnCount++;
                    }
                }, 1000);
                
                //hide the fullscreen from screen readers - the way it should hopefully happen
                $this.on("controlsready", function(){
                    //controls ready fired, full screen btn should be there
                    $fsBtn = $this.find('.mejs-fullscreen-button button[aria-label="Fullscreen"]');
                    $volSlider = $this.find("a.mejs-volume-slider");
                    //just in case it isn't as controlsready isn't super reliable, dbl check
                    if($fsBtn.length){
                        //fullscreen button exists as it should, primo
                        $this.find('.flipcard .flipcard__back :focusable').attr('aria-hidden', true);
                        $this.find('div.video_player').attr('aria-busy', 'false');
                        $fsBtn.attr("aria-hidden", "true");
                        //give volume slider a positive tabindex to prevent tab blocks
                        $volSlider.attr("tabindex", 1);
                        clearInterval(fsInterval);
                    }else{
                        //controlsready has triggered when the controls aren't actually ready, something's gone wrong elsewhere
                        //Fallback above should continue searching for fullscreen button when it eventually shows up anyway
                        //Hopefully shouldnt ever run
                        console.warn("Potential Elucidat Error: Fullscreen Button does not exist despite controlsready being triggered");
                    }
                });
                
                //When a carousel changes slide, make sure that focus is given to the content of the active slide
                $this.find(".carousel").on("slid.bs.carousel", function(){
                    var $active_slide = $(this).find(".active");
                    //give active slide a tabindex to make it focusable then give it focus
                    $active_slide.attr("tabindex", 0);
                    $active_slide.focus();
                });

                //Insure that on page load flip card backs are hidden for IE screen readers.
                $this.find('.flipcard .flipcard__back').attr('aria-hidden', true);
                $this.find('.flipcard .flipcard__back :focusable').attr('aria-hidden', true);

                
                //Menu - giving correct roles to navigation menu items to prevent screenreader repetition
                var $menu_container = $this.find('[role="menu"] [data-role="navigation"]');
                $menu_container.find("li a").each(function(){
                    //find each anchor and make it behvae as a button to prevent screenreader reading href, and give it aria label to read out instead
                    var $anchor = $(this);
                    var anchor_text = $anchor.text();
                    $anchor.attr("role", "button").attr("aria-label", anchor_text);
                });
                
                
            });
        }
    });
})(jQuery);

// Include: javascript/release/build/utilities//jquery.body_class.js
// function that adds a class template_* to body depending on which page type you are in
// it first clears all classes that the body may have
// then adds the class belonging to that page type template
(function($){
    $.fn.extend({
        body_class: function(options) {
            //Settings list and the default values
            var defaults = {
                class_src: null
            };
            var options = $.extend(defaults, options);
            return this.each(function() {
                // should be the body tag
                var $this = $(this);
                // remove page completed class
                if($this.prop('tagName') !== 'BODY') { return; }
                
                $this.removeClass('page_completed');
                // update the template class
                // remove template class from body
                $this[0].className = $this[0].className.replace(/\btemplate_.*?\b/g, '').replace('  ',' ');
                // get classes from moved body and add, if needed
                if (options.class_src && options.class_src.length) {
                    var new_class = options.class_src.attr('class');
                    if (new_class) {
                        var new_class_split = new_class.split(' ');
                        for (var c=0;c<new_class_split.length;c++) {
                            $this.addClass(new_class_split[c]);
                        }
                    }
                    // clear class off #body_moved
                    options.class_src.attr('class','');
                }
            });
        }   
    });
})(jQuery);

// Include: javascript/release/build/utilities//jquery.body_height.js

(function($){

    $.fn.extend({
        body_height: function(options) {
        
            //Settings list and the default values
            var defaults = {};
            var options = $.extend(defaults, options);
            
            var body_h = parseInt( $('body').css('min-height') );

            return this.each(function() {
                
                var $this = $(this);

                // find offset position
                var offset = $this.offset();

                // subtract from height
                var new_height = body_h - offset.top;

                // and set min-height
                $this.css('min-height', new_height + 'px');

            });
        }   
    });
        
})(jQuery);
// Include: javascript/release/build/utilities//jquery.contains_paw.js

(function($){
    $.fn.extend({
        contains_paw: function() {
            return this.each(function() {
                // mark the final containing element with a special class
                var $this = $(this);
                var $last_parent = $this;
                $this.parentsUntil( '#__body__moved' ).each(function () {
                    $last_parent = $(this);
                });
                $last_parent.addClass('e-contains-paw');
            });
        }   
    });
})(jQuery);

// Include: javascript/release/build/utilities//jquery.fix_carousel_slides.js


(function($){

    $.fn.extend({
        fix_carousel_slides: function( $context ) {
            return this.each(function() {

                var href, $this = $(this), $target = $context.find($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')); //strip for ie7
                // if all items have active - then

                var $items = $target.find('.item').filter(function(){
                    return $(this).parents('.add-option-template').length ? false : true;
                });
                
                // if all are active - remove
            	if (!$items.not(".active").length)
            		$items.removeClass('active');
                
            	// and if none are active - make the first active
                if (!$items.filter('.active').length)
                    $items.first().addClass('active');
            });
        }   
    });
})(jQuery);
// Include: javascript/release/build/utilities//jquery.fix_links.js

(function($){
    $.fn.extend({
        chapter_link: function( options ) {
            //Settings list and the default values
            var defaults = {};
            var options = $.extend(defaults, options);
            
            return this.each(function () {
                // check if page is loaded already - if so take from cache
                // the url
                var $this = $(this);

                var perc_progress = options.getProgress();
                var score = options.getScore();

                $this.find('.chapter_percentage').each(function () {
                    var $perc = $(this);
                    if ($perc.children().length)
                        // this drives course progress bars
                        $perc.find('.bar').css( 'width', perc_progress + '%' );
                    else
                        $perc.text( Math.round(perc_progress) + '%' );
                });

                $this.find('.chapter_score').each(function () {
                    var $perc = $(this);
                    if ($perc.children().length)
                        // this drives course progress bars
                        $perc.find('.bar').css( 'width', score + '%' );
                    else
                        $perc.text( Math.round(score) + '%' );
                });

                if (perc_progress == 100)
                    $this.addClass('e-chapter-complete');

                if (options.score_possible && options.getScoreResult())
                    $this.addClass('e-chapter-passed');

            });
        },
        fix_links: function( context ) {
        
            // Loop through all the links on the page.
            // We want to store a reference to each link against the page it's linking to.

            //Clear the links to the page, we don't want to double up if this function is called twice.
            $.each(context.pages, function(i,page) {
                page.links_to_page = [];
            });
            
            return this.each(function () {
                // check if page is loaded already - if so take from cache
                // the url

                var $this = $(this);
                var page_request;

                var url = $this.attr('href');
                var role = $this.attr('data-role');

                // ignore mailto links
                if (url && url.substring(0,6) === 'mailto') {
                    return;
                }
                
                //get all links that don't have an href attribute and give it one, to make screen reader enter key work
                if(!$this.is("[href]")){
                    $this.attr("href", "#!");
                }

                function onClickClose() {
                    //when window closed with close button, we'll directly call unload as if browser close, to ensure we send terminate to lms
                    console.log('//\n//\n// Window Close Triggered\n//');
                    var $this = $(this);

                    //Close button might have a link on it...
                    if($this.attr('href').substring(0,4) === 'http') {
                        console.log('Close button contains link, navigating to new page...');
                        window.open($this.attr('href'), 'continueLink');
                    }

                    //then call the unload function to tell the LMS we are done.
                    e.elucidat.unload();

                    //wait a bit for new window to be opened and LMS Finish to register.
                    setTimeout(function() {
                        if (window.top) {
                            window.top.close();
                        }
                        else {
                            window.close();
                        }
                    },250);

                    return false;
                }

                function onClickNotFound(ev) {
                    ev.preventDefault();
                    console.warn('404, The destination was not found.', 'Link', $(ev.target), 'HREF', decodeURI($(ev.target).attr('href')));
                }

                function onClickNavLink(ev) {
                    ev.preventDefault();
                    //Should this link shuffle the question pools?
                    if($this.attr('data-toggle') === 'shuffle' || context.should_shuffle_pools) {
                        context.should_shuffle_pools = false;
                        context._shuffle_question_pools(true);
                    }

                    Elucidat.navigate(page_request.page_id);


                    // don't stop modal close events
                    if ($this.attr('data-dismiss'))
                        $this.trigger('click.dismiss.'+$this.attr('data-dismiss'));

                    else
                        ev.stopPropagation();
                }

                function onClickNextLink(ev) {
                    goToPrevNextLink(ev, 'next');
                }
                function onClickPrevLink(ev) {
                    goToPrevNextLink(ev, 'previous');
                }

                function goToPrevNextLink(ev, direction) {
                    ev.preventDefault();
                    //Should this link shuffle the question pools?
                    if($this.attr('data-toggle') === 'shuffle' || context.should_shuffle_pools) {
                        context.should_shuffle_pools = false;
                        context._shuffle_question_pools(true);
                    }

                    if ( direction === 'next' || direction === 'previous') {
                        Elucidat.navigate(direction);

                    }

                    // don't stop modal close events
                    if ($this.attr('data-dismiss'))
                        $this.trigger('click.dismiss.'+$this.attr('data-dismiss'));

                    else
                        ev.stopPropagation();
                }

                // handle window close links
                if (role && role === 'close') {
                    if($this.attr('href').substring(0,4) === 'http') {
                        //Ensure links on close button open in a new window;
                        $this.attr('target','_blank');
                    }

                    $this
                        .off('.closeLink')
                        .on('click.closeLink', onClickClose);

                } else if(url && url.substring(0,1) !== '#') {

                    var re = /({{|%7B%7B)navigation\.([a-z0-9_]+).url(}}|%7D%7D)/i;
                    var re2 = /({{|%7B%7B)(next|previous)\.url(}}|%7D%7D)/i;
                    var match, done = false;

                    if ( match = re.exec( url )) {
                        //Match links to a specific page or the first or last page.
                        if ( match[2] ) {

                            if (match[2] === 'first')
                                page_request = context.pages[ context.page_order[0] ];

                            else if (match[2] === 'last')
                                page_request = context.pages[ context.page_order[ context.page_order.length - 1 ] ];

                            else
                                page_request = context.pages[ match[2] ];


                            if (page_request) {

                                // Store reference of all links to a page against the page.
                                // Once progress manage has been run we loop through the links and
                                // set the correct attributes on them (seen, completed, hidden etc).
                                page_request.links_to_page.push($this);

                                $this
                                    .off('.navLink')
                                    .on('click.navLink', onClickNavLink);
                            } else {
                                $this
                                    .off('.navLink')
                                    .on('click.navLink', onClickNotFound);
                            }
                        }

                    } else if ( match = re2.exec( url )) {
                        //Match previous and next links.

                        // store links to pages against the page they link to for processing later.
                        if ( match[2] == 'next') {
                            if(context.next_page) {
                                page_request = context.pages[ context.next_page ];
                            }

                            $this
                                .off('.prevNext')
                                .on('click.prevNext',  onClickNextLink);

                        } else if ( match[2] == 'previous') {
                            if(context.previous_page) {
                                page_request = context.pages[context.previous_page];
                            }

                            $this
                                .off('.prevNext')
                                .on('click.prevNext', onClickPrevLink);

                        }

                        if (page_request) {
                            page_request.links_to_page.push($this);
                        } else {
                            $this
                                .off('.navLink')
                                .on('click.navLink', onClickNotFound);
                        }




                    } else {
                        // other links open in a new window
                        $this.attr('target','_blank');

                    }
                }

            });
        }   
    });
        
})(jQuery);

// Include: javascript/release/build/utilities//jquery.fix_titles.js

(function($){
    $.fn.extend({
        fix_titles: function( $context ) {
        
            //Settings list and the default values
            //var defaults = {};
            //var options = $.extend(defaults, options);
            
            return this.each(function() {
                
                //="modal"  data-toggle="tab" data-slide="prev"  data-toggle="collapse");

                var $item = $(this);

                if (!$item.attr('title') || !$item.attr('title').length) {
                    
                    var toggle = $item.attr('data-toggle');

                    // MODALS
                    if (toggle == 'modal') {
                        // title, if not set, should 
                        var href = $item.attr('href');
                        
                        if (href && href.length) {
                            // modals are linked with the href (which will be a full id)
                            var $linked_modal = $context.find( href );
                            var title = '';
                            var $title_element;

                            if ($linked_modal.length) {
                                // if the modal is set up right, then it will have aria-labelledby, which is an id
                                if ( $linked_modal.attr('aria-labelledby') )
                                    $title_element = $linked_modal.find('#'+$linked_modal.attr('aria-labelledby'));
                                // otherwise just dive for the first H tag
                                if (!title.length)
                                    $title_element = $linked_modal.find('h1,h2,h3,h4,h5').first();
                            }

                            if ($title_element && $title_element.length) {
                                var cloned_title_element = $title_element.clone();
                                cloned_title_element.find("br").replaceWith(" ");
                                title = cloned_title_element.text();
                            }

                            if (title.length)
                                $item.attr('title', title);
                            else
                                $item.attr('title', 'Open a popup with more information');
                        }
                    // COLLAPSE / ACCORDIAN
                    } else if (toggle == 'collapse' || toggle == 'tab' || toggle == 'collapse-next') {
                        // to a screen reader, the accordians and tabs are all visible already, so the links are just anchors
                        // http://stackoverflow.com/questions/11905943/jquery-text-interpretbr-as-new-line
                        $item.attr('title', $item.get(0).innerText || $item.get(0).textContent);

                    } else if ($item.attr('data-slide') == 'next') {
                        $item.attr('title', 'Proceed to the next slide');

                    } else if ($item.attr('data-slide') == 'prev') {
                        $item.attr('title', 'Go back to the previous slide');

                    }

                }


            });
        }   
    });
        
})(jQuery);

// Include: javascript/release/build/utilities//jquery.gestures.js


(function($){


	function moveNext() {

        var $page_content = $('#paw');
        var $pew = $('#pew');

        // if we have tabs, we should move on to the next tab if there is one
        var $tabs = $page_content.find( 'ul.nav-tabs');
        if ( $tabs.length ) {
            var $next_tab = $tabs.find('li.active').next('li');
            if ( $next_tab.length ) {
                $next_tab.find('a:first').trigger('click');
                return;
            }
        }

        // if we are the carousel, we should move on to the next screen, if there is one
        var $carousel = $page_content.find( 'div.carousel');
        if ( $carousel.length ) {
            var $next_screen = $carousel.find('div.item.active').next('div.item');
            if ( $next_screen.length ) {
                $page_content.find('[data-slide=next]').trigger('click');
                return;
            }
        }

        // otherwise we should attempt to go to the next page
        $('[data-role=pager-next] a', $pew).not( "[style='visibility:hidden']" ).trigger('click');

    }

    function movePrev() {

        var $page_content = $('#paw');
        var $pew = $('#pew');

        // if we have tabs, we should move on to the next tab if there is one
        var $tabs = $page_content.find( 'ul.nav-tabs');
        if ( $tabs.length ) {
            var $prev_tab = $tabs.find('li.active').prev('li');
            if ( $prev_tab.length ) {
                $prev_tab.find('a:first').trigger('click');
                return;
            }
        }

        // if we are the carousel, we should move on to the next screen, if there is one
        var $carousel = $page_content.find( 'div.carousel');
        if ( $carousel.length ) {
            var $prev_screen = $carousel.find('div.item.active').prev('div.item');
            if ( $prev_screen.length ) {
                $page_content.find('[data-slide=prev]').trigger('click');
                return;
            }
        }

        // otherwise we should attempt to go to the previous page
        $('[data-role=pager-previous] a', $pew).not( "[style='visibility:hidden']" ).trigger('click');

    }

    $.fn.extend({
        gestures: function(options) {

	    	if ($.fn.gestures.defaults.enabled) {
	            // disable or enable
	            if (options === 'disable') {
					return this.each(function() {
	            		$(this).swipe('disable');
	            	});
	            } else if (options === 'enable') {
					return this.each(function() {
	            		$(this).swipe('enable');
	            	});
				}
			}

            // otherwise lets do defaults
            //var defaults = {};
            //var options = $.extend(defaults, options);
            
            return this.each(function() {
	        	// only do if turned on
	    		if ($.fn.gestures.defaults.enabled) {

	    		    var textDirection = 'ltr';
	    		    var $body = $('body');

	    		    if(document.dir === 'rtl' || $('html').attr('dir') === 'rtl' || $body.attr('dir') === 'rtl' || $('#__body__moved').attr('dir') === 'rtl') {
	    		        textDirection = 'rtl'
                    }

	            	$(this).swipe({
	            		excludedElements: '.e-c,button,a,input,textarea,.e-mejs-player,.e-slider', //,input.learner_input, textarea.learner_input// exclude elements that are going to be commented on (library conflicts with swiping in IE10/11)
                        isScrolling: false,
                        scrollPos: 0,
                        scrollThreshold: 10,
                        swipeStatus: function(event, phase) {
	            		    var currentScrollPos = $body.scrollTop();
	            		    var self = this;
	            		    var scrollThreshold = 10;
	            		    if(phase === 'start') {
	            		        self.scrollPos = currentScrollPos;
	            		        self.isScrolling = false;
                            } else if(phase === 'end') {
	            		        if(Math.abs(self.scrollPos - currentScrollPos) > scrollThreshold) {
	            		            self.isScrolling = true;
                                }
                            }
                        },
                        swipe: function(event, direction){
	            		    var self = this;
	            		    //If scrolling is detected, don't trigger the swipe.
	            		    if(self.isScrolling) {
	            		        return true;
                            }
                            switch(direction) {
                                case 'left' :
                                    textDirection === 'rtl' ? movePrev() : moveNext();
                                    break;
                                case 'right' :
                                    textDirection === 'rtl' ? moveNext() : movePrev();
                                    break;
                            }
                        },
			        	threshold:150,
	          			maxTimeThreshold:700,
                        allowPageScroll: "vertical"
			    	});

				}
            });
        }   
    });

    //Settings list and the default values
    $.fn.gestures.defaults = {
        enabled: !$('body').hasClass('preview_commenting')
    };
        
})(jQuery);

// Include: javascript/release/build/utilities//jquery.modal_show.js

(function($){

    $.fn.extend({
        modal_show: function(options) {
        
            //Settings list and the default values
            var defaults = {};
            var options = $.extend(defaults, options);
            
            return this.each(function() {
                
                var $this = $(this);
                // if we have the class 'modal', we'll call modal('show')
                // else we'll do a manual show (and hide others)
                if ( $this.attr('data-mode') == 'dropdown' ) {
                    // we'll use the dropdown method instead
                    $this.siblings('[data-mode="dropdown"]').removeClass('open').attr('aria-hidden',true);
                    $this.addClass('open').attr('aria-hidden',false);
                    
                } else {
                    $this.modal('show');

                }
            });
        },
        modal_destroy: function(options) {
            //Settings list and the default values
            var defaults = {};
            var options = $.extend(defaults, options);
            
            return this.each(function() {
                var $this = $(this);
                // put back where we got it from
                if ($this.data('parent'))
                    $this.appendTo( $this.data('parent') );
                // kill hidden action
                $this.off('modal-hidden');
            });
        }   
    });
        
})(jQuery);
// Include: javascript/release/build/utilities//jquery.randomize.js



(function($){
    $.fn.extend({
        randomize: function() {
            var $this = $(this);
            var order_before = [];
            $this.children().each(function () {
                var $c = $(this);
                order_before.push ( $c.get(0).nodeName+'|'+$c.attr('id')+'|'+$c.attr('class'));
            });
            $this.children().sort(function(){
                return Math.round(Math.random()) - 0.5;
            }).remove().appendTo(this);
            var order_after = [];
            $this.children().each(function () {
                var $c = $(this);
                order_after.push ( $c.get(0).nodeName+'|'+$c.attr('id')+'|'+$c.attr('class'));
            });
            if (!order_before.length || order_before.join(',') != order_after.join(','))
                return this;
            else
                return this.randomize();
        }
    });

})(jQuery);
// Include: javascript/release/build/utilities//jquery.tab_fixer.js

(function($){
    $.fn.extend({
        tab_fixer: function() {
            return this.each(function() {
                var $link = $(this);
                // make sure if there are active tabs - we turn them off
                if ( !$link.closest( '.add-option-template' ).length ) {
                    var tab_href = $link.attr('href');
                    if (tab_href) {
                        var $tab_pane = $(tab_href);
                        if ($tab_pane.length) {
                            if ($tab_pane.is(':first-child'))
                                $link.tab('show');
                            else
                                // make sure first has active - and others are turned off
                                $tab_pane.removeClass('active');
                        }
                    }
                }
            });
        }
    });
})(jQuery);

// Include: javascript/release/build/utilities//number.between.js

Number.prototype.between = function(lower,upper) {
    if (this > upper) return upper;
    if (this < lower) return lower;
    return this;
};
// Include: javascript/release/build/utilities//string.reverse.js
String.prototype.reverse=function(){
	return this.split("").reverse().join("");
};
/* Big love to Google Analytics */
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-40048511-3', 'auto');ga('send', 'pageview');var gac='';if(gac.length){ga('create',gac,'auto',{'name':'c'});ga('c.send','pageview');}


