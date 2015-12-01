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
            console.log('subscribe to the newsletter');
        };

        var registerEvents = function() {
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
        };

        var slideShow = function () {

            var transition = function (direction, index) {
                console.log('direction: ' + direction + ' index:' + index);
                var $visibleAsset = $('.asset-item.is-active'),
                    $nextAsset = $visibleAsset.next().length > 0 ? $visibleAsset.next() : $('.asset-item:first'),
                    $prevAsset = $visibleAsset.prev().length > 0 ? $visibleAsset.prev() : $('.asset-item:last'),
                    $transitionToAsset = typeof (index) !== 'undefined' ?
                        $('.asset-item:eq(' + index + ')') :
                        direction === 'next' ? $nextAsset : $prevAsset; // navigating by prev/next

                $visibleAsset.stop(true).animate({ opacity: 0 }, 500, function () {
                    $(this).removeClass('is-active').hide();
                    $transitionToAsset.show().stop(true).animate({ opacity: 1 }, 500, function () {
                        $(this).addClass('is-active');
                    });
                });
                $('.asset-indicators .circle.is-active').removeClass('is-active');
                $('.asset-indicators li:eq(' + ($('.asset-item').index('.is-active') + 1) + ') .circle').addClass('is-active');
            };

            //var slideShowInterval = setInterval(function () {
            //    transition('next');
            //}, 4000);

            //Gets the Asset we want to transition to next -- could be next
            //previous, or direct via an index.
            var getTransitionToAsset = function(direction, index) {
                var $visibleAsset = $('.asset-item.is-active'),
                    $nextAsset = $visibleAsset.next().length > 0 ? $visibleAsset.next() : $('.asset-item:first'),
                    $prevAsset = $visibleAsset.prev().length > 0 ? $visibleAsset.prev() : $('.asset-item:last');
                    return (typeof (index) !== 'undefined') ?
                        $('.asset-item:eq(' + index + ')') :
                        direction === 'next' ? $nextAsset : $prevAsset; // navigating by prev/next
            };

            //Because the implementation of this effect is images layered on top of each other, 
            //we control which one is shown via the z-index property on the .asset-item element. 
            //The visible asset has its z-index set to assetCount - 1, we want to set the one below
            //the one that is currently showing which will be assetCount - 2.
            var setTransitionToAssetZIndex = function($transitionToElement) {
                var assetCount = $('.asset-item').length,
                    transitionToZIndexValue = assetCount > 2 ? assetCount - 2 : 0;
                //reset any existing elements that have our new transitionToZIndexValue already
                $('.asset-item').each(function(i) {
                    var $this = $(this);
                    if ($this.css('z-index') === transitionToZIndexValue) {
                        $this.css('z-index', transitionToZIndexValue - 1);
                    }
                });
                $transitionToElement.css('z-index', transitionToZIndexValue);
            };

            var crossFadeImage = function (direction, index) {
                var assetCount = $('.asset-item').length,
                    visibleAssetIndex = $('.asset-item.is-active').index();
                
                if (visibleAssetIndex === -1) {
                    visibleAssetIndex = assetCount - 1;
                }

                direction = (typeof direction === 'undefined') ? 'next' : direction;

                var $visibleAsset = $('.asset-item').eq(visibleAssetIndex),
                    $transitionToAsset = getTransitionToAsset(direction, index),
                    transitionToAssetIndex = $transitionToAsset.index();

                setTransitionToAssetZIndex($transitionToAsset);

                $visibleAsset.fadeOut(function () {
                    $(this)
                        .css('z-index', 0)
                        .removeClass('is-active');
                    $('.asset-item:eq(' + transitionToAssetIndex + ')')
                        .css('z-index', assetCount - 1)
                        .addClass('is-active');

                    //$visibleAsset's z-index has changed to be at the bottom of the z-index stack
                    $(this).show();
                    //reset the indicators
                    $('.asset-indicators .circle.is-active').removeClass('is-active');
                    $('.asset-indicators li:eq(' + ($('.asset-item.is-active').index()) + ') .circle').addClass('is-active');
                });
            };

            var addCircleAssetIndicators = function () {
                //create asset indicator for each image
                var $assetIndicators = $('.asset-indicators'),
                    $circleTemplate = $assetIndicators.find('.template');

                $('.asset-item').each(function () {
                    var $templateClone = $circleTemplate.clone();
                    $templateClone
                        .removeClass('template')
                        .appendTo($assetIndicators);
                });
                $circleTemplate.remove();
            };

            var init = function () {
                addCircleAssetIndicators();

                $('.asset-item:first')
                    .show()
                    .animate({ opacity: 1.0 }, 500)
                    .css('z-index', $('.asset-item').length - 1); //for cross-fade effect


                //.addClass('is-active'); //commenting for cross-fade effect
                $('.asset-indicators .circle:first').addClass('is-active');
            };

            //build the asset indicators, and set up the first rotation element
            init();

            var autoRotateCrossFade = setInterval(function() {
                crossFadeImage('next');
            }, 4000);
            
            $('.slide-nav, .asset-indicators').on('click', function (e) {
                e.preventDefault();
                var direction = $(e.currentTarget).data('nav-direction'),
                    visibleAssetIndex = $('.asset-item.is-active').index();

                if (direction ) {
                    //transition(direction);
                    //console.log('direction clicked:' + direction + ' visibleAssetIndex:' + visibleAssetIndex);
                    crossFadeImage(direction);
                } else {
                    var transitionToIndex = $(e.currentTarget).find('li').index($(e.target).parents('li'));
                    if (visibleAssetIndex !== transitionToIndex) {
                        crossFadeImage(direction, transitionToIndex);
                    }
                    //e.currentTarget represents the ul container, and e.target represents the circle span
                    //console.log($(e.currentTarget).find('li').index($(e.target).parents('li'));
                    //transition('', $(e.currentTarget).find('li').index($(e.target).parents('li')));
                }
                //clear the slide show scrolling
                //clearInterval(slideShowInterval); // commenting for cross fade                
                clearInterval(autoRotateCrossFade);
            });

            $('.slide-nav').hover(function (e) {
                $(e.currentTarget).find('a').addClass('hovered');
            }, function(e) {
                $(e.currentTarget).find('a').removeClass('hovered');
            });

        }

        // public properties/methods
        return {
            init: function () {
                registerEvents();
                slideShow();
            }
        };
    }());
}(window, jQuery));