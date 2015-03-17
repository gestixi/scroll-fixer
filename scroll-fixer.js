// ==========================================================================
// Project:     Scroll Fixer
// Description: jQuery plugin to fix element when scrolling down
// Copyright:   ©2013-2015 GestiXi
// License:     Licensed under the MIT license (see LICENCE)
// Version:     1.0
// Author:      Nicolas BADIA
// ==========================================================================

!function ($) { "use strict";

  // ..........................................................
  // SCROLLL FIXER PLUGIN DEFINITION
  //

  $.fn.scrollFixer = function ( option ) {

    this.each(function () {
      var $this = $(this),
          data = $this.data('scrollFixerData');

      if (!data) {
        var options = $.extend({}, $.fn.scrollFixer.defaults, typeof option == 'object' && option);

        $this.data('scrollFixerData', (data = new ScrollFixer(this, options)));

        $(window).on('touchmove', function(e) { data.didScroll(); });
        $(window).on('scroll', function(e) { data.scheduleUpdate(); });
        $(window).on('resize', function(e) { data.scheduleUpdate(); });

        data.didScroll(true);
      } 
      else {
        data.didScroll();
      }
    });
  }

  $.fn.scrollFixer.defaults = {

    /**
      Callback called when the element is fixed.

      @type Function
      @since Version 1.0
    */
    didFix: function() {},

    /**
      Callback called when the element is reset in it's initial position.

      @type Function
      @since Version 1.0
    */
    didUnfix: function() {},

    /**
      Delegate to allow or not to fix the element.

      @type Function
      @since Version 1.0
    */
    canFix: function() {
      return true;
    },

    /**
      Margin to apply at the top of the element when it is fixed.

      @type Number
      @default: 0
      @since Version 1.0
    */
    marginTop: 0,

    /**
      Box-shadow to add when the element is fixed.

      Note that if two elements are stick together, the box shadow will
      only be apply to the last element.
      
      @type String
      @default: '0 2px 10px rgba(0,0,0,0.25)'
      @since Version 1.0
    */
    boxShadow: '0 2px 10px rgba(0,0,0,0.25)',

    /**
      Value that will increment the `z-index` CSS property when the element is fixed.

      @type Number
      @default: 100
      @since Version 1.0
    */
    zIndex: 100
  }

  // ..........................................................
  // SCROLLL FIXER PUBLIC CLASS DEFINITION
  //

  var ScrollFixer = function (element, options) {
    this.element = element;
    this.options = options;

    var $element = this.$element = $(element);

    this._initialTop = $element.offset().top;
    this._initialCssTop = $element.css('top');
    var initialCssPosition = this._initialCssPosition = $element.css('position');
    this._initialBoxShadow = $element.css('box-shadow');
    this._initialZIndex = $element.css('z-index');

    this._placeholder = $('<div class="scroll-fixer-placeholder" style="position: '+initialCssPosition+'; z-index: -10; pointer-events: none;"></div>');
    $element.after(this._placeholder);
  }


  $.fn.scrollFixer.Constructor = ScrollFixer


  ScrollFixer.prototype = {

    constructor: ScrollFixer,

    /**
      The initial element.

      @type DOM Element
    */
    element: null,

    /**
      The passed options.

      @type Object
    */
    options: null,

    /**
      The elements currently fixed.

      @type Array
    */
    fixedElements: [],

    /**
      Core function
    */
    didScroll: function(firstTime) {
      this._didScheduleUpdate = false;

      var $window = $(window),
        $document = $(document),
        scrollTop = $window.scrollTop();

      // Ignore if the user scroll overflow the page
      if (scrollTop < 0 || scrollTop > $document.height()) return;

      var windowHash = $window.height() + ' ' + $window.width() + ' ' + scrollTop;
      if (this._windowHash === windowHash) return;
      this._windowHash = windowHash;

      var fixedElementsHeight = this.fixedElementsHeight(this);
      
      if (scrollTop > 0 && scrollTop + fixedElementsHeight >= this._initialTop && this.options.canFix.call(this)) {
        this.fixElement(firstTime);
      }
      else {
        this.unfixElement();
      }
    },

    /**
      Fix an element
    */
    fixElement: function(firstTime) {
      var $element = this.$element,
        options = this.options,  
        fixedElements = this.fixedElements,
        fixedElementsHeight = this.fixedElementsHeight(this),
        scrollTop = $(window).scrollTop();

      // We don't want to add a drop shadow if it is the first module which is already
      // fixed and is the page has not been scrolled yet.
      // And we want to remove the drop show if we had scroll to the top of the page
      if (options.boxShadow && (!this._hasDropShadow || scrollTop <= 0)) {
        this.resetBoxShadow();
        if (scrollTop > 0) {
          this._hasDropShadow = true;
          $element.css({ 'box-shadow': options.boxShadow });
        }
      }

      if (this.isFixed) {
        this.updateElementTopIfNeeded(fixedElementsHeight);
        return;
      }
      this.isFixed = true;

      fixedElements.push(this);

      this._elementTop = fixedElementsHeight;
      var elementHeight = $element.height();

      $element.css({ position: 'fixed', top: fixedElementsHeight, 'z-index': (parseInt(this._initialZIndex)||0)+options.zIndex });

      this._placeholder.css('height', elementHeight);

      // Take care of the fixed elements if an anchor is defined
      if (firstTime) {
        var anchor = window.location.hash.replace("#", "");
        if (anchor) window.scrollTo(0, scrollTop-(fixedElementsHeight+elementHeight));
      }

      this.options.didFix.call(this);
    },

    /**
      Unfix an element
    */
    unfixElement: function() {
      var $element = this.$element;

      if (!this.isFixed) return;
      this.isFixed = false;

      this.resetBoxShadow();

      var fixedElements = this.fixedElements;
      fixedElements.splice($.inArray(this, fixedElements), 1);

      $element.css({ position: this._initialCssPosition, top: this._initialCssTop, 'z-index': this._initialZIndex });
      this._placeholder.css('height', 0);

      this.options.didUnfix.call(this);
    },

    /**
      Compute the height of the fixed elements before the one
      passed in argument
      
      @returns {Number}
    */
    fixedElementsHeight: function() {
      var fixedElements = this.fixedElements,
        element = this,
        height = 0;

      if (fixedElements) {
        for (var i = 0; i < fixedElements.length; i++) {
          var fixedElement = fixedElements[i];

          if (fixedElement._initialTop < element._initialTop) {
            if (this.isVisibleOnScreen(fixedElement.$element)) {
              // We don't cache the element height in the case where it is variable
              height += fixedElements[i].$element.height();
            }
          }
        };
      }

      height += this.options.marginTop;

      return height;
    },

    /**
      Remove the box shadow from all the previouly fixed elements
    */
    resetBoxShadow: function() {
      var fixedElements = this.fixedElements;

      for (var i = 0; i < fixedElements.length; i++) {
        fixedElements[i].$element.css({ 'box-shadow': fixedElements[i]._initialBoxShadow });
        fixedElements[i]._hasDropShadow = false;
      };
    },

    /**
      In the case where a media query has force an element to be relative
      we need to check if the previous fixed element are still here.

      @param Number top
    */
    updateElementTopIfNeeded: function(top) {
      if (top !== this._elementTop) {
        this.$element.css({ top: top });

        this._elementTop = top;
      }
    },

    /**
      Return true if the element is visible on screen
      
      @param jQuery element
      @returns {Boolean}
    */
    isVisibleOnScreen: function($element) {
      var documentTop = $(window).scrollTop(),
        documentBottom = documentTop + $(window).height(),

        elementTop = $element.offset().top,
        elementBottom = elementTop + $element.height();

      return ((elementBottom <= documentBottom) && (elementTop >= documentTop));
    },

    /**
      @private

      Schedule an update.
    */
    scheduleUpdate: function() {
      if (this._didScheduleUpdate) return; 

      if (window.requestAnimationFrame) {
        var that = this;
        this._didScheduleUpdate = true;
        requestAnimationFrame(function() { that.didScroll(); });
      }
      else {
        this.didScroll();
      }
    }
  }

}(window.jQuery);
