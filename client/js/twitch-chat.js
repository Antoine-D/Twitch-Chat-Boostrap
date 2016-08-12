var randomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

var selectRandomColor = function() {
    var randomColorI = Math.floor(Math.random() * $('#chat-color-options div').length);
    $('#chat-color-options div').eq(randomColorI).addClass('selected');
};

// assign this client a random username and color
var myUsername = 'user' + randomInt(1000, 10000).toString();
selectRandomColor();

$(function() {
    var $scrollableChatArea = $('#chat-area-scrollable-middle');
    $scrollableChatArea.height($(window).height() - 190);
    $scrollableChatArea.prop('scrollTop', $scrollableChatArea.prop('scrollHeight'));
});

$( window ).resize(function() {
    var $scrollableChatArea = $('#chat-area-scrollable-middle');
    $scrollableChatArea.height($(window).height() - 190);
});

$('#chat-color-options div').on( 'click', function() {
    $('#chat-color-options .selected').removeClass('selected');
    $( this ).addClass('selected');

    $('#settings-modal').modal('hide');
    $('#chat-textbox').focus();
});

$('#show-timestamp-checkbox').on( 'change', function() {
    if ($('#show-timestamp-checkbox').is(':checked')) {
        $('.timestamp').show();
    }
    else {
        $('.timestamp').hide();
    }
});

var socket = io.connect('<node_server_ip>:<port>', {reconnect: true});

var sendChatMessage = function() {
    if($('#chat-textbox').val().trim().length > 0) {
        var chatMessage = {};
        chatMessage.username = myUsername;
        chatMessage.text = $('#chat-textbox').val();
        chatMessage.date = (new Date()).getTime();
        chatMessage.authorColor = getSelectedColor();
        socket.emit('chat message', chatMessage);
    }

    // clear the textbox
    $('#chat-textbox').val('');
};

$('#send-button').on( 'click', function() {
    sendChatMessage();
});

socket.on('chat message', function (data) {
    addChatMessage(data);
});

var getSelectedColor = function() {
    return $('#chat-color-options .selected').css('backgroundColor');
}

var addChatMessage = function(chatMessage) {
    var chatLineDOM = document.createElement('div');
    $(chatLineDOM).addClass('chat-line');

    /* timestamp */
    var timestampDOM = document.createElement('span');
    $(timestampDOM).addClass('timestamp');
    var timeString = '';
    var messageDate = new Date(chatMessage.date);
    var hour = messageDate.getHours() % 12;
    if(hour === 0) { hour = 12; }
    if(hour < 10) { timeString += '0'; }
    timeString += hour.toString();
    timeString += ':';
    var minute = messageDate.getMinutes() % 12;
    if(minute < 10) { timeString += '0'; }
    timeString += minute.toString();
    $(timestampDOM).html(timeString);
    $(chatLineDOM).append(timestampDOM);
    if (!$('#show-timestamp-checkbox').is(':checked')) {
        $(timestampDOM).hide();
    }

    /* username */
    var userDOM = document.createElement('span');
    $(userDOM).addClass('user');
    $(userDOM).css('color', chatMessage.authorColor);
    $(userDOM).html(chatMessage.username);
    $(chatLineDOM).append(userDOM);

    /* colon */
    var colonDOM = document.createElement('span');
    $(colonDOM).addClass('colon');
    $(colonDOM).html(':');
    $(chatLineDOM).append(colonDOM);

    /* chat message */
    var messageDOM = document.createElement('span');
    $(messageDOM).addClass('message');
    $(messageDOM).html(chatMessage.text);
    $(chatLineDOM).append(messageDOM);

    /* check if scrolled to bottom, then add chat line, then if was previously 
       scrolled to bottom -> rescroll to bottom */
    var scrollableChatArea = $('#chat-area-scrollable-middle');
    var wasScrolledToBottom = $(scrollableChatArea).scrollTop() + $(scrollableChatArea).innerHeight() >= $(scrollableChatArea)[0].scrollHeight;

    $(scrollableChatArea).append(chatLineDOM); // add the chat line

    /* scroll to bottom if it was scrolled all the way down before
       let's hope resolutions get taller than 100,000 pixels... */
    if(wasScrolledToBottom) { 
        $(scrollableChatArea).scrollTop(100000); 
    }
};

// allow enter to send a chat message
$(document).keypress(function(e) {
    if(e.which == 13) {
        if($('#chat-textbox').is(':focus')) {
            sendChatMessage();
            return false;
        }
    }
});
