# jquery.bug-gui
A jQuery plugin to make, send and download bug report by screenshot.  

!['Bug GUI'](http://i.imgur.com/Qr2VYFt.png)

#Requirements

* [jQuery](https://jquery.com/)
* [html2canvas](http://html2canvas.hertzen.com/)

#Installation

Using bower is the simplest way.

    bower install jquery.bug-gui --save-dev

#Preparation

You need to load jQuery, html2canvas and jquery.bug-gui like the next.

(in HTML)

    <script src="http://example.com/bower_components/jquery/dist/jquery.min.js"></script>
    <script src="http://example.com/bower_components/html2canvas/build/html2canvas.min.js"></script>
    <script src="http://example.com/bower_components/jquery.bug-gui/jquery.bug-gui.js"></script>

#Usage

**Basic Way**

    $(document).ready(function(){

        $.buggui();
        
    });
    
**Options**

You can set your own options by object like this.

    $(document).ready(function(){

        $.buggui({
        
            *****: '*****'
        
        });
        
    });

**url(string)**


    URL that receive image data which is data URIs of PNG.  
    A folder called "examples" has a php file to receive image data and save it.
    
    
**buttonPosition(string: `top-left`, `top-right`, `bottom-left` or `bottom-right`)**


    Bug GUI's button position.
    Default is `top-right`.
    
**color(string)**


    Color to draw on canvas.
    e.g. "red", "#ff0000"
    
**lineWidth(number)**


    Line width to draw on canvas.
    Default is 3.
    
**fontSize(number)**


    Font size to draw on canvas.
    Default is 16.
    
**messages(object)**


    Sentences for messages that Bug GUI provides. (A folder called messages has Japanese messages)
    Default is the below.
    
    messages: {
        init: 'Bug report is being prepared..',
        drawText: 'Drawing Text..',
        drawRect: 'Drawing a Rectangle..',
        drawOval: 'Drawing an Oval..',
        drawArrow: 'Drawing an Arrow Line..',
        undo: 'Undo..',
        download: 'Downloading..',
        send: 'Are you sure you want to send the bug report?',
        clear: 'Are you sure you want to delete the bug report?',
        launch:  'Bug GUI (it could take a while to launch.)',
        notSupported: 'Unfortunately, this browser is not supported.'
    }

    Note: Please let me know if you notice mistakes in English or you have better expressions. Thank you in advance!
    
**parameters(object)**


    Additional parameters to send the access detail.
    I believe you should use this option to send GET or(and) POST values from server side program like PHP.    
     
**callbacks(object: `done`, `fail` and `always`)**


    You can set 3 type of callbacks named "done", "fail" and "always" like this.  

    callbacks: {
        done: function(json, imageData){

            // Success

        },
        fail: function(imageData){

            // Error

        },
        always: function(imageData){

            // Finished

        }
    }
    
* Note: If only `always` is set, although `always` function will be called but ajax will not be fired.
    
**availableButtons(array)**


    Buttons you'd like to show.
    And you also can set button order by this option like this.

    availableButtons: [
        'send',
        'download',
        'undo',
        'text',
        'arrow',
        'rect',
        'oval',
        'clear'
    ]
    
Note: As of 20 Nov 2015, unfortunately IE and Safari don't support "download" option. See [here](http://caniuse.com/#search=download)

**target(object)**
    
You can change target that you'd like to take a screenshot.  
In usual you don't need to set this.

    target: {
        id: 'YOUR-ID'
    }
    
    // or 

    target: {
        className: 'YOUR-CLASS-NAME'
    }
    
The next is for [Google Material Design Lite](http://www.getmdl.io/templates/index.html).
    
    target: {
        className: 'mdl-layout__content'
    }
    
#License

This package is licensed under the MIT License.

Copyright 2015 Sukohi Kuhoh