Scroll Fixer
==============

This jQuery plugin make it easy to fix elements one the top of the page when scolling down.


You can see it in action on our [website](https://www.gestixi.com).


------

## Installation

form-submitter depends on jQuery. To use it, include this in your page :

    <script src="jquery.js" type="text/javascript"></script>
    <script src="scroll-fixer.js" type="text/javascript"></script>


------

## Usage

    
    $(document).ready(function() {
      $('.menu').scrollFixer();
    });
    


------

## Options


### didFix *{function}*

Callback called when the element is fixed.

Example:

    $('.menu').scrollFixer({
      didFix: function() {
        console.log('This element is fixed: ', this.element);
      }
    });


### didUnfix *{function}*

Delegate to allow or not to fix the element.


### canFix *{function}*

Delegate to allow or not to fix the element.

Example:

    $('.menu').scrollFixer({
      canFix: function(element) {
        var width = $(window).width();

        if (width <= 480) {
          return false;
        }

        return true;
      }
    });


### marginTop *{number}*

Margin to apply at the top of the element when it is fixed.

Default: 0


### boxShadow *{string}*

Box-shadow to add when the element is fixed.

Note that if two elements are stick together, the box shadow will
only be apply to the last element.

Default: '0 2px 10px rgba(0,0,0,0.25)'


### zIndex *{number}*

Value that will increment the `z-index` CSS property when the element is fixed.

Default: 100



------

## Properties


## element

The DOM element.

Example:

    $('form').formSubmitter({ 
      didFix: function(evt) {
        console.log(this.element);
      }
    });


### options

The options object.



------

## Author

**Nicolas Badia**

+ [https://twitter.com/@nicolas_badia](https://twitter.com/@nicolas_badia)
+ [https://github.com/nicolasbadia](https://github.com/nicolasbadia)

------

## Copyright and license

Copyright 2013-2015 GestiXi under [The MIT License (MIT)](LICENSE).
