var cookie_name;
function findnewwindow(url, id) {

    /*@cc_on
  @if (@_jscript)


    cookie_name = "soltestcookie_"+id;
    var cookie_val = readCookie(cookie_name);
    if (cookie_val == 'invalid') {
        document.cookie = cookie_name+"=old;";
        // this needs to be a loop of some sort, to wait for enough of the document to load
        // for ie to accept a cookie
        window.setTimeout(function() {
                document.location = url;
                }, 100);
    }
    document.cookie = cookie_name+"=invalid;";

  @end
  @*/

}
function markreload() {


    /*@cc_on
  @if (@_jscript)

    document.cookie = cookie_name+"=reloading;";

  @end
  @*/

}

// from http://www.quirksmode.org/js/cookies.html
function readCookie(name)
{
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++)
    {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

    window.onunload=markreload;

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


