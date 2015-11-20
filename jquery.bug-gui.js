;(function($) {

    var BG = {

        url: '',
        ids: {
            'bugButton': 'bug-gui-button',
            'controller': 'bug-gui-controller',
            'editor': 'bug-gui-editor',
            'canvas': 'bug-gui-canvas',
            'textInput': 'bug-gui-text-input',
            'textInputSettle': 'bug-gui-text-input-settle',
            'textInputBox': 'bug-gui-text-input-box',
            'textRuler': 'bug-gui-text-ruler',
            'downloadLink': 'bug-gui-download-link',
            'message': 'bug-gui-message'
        },
        buttonPositions: {
            'top-left': 'top:10px;left:10px;',
            'top-right': 'top:10px;right:10px;',
            'bottom-left': 'bottom:10px;left:10px;',
            'bottom-right': 'bottom:10px;right:10px;'
        },
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
        },
        drawType: 'text',
        baseZInded: 100000,
        mousePositions: {
            startX: null,
            startY: null,
            endX: null,
            endY: null
        },
        canvasContext: null,
        currentCanvas: null,
        mouseMovingFlag: false,
        canvasFlag: false,
        textInputFlag: false,
        dir: '',
        histories: [],
        options: {},
        parameters: {},
        init: function(options){

            if(options == undefined) {

                options = {};

            }

            if(options.url == undefined) {

                options.url = BG.url;

            }

            if(options.buttonPosition == undefined) {

                options.buttonPosition = 'top-right';

            }

            if(options.color == undefined) {

                options.color = '#ff0000';

            }

            if(options.lineWidth == undefined) {

                options.lineWidth = 3;

            }

            if(options.fontSize == undefined) {

                options.fontSize = 16;

            }

            if(options.lineHeight == undefined) {

                options.lineHeight = 1.3;

            }

            if(options.messages != undefined) {

                BG.messages = options.messages;

            }

            if(typeof(options.parameters) == 'object') {

                BG.parameters = options.parameters;

            }
            BG.parameters.time = Math.floor($.now() / 1000);
            BG.parameters.url = location.href;
            BG.parameters.referrer = document.referrer;

            BG.options = options;
            BG.generateStyleSheet();
            BG.generateController();
            BG.addEvents();

        },
        currentDir: function(){

            if(BG.dir == '') {

                var regexp = new RegExp('jquery\\.bug-gui\\.js$');

                $('script').each(function(index, scriptTag){

                    var src = $(scriptTag).attr('src');

                    if(src != undefined && src.match(regexp)) {

                        BG.dir = src.replace('jquery.bug-gui.js', '');
                        return;

                    }

                });

            }

            return BG.dir;

        },
        generateController: function(){

            var parameterTag = '';

            $.each(BG.parameters, function(key, value){

                parameterTag += '<input name="'+ key +'" type="text" value="'+ value +'">';

            });
            var currentDir = BG.currentDir();
            var controllerButtons = BG.generateControllerButtons(currentDir);
            var message = '<span id="'+ BG.ids.message +'" class="bug-gui-hidden"></span>';
            var controller = '<div id="'+ BG.ids.controller +'">'+
                '<div class="bug-gui-controller">'+
                '<span id="'+ BG.ids.editor +'" class="bug-gui-hidden">'+ controllerButtons +
                '<img src="'+ currentDir +'images/separator.png">'+
                '</span>'+
                '<img id="'+ BG.ids.bugButton +'" src="'+ currentDir +'images/bug.png" class="bug-gui-main-button">'+
                '</div>'+
                message +
                '</div>'+
                '<div id="'+ BG.ids.canvas +'"></div>'+
                '<span id="'+ BG.ids.textRuler +'"></span>'+
                '<div id="'+ BG.ids.textInputBox +'">'+
                '<textarea id="'+ BG.ids.textInput +'" type="text" value=""></textarea><br>'+
                '<img id="'+ BG.ids.textInputSettle +'" src="'+ currentDir +'images/check.png">'+
                '</div>';
            $(document.body).append(controller);

        },
        generateControllerButtons: function(currentDir){

            var originalButtonKeys = [
                'send', 'download', 'undo', 'arrow', 'text', 'rect', 'oval', 'clear'
            ];
            var buttonKeys = (BG.options.availableButtons == undefined) ? originalButtonKeys : BG.options.availableButtons;
            var html = '';

            $.each(buttonKeys, function(index, buttonKey){

                if($.inArray(buttonKey, originalButtonKeys) > -1) {

                    if(buttonKey == 'download') {

                        html += '<a id="'+ BG.ids.downloadLink +'" href="#"><img class="bug-gui-buttons" data-button-type="'+ buttonKey +'" src="'+ currentDir +'images/'+ buttonKey +'.png"></a>';

                    } else {

                        html += '<img class="bug-gui-buttons" data-button-type="'+ buttonKey +'" src="'+ currentDir +'images/'+ buttonKey +'.png">';

                    }

                }

            });

            return html;

        },
        generateCanvas: function(){

            if(BG.hasCanvas()) {

                return;

            }

            var scrollTop = $(window).scrollTop();
            var scrollLeft = $(window).scrollLeft();
            $('#'+ BG.ids.controller).css('display', 'none');

            var target;

            if(typeof(BG.options.target) == 'object') {

                $.each(BG.options.target, function(type, value){

                    if(type == 'className') {

                        target = document.getElementsByClassName(value)[0];

                    } else if(type == 'id') {

                        target = document.getElementById(value);

                    }

                    return;

                });

            } else {

                target = document.body;

            }

            html2canvas(target, {
                background: '#000000',
                onrendered: function(canvas) {

                    BG.setCanvas(canvas);
                    BG.drawSettings();

                    $('#'+ BG.ids.controller).css('display', 'block');
                    BG.canvasFlag = true;
                    BG.setMessage(BG.messages.init);

                    $('#'+ BG.ids.canvas +' canvas').on('mousedown mouseup mousemove mouseout', function(e){

                        BG.mouseEvents(e);

                    });

                    $(window).scrollTop(scrollTop)
                        .scrollLeft(scrollLeft);

                }
            });

        },
        generateStyleSheet: function(){

            var buttonPosition = BG.buttonPositions[BG.options.buttonPosition];
            var controllerFloat = ($.inArray(BG.options.buttonPosition, ['top-left', 'bottom-left']) == -1) ? 'float:right;' : 'float:left;'
            var styleSheet = '<style type="text/css">'+
                '#'+ BG.ids.controller +'{ position:fixed;z-index:'+ BG.getZIndex(2) +';'+ buttonPosition +' }'+
                '#'+ BG.ids.controller +' *{ line-height:0px; }'+
                '#'+ BG.ids.canvas +' { position:absolute;top:0;left:0;z-index:'+ BG.getZIndex() +'; }'+
                '#'+ BG.ids.canvas +' canvas { cursor: text }'+
                '#'+ BG.ids.message +'{ font-size:16px;color:#dedede;padding:5px 15px;margin:0 20px;background:#555;opacity: 0.95;border-radius:5px; }'+
                '#'+ BG.ids.bugButton +'{ cursor:pointer; }'+
                '#'+ BG.ids.textInput +'{ color:#ff0000;border:none;background:none;padding:0;margin:0;resize:none;outline:none;overflow:hidden;font-size:'+ BG.options.fontSize +'px;line-height:'+ BG.options.lineHeight +'em; }'+
                '#'+ BG.ids.textInput +':focus { color:#ff0000; }'+
                '#'+ BG.ids.textInputBox +'{ position:absolute;top:-999px;left:-999px;border:none;background:#ffeeee;padding:0;margin:0;z-index:'+ BG.getZIndex(1) +' }'+
                '#'+ BG.ids.textInputSettle +'{ cursor:pointer;box-shadow: 1px 1px 1px 1px #666; }'+
                '#'+ BG.ids.textRuler +'{ position:absolute;top:-999px;left:-999px;padding:0; }'+
                '#'+ BG.ids.downloadLink +'{ text-decoration:none;outline:none; }'+
                '.bug-gui-controller{ background:rgb(177, 66, 66);box-shadow: 2px 2px 2px 2px #666;padding:7px;border-radius:25px;'+ controllerFloat +' }'+
                '.bug-gui-main-button{ cursor:pointer;width:24px;height:24px; }'+
                '.bug-gui-buttons{ cursor:pointer;width:24px;height:24px;margin:0 5px;opacity:0.95; }'+
                '.bug-gui-hidden{ display:none; }'+
                '</style>';
            $(styleSheet).appendTo('head');

        },
        addEvents: function(){

            $('#'+ BG.ids.bugButton).on('click mouseover mouseout', function(e){

                if(e.type == 'click') {

                    BG.editorToggle();
                    BG.generateCanvas();

                } else if(!BG.hasCanvas()) {

                    if(e.type == 'mouseover') {

                        BG.setMessage(BG.messages.launch);

                    } else if(e.type == 'mouseout') {


                        BG.clearMessage();

                    }

                }
            });
            $('#'+ BG.ids.textInput).on('keyup', function(e){

                BG.changeTextInputSize();

            });
            $('#'+ BG.ids.textInputSettle).on('click', function(e){

                BG.endTextInput();

            });
            $('#'+ BG.ids.downloadLink).on('click', function(){

                var a = document.createElement('a');

                if(typeof a.download == "undefined") {

                    alert(BG.messages.notSupported);
                    return false;

                } else {

                    BG.setMessage(BG.messages.download);
                    this.href = BG.getImageData();
                    this.download = BG.getFileName();

                }

            });
            $('.bug-gui-buttons').on('click', function(){

                if(BG.textInputFlag) {

                    BG.endTextInput();

                }

                var buttonType = $(this).data('button-type');
                var cursorType = 'crosshair';

                if(buttonType == 'clear') {

                    if(confirm(BG.messages.clear)) {

                        BG.clearCanvas();
                        BG.clearMessage();
                        BG.editorToggle();

                    }

                } else if(buttonType == 'arrow') {

                    BG.setMessage(BG.messages.drawArrow);
                    BG.setDrawType(buttonType);

                } else if(buttonType == 'text') {

                    BG.setMessage(BG.messages.drawText);
                    BG.setDrawType(buttonType);
                    cursorType = 'text';

                } else if(buttonType == 'rect') {

                    BG.setMessage(BG.messages.drawRect);
                    BG.setDrawType(buttonType);

                } else if(buttonType == 'oval') {

                    BG.setMessage(BG.messages.drawOval);
                    BG.setDrawType(buttonType);

                } else if(buttonType == 'undo') {

                    if(BG.histories.length > 0) {

                        BG.histories.splice(-1, 1);
                        BG.restoreHistories();

                    }

                    BG.setMessage(BG.messages.undo);

                } else if(buttonType == 'send') {

                    if(confirm(BG.messages.send)) {

                        var imageData = BG.getImageData();
                        var url = (BG.options.url == undefined) ? '' : BG.options.url;
                        var params = BG.parameters;
                        params.editedData = BG.editedData();
                        params.image_data = imageData;
                        params.file_name = BG.getFileName();

                        $.post(url, params).done(function(json){

                                if(typeof(BG.options.callbacks.done) == 'function') {

                                    BG.options.callbacks.done(json, imageData);

                                }

                            }, 'json')
                            .fail(function(){

                                if(typeof(BG.options.callbacks.fail) == 'function') {

                                    BG.options.callbacks.fail(imageData);

                                }

                            })
                            .always(function(){

                                if(typeof(BG.options.callbacks.always) == 'function') {

                                    BG.options.callbacks.always(imageData);

                                }

                            });

                    }

                }

                BG.setCursor(cursorType);

            });

        },
        hasCanvas: function(){

            return BG.canvasFlag;

        },
        editorToggle: function(){

            $('#'+ BG.ids.editor).toggleClass('bug-gui-hidden');

            if(BG.hasCanvas() && $('#'+ BG.ids.editor).is(':visible')) {

                BG.showMessage();

            } else {

                BG.hideMessage();

            }

        },
        setMessage: function(text){

            $('#'+ BG.ids.message).text(text).removeClass('bug-gui-hidden');

        },
        clearMessage: function(){

            $('#'+ BG.ids.message).text('').addClass('bug-gui-hidden');

        },
        hideMessage: function(){

            $('#'+ BG.ids.message).addClass('bug-gui-hidden');

        },
        showMessage: function(){

            $('#'+ BG.ids.message).removeClass('bug-gui-hidden');

        },
        setDrawType: function(type){

            BG.drawType = type;

        },
        mouseEvents: function(e){

            e.stopPropagation();
            e.preventDefault();

            if(BG.drawType == 'text' && BG.textInputFlag && $('#'+ BG.ids.textInput).val() != '') {

                return;

            }
            var eventType = e.type;
            var mouseX = parseInt(e.clientX) + $(window).scrollLeft();
            var mouseY = parseInt(e.clientY) + $(window).scrollTop();

            if(eventType == 'mousedown') {

                BG.setMouseState({
                    startX: mouseX,
                    startY: mouseY
                }, true);

            } else if(eventType == 'mouseup') {

                if(BG.drawType == 'text') {

                    BG.setMouseState({
                        endX: BG.mousePositions.startX,
                        endY: BG.mousePositions.startY
                    }, false);
                    BG.showTextInput();

                } else {

                    BG.setMouseState({
                        endX: mouseX,
                        endY: mouseY
                    }, false);
                    BG.setHistory();

                }

            } else if(eventType == 'mousemove') {

                BG.setMouseState({
                    endX: mouseX,
                    endY: mouseY
                });
                BG.drawCanvas({
                    startX: BG.mousePositions.startX,
                    startY: BG.mousePositions.startY,
                    endX: mouseX,
                    endY: mouseY
                });

            }

        },
        drawCanvas: function(positions){

            if(!BG.mouseMovingFlag || !BG.isEnoughLength()) {

                return;

            }

            BG.restoreHistories();

            if(BG.drawType == 'arrow') {

                BG.drawArrow(positions);

            } else if(BG.drawType == 'rect') {

                BG.drawRect(positions);

            } else if(BG.drawType == 'oval') {

                BG.drawOval(positions);

            }

        },
        drawArrow: function(positions){

            BG.canvasContext.save();
            var dist = Math.sqrt(
                (positions.endX - positions.startX) * (positions.endX - positions.startX) +
                (positions.endY - positions.startY) * (positions.endY - positions.startY)
            );

            BG.canvasContext.beginPath();
            BG.canvasContext.lineWidth = BG.options.lineWidth;
            BG.canvasContext.strokeStyle = BG.options.color;
            BG.canvasContext.moveTo(positions.startX, positions.startY);
            BG.canvasContext.lineTo(positions.endX, positions.endY);
            BG.canvasContext.stroke();

            var angle = Math.acos((positions.endY - positions.startY) / dist);

            if (positions.endX < positions.startX){

                angle = 2 * Math.PI - angle;

            }

            var size = BG.options.lineWidth * 2;
            BG.canvasContext.beginPath();
            BG.canvasContext.translate(positions.endX, positions.endY);
            BG.canvasContext.rotate(-angle);
            BG.canvasContext.fillStyle = BG.options.color;
            BG.canvasContext.lineWidth = BG.options.lineWidth;
            BG.canvasContext.strokeStyle = BG.options.color;
            BG.canvasContext.moveTo(0, -size);
            BG.canvasContext.lineTo(-size, -size);
            BG.canvasContext.lineTo(0, 0);
            BG.canvasContext.lineTo(size, -size);
            BG.canvasContext.lineTo(0, -size);
            BG.canvasContext.closePath();
            BG.canvasContext.fill();
            BG.canvasContext.stroke();
            BG.canvasContext.restore();

        },
        drawRect: function(positions){

            positions = BG.correctPositions(positions);
            var differentX = positions.endX - positions.startX;
            var differentY = positions.endY - positions.startY;

            BG.canvasContext.beginPath();
            BG.canvasContext.rect(
                positions.startX,
                positions.startY,
                differentX,
                differentY
            );
            BG.canvasContext.stroke();

        },
        drawOval: function(positions){

            positions = BG.correctPositions(positions);
            var differentX = positions.endX - positions.startX;
            var differentY = positions.endY - positions.startY;
            var kappa = .5522848;
            var offsetX = (differentX / 2) * kappa;
            var offsetY = (differentY / 2) * kappa;
            var centerX = (positions.startX + positions.endX) / 2;
            var centerY = (positions.startY + positions.endY) / 2;

            BG.canvasContext.beginPath();
            BG.canvasContext.moveTo(positions.startX, centerY);
            BG.canvasContext.bezierCurveTo(
                positions.startX,
                centerY - offsetY,
                centerX - offsetX,
                positions.startY,
                centerX,
                positions.startY
            );
            BG.canvasContext.bezierCurveTo(
                centerX + offsetX,
                positions.startY,
                positions.endX,
                centerY - offsetY,
                positions.endX,
                centerY
            );
            BG.canvasContext.bezierCurveTo(
                positions.endX,
                centerY + offsetY,
                centerX + offsetX,
                positions.endY,
                centerX,
                positions.endY
            );
            BG.canvasContext.bezierCurveTo(
                centerX - offsetX,
                positions.endY,
                positions.startX,
                centerY + offsetY,
                positions.startX,
                centerY
            );
            BG.canvasContext.stroke();

        },
        drawText: function(text, positions){

            var fontFamily = $('#'+ BG.ids.textInput).css('font-family');
            var fontSize = $('#'+ BG.ids.textInput).css('font-size');

            BG.canvasContext.font = fontSize +' '+ fontFamily;
            var texts = text.split("\n");
            var lineHeight = BG.getLineHeight();

            $.each(texts, function(index, text){

                var additionalHeight = index * lineHeight;
                BG.canvasContext.fillStyle = BG.options.color;
                BG.canvasContext.fillText(text, positions.startX, (positions.startY + additionalHeight));

            });

        },
        drawProjectName: function(context, width, height){

            context.font = '10px arial';
            context.fillStyle = '#555';
            context.fillText(
                'Generated by jquery.bug-gui',
                (width - 160),
                (height - 10)
            );

        },
        setMouseState: function(values, movingFlag){

            $.each(values, function(key, value){

                if($.inArray(key, ['startX', 'startY', 'endX', 'endY']) > -1) {

                    BG.mousePositions[key] = value;

                }

            });

            if(movingFlag != undefined) {

                BG.mouseMovingFlag = movingFlag;

            }

        },
        drawSettings: function(){

            BG.canvasContext.strokeStyle = BG.options.color;
            BG.canvasContext.lineWidth = BG.options.lineWidth;

        },
        setCanvas: function(canvas){

            $('#'+ BG.ids.canvas).empty().append(canvas);
            BG.canvasContext = canvas.getContext('2d');
            BG.currentCanvas = BG.cloneCanvas(canvas);

        },
        cloneCanvas: function(originalCanvas){

            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');

            canvas.width = originalCanvas.width;
            canvas.height = originalCanvas.height;
            context.drawImage(originalCanvas, 0, 0);
            return canvas;

        },
        clearCanvas: function(){

            BG.refreshCanvas();
            $('canvas').remove();
            BG.canvasContext = null;
            BG.canvasFlag = false;
            BG.histories = [];

        },
        refreshCanvas: function(){

            var width = $('#'+ BG.ids.canvas).width();
            var height = $('#'+ BG.ids.canvas).height();
            BG.canvasContext.clearRect(0, 0, width, height);

        },
        restoreHistories: function(){

            BG.canvasContext.drawImage(BG.currentCanvas, 0, 0);

            $.each(BG.histories, function(index, values){

                var type = values.type;
                var positions = values.positions;

                if(type == 'arrow') {

                    BG.drawArrow(positions);

                } else if(type == 'rect') {

                    BG.drawRect(positions);

                } else if(type == 'oval') {

                    BG.drawOval(positions);

                } else if(type == 'text') {

                    var text = values.text;
                    BG.drawText(text, positions);

                }

            });

        },
        setHistory: function(){

            if(BG.drawType != 'text' && !BG.isEnoughLength()) {

                return;

            }

            var historyValues = {
                type: BG.drawType,
                positions: {
                    startX: BG.mousePositions.startX,
                    startY: BG.mousePositions.startY,
                    endX: BG.mousePositions.endX,
                    endY: BG.mousePositions.endY
                }
            };

            if(BG.drawType == 'text') {

                var rulerElement = $('#'+ BG.ids.textRuler);
                var rulerWidth = rulerElement.width();
                var rulerHeight = rulerElement.height();
                var inputElement = $('#'+ BG.ids.textInput);
                historyValues.positions.startY += parseInt(inputElement.css('line-height')) - 1;
                historyValues.positions.endX = historyValues.positions.startX + rulerWidth;
                historyValues.positions.endY = historyValues.positions.startY + rulerHeight;
                historyValues['text'] = inputElement.val();

            }

            BG.histories.push(historyValues);

        },
        correctPositions: function(positions){

            if(positions.startX > positions.endX) {

                var startX = positions.startX;
                var endX = positions.endX;
                positions.startX = endX;
                positions.endX = startX;

            }

            if(positions.startY > positions.endY) {

                var startY = positions.startY;
                var endY = positions.endY;
                positions.startY = endY;
                positions.endY = startY;

            }

            return positions;

        },
        setCursor: function(cursorType){

            $('canvas').css('cursor', cursorType);

        },
        getZIndex: function(additionalCount){

            if(additionalCount == undefined) {

                additionalCount = 0;

            }

            return BG.baseZInded + additionalCount;

        },
        showTextInput: function(){

            var canvas = BG.getCanvas();
            var canvasWidth = canvas.width;
            var top = BG.mousePositions.endY;
            var left = BG.mousePositions.endX;
            var scrollTop = $(window).scrollTop();
            var scrollLeft = $(window).scrollLeft();
            $('#'+ BG.ids.textInputBox).css({
                top: top,
                left: left,
                display: 'block',
                width: (canvasWidth - left),
                background: 'none'
            })
            $('#'+ BG.ids.textInput).val('').focus();
            BG.changeTextInputHeight();
            BG.textInputFlag = true;
            $(window).scrollTop(scrollTop);
            $(window).scrollLeft(scrollLeft);

        },
        endTextInput: function(){

            var text = $('#'+ BG.ids.textInput).val();

            if(text != '') {

                BG.drawText(text, BG.mousePositions);
                BG.setHistory();

            }

            BG.changeTextInputHeight();
            $('#'+ BG.ids.textInputBox).css('display', 'none');
            BG.restoreHistories();
            BG.textInputFlag = false;

        },
        changeTextInputSize: function(){

            var inputElement = $('#'+ BG.ids.textInput);
            var rulerElement = $('#'+ BG.ids.textRuler);
            var fontSize = inputElement.css('font-size');
            var fontFamily = inputElement.css('font-family');
            rulerElement.css({
                fontSize: fontSize,
                fontFamily: fontFamily
            });
            var text = inputElement.val();
            var html = text.replace(/\r?\n/g, '<br>');
            rulerElement.html(html);
            var lineBreakCount = (html.match(/<br>/g) || []).length + 2;
            BG.changeTextInputWidth();
            BG.changeTextInputHeight(lineBreakCount);

        },
        changeTextInputWidth: function(){

            var width = BG.getCanvas().width - BG.mousePositions.startX;
            $('#'+ BG.ids.textInput).width(width);

        },
        changeTextInputHeight: function(lineCount){

            if(lineCount == undefined) {

                lineCount = 2;

            }

            var inputElement = $('#'+ BG.ids.textInput);
            var lineHeight = BG.getLineHeight();
            var height = lineHeight * lineCount;
            inputElement.height(height);

        },
        getLineHeight: function(){

            var fontSize = parseInt($('#'+ BG.ids.textInput).css('font-size'));
            return fontSize * BG.options.lineHeight;

        },
        getCanvas: function(){

            return $('#'+ BG.ids.canvas +' canvas')[0];

        },
        isEnoughLength: function(){

            var differentX = BG.mousePositions.endX - BG.mousePositions.startX;
            var differentY = BG.mousePositions.endY - BG.mousePositions.startY;
            var length = Math.sqrt(Math.pow(differentX, 2) + Math.pow(differentY, 2));

            if(differentX == 0 || differentY == 0){

                return false;

            }

            return (length > 5);

        },
        editedData: function(){

            if(BG.histories.length == 0) {

                return {
                    start: {x: -1, y: -1},
                    end: {x: -1, y: -1},
                    width: 0,
                    height: 0
                };

            }

            var xValues = [];
            var yValues = [];

            $.each(BG.histories, function(index, values){

                var positions = values.positions;
                xValues.push(
                    parseInt(positions.startX),
                    parseInt(positions.endX)
                );
                yValues.push(
                    parseInt(positions.startY),
                    parseInt(positions.endY)
                );

            });

            var startX = Math.min.apply(null, xValues);
            var startY = Math.min.apply(null, yValues);
            var endX = Math.max.apply(null, xValues);
            var endY = Math.max.apply(null, yValues);

            return {
                start: {x: startX, y: startY},
                end: {x: endX, y: endY},
                width: (endX - startX),
                height: (endY - startY)
            }

        },
        getImageData: function(){

            var canvas = BG.getCanvas();
            var canvasContext = BG.canvasContext;
            var canvasWidth = canvas.width;
            var canvasHeight = canvas.height;
            BG.drawProjectName(canvasContext, canvasWidth, canvasHeight);
            return canvas.toDataURL();

        },
        getFileName: function(){

            var date = new Date(BG.parameters.time*1000);
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var seconds = date.getSeconds();
            return 'bug-gui-'+ year +'-'+ month +'-'+ day +' '+ hours +'-'+ minutes +'-'+ seconds +'.png';

        }

    };

    jQuery.buggui = function(options) {

        BG.init(options);

    }

})(jQuery);