Solstice.WebQTimer = function (){};

var page_differential;
var timer_span;
var timer_submit_button;
var timer_msg;
var timer_start_interval = 1000;
var timer_interval_holder;
var time_remaining;

Solstice.WebQTimer.lowerTimer = function () {
    time_remaining = time_remaining - 1;
    var display_time = time_remaining;
      
    var hours = parseInt(display_time/ (60 * 60));
    display_time -= hours * 60 * 60;
    var minutes = parseInt(display_time / 60);
    var seconds = parseInt(display_time % 60);
    if (seconds < 0) {
        seconds = 0;
    }
    if (seconds < 10) {
        seconds = '0' + seconds;
    }
    if (minutes < 1) {
        minutes = 0;
    }
    if (minutes < 10) {
          minutes = '0' + minutes;
    }
    if (hours < 1) {
        hours = 0;
    }
    timer_span.innerHTML = hours + ':' + minutes + ':' + seconds;
    if (time_remaining < 0) {
        clearInterval(timer_interval_holder);
        alert(timer_msg);  
        Solstice.Button.submit(timer_submit_button);
    }
}

Solstice.WebQTimer.initializeTimer = function(submit_button_name, submit_message) {
    var timer_container = document.getElementById('timer_container');
    timer_container.style.display = 'block';
    timer_msg = submit_message;
    timer_submit_button = submit_button_name;
    timer_span = document.getElementById('webq_timer_countdown');

    Solstice.WebQTimer.fetch();
}

Solstice.WebQTimer.fetch = function () {
    Solstice.Remote.run('WebQ', 'start_timer', {}, {
        timeout: 5000,
        failure: Solstice.WebQTimer.refetch
    });
}

Solstice.WebQTimer.refetch = function () {
    var err = '<span style="color: #EE0000;">Loading...</span>';
    timer_span.innerHTML = err;
    setTimeout('Solstice.WebQTimer.fetch()', timer_start_interval);
    timer_start_interval *= 2;
}

Solstice.WebQTimer.start = function (left) {
    time_remaining = left;
    timer_interval_holder = setInterval("Solstice.WebQTimer.lowerTimer()", 1000);
}


/*
 * Copyright 1998-2008 Learning & Scholarly Technologies, University of Washington
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */


