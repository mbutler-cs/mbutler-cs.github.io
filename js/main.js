(function(win, $) {
    "use strict";
    var app = win.app = (typeof (win.app) !== 'undefined') ? win.app : {};
    
    (app.main = function () {
        // private properties/methods here
        var showMenuPanel = function (panelType, parentOffsets) {
            var $panel = $('#' + panelType);

            $panel
                .css({ left: parentOffsets.right - $panel.get(0).clientWidth, top: parentOffsets.bottom, opacity: 1 }); //.animate({ opacity: 1.0 }, 500);
        };

        var hideMenuPanel = function (panelType) {
            $('#' + panelType).animate({ opacity: 0 }, 200, function() {
                $(this).css({ left: -99999 });
            });
        }

        var navDropdownHoverIn = function(e) {
            //console.log('hovering over ' + $(e.currentTarget).data('dropdown-type') + ' left:' + e.currentTarget.offsetLeft + ' width:' + e.currentTarget.offsetWidth + ' top:' + e.currentTarget.offsetTop + ' height:' + e.currentTarget.offsetHeight + ' right:' + (e.currentTarget.offsetLeft + e.currentTarget.offsetWidth) + ' bottom:' + (e.currentTarget.offsetTop + e.currentTarget.offsetHeight));
            showMenuPanel($(e.currentTarget).data('dropdown-type'), { right: e.currentTarget.offsetLeft + e.currentTarget.offsetWidth, bottom: e.currentTarget.offsetTop + e.currentTarget.offsetHeight});
        };

        var navDropdownHoverOut = function(e) {
            //console.log('hover outside of element ' + $(e.currentTarget).data('dropdown-type'));
            hideMenuPanel($(e.currentTarget).data('dropdown-type'));
        };

        var showCountryContent = function (continent) {
            $('.country-list').each(function () {
                var $this = $(this);
                $this.css({ opacity: 0 }).hide();
                if ($this.data('continent') === continent) {
                    $this.css({ opacity: 0 }).show().css( { opacity: 1 });
                }
            });
        };

        var getNewsletterClickHandler = function(e) {
            //console.log('subscribe to the newsletter');
        };

        var documentReadyComplete = function(){
                $('.featured-tours article').equalizeHeight();                
        };
            
        var registerModuleEvents = function() {
            $('.nav-item').hover(navDropdownHoverIn, navDropdownHoverOut);
            $('.cta').on('click', getNewsletterClickHandler);
            $('.continent-link').hover(function(e) {
                //on mouse in (over)
                var $this = $(this);
                $this.closest('ul')
                    .find('.link-primary-text-color')
                    .removeClass('link-primary-text-color')
                    .end();
                $this.addClass('link-primary-text-color');
                showCountryContent($this.data('continent'));
            });
            
            //just want to close the panel when these are clicked
            $('.country-link, .panel-cta ').on('click', function(e) { 
                hideMenuPanel($(e.currentTarget).closest('.nav-item').data('dropdown-type'));
            });
            
            $('.observable').on('document.ready.complete', documentReadyComplete);
            
            // var $navbarClone = $('nav').clone();
            // $('.sticky-header').append($navbarClone);
           
            $(window).on('scroll', function(e) {
                var $header = $('.sticky-header');
                $(e.currentTarget).scrollTop();
                if ($(e.currentTarget).scrollTop() > 60) {
                    $header.addClass('active');
                    //console.log('scrolling down: ' + $(e.currentTarget).scrollTop());
                } else {
                    $header.removeClass('active')
                    //console.log('scrolling up: ' + $(e.currentTarget).scrollTop());;
                }
            });
        };

        //implements a horizontal slide show.
        var slideShow = function () {
            
            var viewableWidth = $('.slide-viewer').get(0).clientWidth;
            
            var executeTransition = function(transitionToAssetIndex, direction, transitionDuration) {
                var defaultTransition = '1.5s';
                
                if (typeof(transitionDuration) === 'undefined') {
                    transitionDuration = defaultTransition;
                } 
                
                $('.asset-list')
                    .css({ transition: transitionDuration, transform: 'translate3d(-' + (transitionToAssetIndex * viewableWidth) + 'px, 0, 0)'})
                    .one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {
                        //if we've landed on a cloned asset, at the beginning or the end, we need to move to the correct asset (the one this is a clone of)
                        //By sending in a zero second transition, the active image will be switched to the real image, but the user doesn't experience the 
                        //change and the correct item will be queued up for the next transition.
                        if ($('.asset-item:eq('+ transitionToAssetIndex +')').hasClass('clone')) {
                            var $assetToShow = $('.asset-item:last').index() === transitionToAssetIndex ? $('.asset-item:not(.clone):first') : $('.asset-item:not(.clone):last');
                            executeTransition($assetToShow.index(), direction, '0s');
                            $('.asset-item:eq(' + transitionToAssetIndex + ')').removeClass('is-active');
                            $assetToShow.addClass('is-active');
                        }
                        // set the asset indicators
                        $('.asset-indicators .circle.is-active').removeClass('is-active');
                        $('.asset-indicators li:eq(' + ($('.asset-item.is-active').index() - 1) + ') .circle').addClass('is-active');
                    });
                };

            var startTransition = function (direction, index) {
                //console.log('direction: ' + direction + ' index:' + index);
                var visibleAssetIndex = $('.asset-item.is-active').index(),
                    transitionToAssetIndex = typeof (index) !== 'undefined' 
                                             ? index + 1 
                                             : direction === 'next' ? visibleAssetIndex + 1 : visibleAssetIndex - 1, // navigating by prev/next
                    //if the user is navigating by index, transitionDirection allows us to transition in the proper direction.
                    transitionDirection = typeof (index) !== 'undefined' 
                                          ? (transitionToAssetIndex > visibleAssetIndex ? 'next' : 'prev') 
                                          : direction;
                                
                $('.asset-item:eq(' + visibleAssetIndex + ')').removeClass('is-active');
                $('.asset-item:eq(' + transitionToAssetIndex + ')').addClass('is-active');
                
                if (visibleAssetIndex !== transitionToAssetIndex) {
                    executeTransition(transitionToAssetIndex, transitionDirection); //uses default transition duration    
                }      
            };

            var addCircleAssetIndicators = function () {
                //create asset indicator for each image
                var $assetIndicators = $('.asset-indicators'),
                    $circleTemplate = $assetIndicators.find('.template');

                $('.asset-item:not(.clone)').each(function () {
                    var $templateClone = $circleTemplate.clone();
                    $templateClone
                        .removeClass('template')
                        .appendTo($assetIndicators);
                });
                $circleTemplate.remove();
            };

            //The reason for cloning assets is to create the 
            //illusion of an infinite scrolling and have the transition
            //slide in the user's selected direction.  
            var createClonedAssets = function () {
                if ($('.asset-item').first().hasClass('clone')) {
                    return;  //already been done
                }
                var $first = $('.asset-item:first'),
                    $last = $('.asset-item:last');
                    
                $last.clone().prependTo($('.asset-list'));
                $first.clone().appendTo($('.asset-list'));
                    
                $('.asset-item').first().addClass('clone');
                $('.asset-item').last().addClass('clone');
            };
            
            var init = function () {
                
                createClonedAssets();
                
                var $assetItems = $('.asset-item');
                                 
                addCircleAssetIndicators();
                
                viewableWidth = $('.slide-viewer').get(0).clientWidth;
                
                $('.asset-list').css({width: ($assetItems.length * viewableWidth)});
                //set all assets sizes in pixels
                $assetItems.each(function() {
                    $(this).css( {width: viewableWidth});
                });

                executeTransition($('.asset-item:not(.clone):first').index(), 'next', '0s');
                
                $('.asset-item:not(.clone):first').addClass('is-active');
                $('.asset-indicators .circle').removeClass('is-active');
                $('.asset-indicators .circle:first').addClass('is-active');
            };

            //build the asset indicators, and set up the first rotation element
            init();

            var slideShowInterval = setInterval(function () {
               startTransition('next');
            }, 8000);

            var adjustSlideShowViewableArea = function() {
                init();
            }
            
            $('.slide-nav, .asset-indicators').on('click', function (e) {
                e.preventDefault();
                var direction = $(e.currentTarget).data('nav-direction'),
                    visibleAssetIndex = $('.asset-item.is-active').index();

                if (direction ) {
                    startTransition(direction);
                } else {
                    var transitionToIndex = $(e.currentTarget).find('li').index($(e.target).parents('li'));
                    if (visibleAssetIndex !== transitionToIndex + 1) { // + 1 because we've prepended a cloned element to list
                        startTransition(direction, transitionToIndex);
                    }
                }
                //clear the slide show scrolling
                clearInterval(slideShowInterval);                
            });

            $('.slide-nav').hover(function (e) {
                $(e.currentTarget).find('a').addClass('hovered');
            }, function(e) {
                $(e.currentTarget).find('a').removeClass('hovered');
            });
            
            $(window).resize( function() {
                adjustSlideShowViewableArea();
            });
        }; // end slideshow

        // public properties/methods
        return {
            init: function () {
                registerModuleEvents();
                slideShow();
            }
        };
    }());
}(window, jQuery));