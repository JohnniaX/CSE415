
Solstice.WebQ = function (){};

Solstice.WebQ.colorMagazine = function(id){
    elements = YAHOO.util.Dom.getElementsByClassName('webq_question_active', 'div', document.getElementById('survey_container')); 
    for(var i=0;i<elements.length;i++){
        elements[i].className = 'webq_question';
    }
    document.getElementById('magazine_'+id).className = 'webq_question_active';
}

Solstice.WebQ.checkForEmptyPages = function () {
    elements = YAHOO.util.Dom.getElementsByClassName('webq_page', 'div', document.getElementById('survey_container')); 
    for(var i=0;i<elements.length;i++){
        check = elements[i];
        if( YAHOO.util.Dom.getElementsBy(function(element){return element.id.match(/^magazine/)}, 'div', check).length == 0 ){

            if( YAHOO.util.Dom.getElementsByClassName('webq_noquestions', 'div', check).length == 0 ){
                placeholder = document.getElementById('page_none').cloneNode(true);
                footer = YAHOO.util.Dom.getElementsByClassName('webq_pagefooter', 'div', check)[0];
                footer.parentNode.insertBefore(placeholder, footer);
                placeholder.style.display = 'block';
            }
        }else{
            placeholder = YAHOO.util.Dom.getElementsByClassName('webq_noquestions', 'div', check)[0];
            if(placeholder){
                placeholder.parentNode.removeChild(placeholder);
            }
        }
    }
}

/**
 * Client action which populates a hidden param, based on the current positions
 * of questions.
 * @returns {boolean} true
 */
Solstice.WebQ.createReorderingParam = function () {
    var reorder_array = new Array();
    
    var elements = document.getElementsByTagName('input');
    for(var i=0;i<elements.length;i++){
        if (elements[i].type == 'hidden' && elements[i].name == 'ordering') {
            reorder_array.push(elements[i].value);
        }
    }
    
    document.getElementById('reordering_str').value = reorder_array.join(':');
    
    return true;
}

Solstice.WebQ.participantExperienceWarning = function () {
    var warning_message = YAHOO.util.Dom.getElementsByClassName('webq_pe_message');
    warning_message[0].style.display = "inline";
}
/**
 * On keypress event on textareas in the participant side.  Notifies the user of how 
 * many characters they have left before webq won't accept their input.
 */
Solstice.WebQ.updateMaxInputMeter = function(input_id, max_length) {
    var input = document.getElementById(input_id);
    var notification_space = document.getElementById('webq_max_length_'+input_id);

    var current_length = input.value.length;
    var chars_remaining = max_length - current_length;

    if (chars_remaining < 0) {
        notification_space.className = 'webq_max_input_length_exceeded';
        notification_space.innerHTML = Math.abs(chars_remaining)+' characters over limit';
    }
    else {
        notification_space.className = 'webq_max_input_length';
        notification_space.innerHTML = chars_remaining+' characters remaining';
    }
    return true;
}

/**
 * Toggle for the CopyToAccount::ChooseAccount screen
 */
Solstice.WebQ.checkCopyAccount = function(obj) {
    if (!obj) return;

    if (obj.value == "0" && obj.checked == true) {
        Solstice.Element.hide('send_invite_email');
        Solstice.Element.hide('email_button');
        Solstice.Element.show('next_button');
        document.getElementById('receiving_account_field').disabled = false;
    } else {
        Solstice.Element.show('send_invite_email');
        Solstice.Element.show('email_button');
        Solstice.Element.hide('next_button');
        document.getElementById('receiving_account_field').disabled = true;
    }
    return true;
}

/**
 * Print a confirmation dialog if skip logic targets are empty
 */
Solstice.WebQ.checkSkipLogic = function(msg) {
    if (document.getElementById('skip_type_unconditional').checked) {
        if (document.getElementById('unconditional_skip_target').selectedIndex) {
            return true;
        }
    } else if (document.getElementById('skip_type_conditional').checked) {
        var targets = document.getElementsByTagName('select');
        for (var i=0; i<targets.length; i++) {
            var name = targets[i].name;
            if (name.match('skip_target_') && targets[i].selectedIndex) {
                return true;
            }
        }
    }
    return confirm(msg);
}
    
function checkPublishDate(obj) {
  if (!obj) return;
  
  var disable = true;
  if (obj.value == "set" && obj.checked == true) {
    disable = false;
  }
  var date_obj = document.getElementById(obj.name+'_date');
  if (date_obj) date_obj.disabled = disable;
}

function checkElement(obj, id) {
  document.getElementById(id).disabled = !obj.checked;
}

function checkParentElement(obj, id) {
  if (obj.checked) Solstice.Element.show(id);
  else             Solstice.Element.hide(id);
}

function uncheckParentElement(obj, id) {
  if (obj.checked) Solstice.Element.hide(id);
  else             Solstice.Element.show(id);
}

function checkClosingContent(obj, id) {
    checkParentElement(obj, id);
    var editor = Solstice.YahooUI.Editor.get('closing_content');
    if (editor) {
        editor.set('width', '650px');
    }
}

function toggleAllCheckBoxes(obj, id) {
    var block = document.getElementById(id);
    var inputs = block.getElementsByTagName('input');
    
    var input;
    for(var i=0;i<inputs.length;i++){
        input = inputs[i];
        if(input.type == 'checkbox'){
            if(obj.checked){
                input.disabled = false;
            }else {
                input.disabled = true;
            }
        }
    }
}

function toggleSkipRadios(block_id_1, block_id_2) {
    Solstice.Element.show(block_id_1);
    Solstice.Element.hide(block_id_2);
}
function checkSurveyTypeDropDown(obj, id) {
    if (obj.selectedIndex) Solstice.Element.hide(id);
    else                   Solstice.Element.show(id);
}

function toggleCutPaste(name) {
    var id = 'cutpaste' + name;
    var ta = 'ta_' + name;
    if (document.getElementById(id).style.display == 'block') {
        Solstice.Element.hide(id);
    } else {
        Solstice.Element.show(id);
        document.getElementById(ta).focus();
    }
    return false;
}

function checkWritein(obj, is_quiz) {
    if (obj.checked) {
        Solstice.Element.show('label_writein');
        Solstice.Element.show('recorded_value_writein');
        if (is_quiz == 1) Solstice.Element.show('is_correct_writein');
        Solstice.Element.show('is_default_writein');
    } else {
        Solstice.Element.hide('label_writein');
        Solstice.Element.hide('recorded_value_writein');
        if (is_quiz == 1) Solstice.Element.hide('is_correct_writein');
        Solstice.Element.hide('is_default_writein');
    }
}

function checkNullOption(obj, is_quiz) {
    if (obj.checked) {
        Solstice.Element.show('null_option_label');
        Solstice.Element.show('null_option_recorded_value');
        if (is_quiz == 1) Solstice.Element.show('is_correct_none');
        Solstice.Element.show('is_default_none_box');
    } else {
        Solstice.Element.hide('null_option_label');
        Solstice.Element.hide('null_option_recorded_value');
        if (is_quiz == 1) Solstice.Element.hide('is_correct_none');
        Solstice.Element.hide('is_default_none_box');
    }
}

function checkRequireUnique(obj) {
    var null_option = document.getElementById('display_null_option');
    if (obj.checked) {
        null_option.checked = true;
    }
    null_option.disabled = obj.checked;
    checkNullOption(null_option);
}

Solstice.WebQ.openQuestionEditor = function() {
    Solstice.Event.stopEvent(YAHOO.util.Event.getEvent());
    Solstice.Remote.run('WebQ', 'load_question_editor', {});
};

var autoTypes;
var autoFormats;
Solstice.WebQ.initAutoNumberPreview = function (types, formats) {
  autoTypes = types;
  autoFormats = formats;
}

Solstice.WebQ.previewAutoNumber = function () {
  var preview_type = document.getElementById("autonumber_type");
  var selected_type = preview_type.selectedIndex;

  var preview_format = document.getElementById("autonumber_format");

  var prefix = document.getElementById("autonumber_prefix").value;
  prefix = prefix.replace(/\s+$/gi, "");
   
  var preview_string = "";
  for (var i = 0; i < autoTypes[selected_type].length; i++) {
    var format = autoFormats[preview_format.selectedIndex];
    format = new String(format);
    format = format.replace(/n/, autoTypes[selected_type][i]); 
    preview_string += '<div style=\"padding: 2px 0px;\">' + prefix;
    if (prefix != '' && format != '') preview_string += ' '; 
    preview_string += format + '</div>';
  }
  document.getElementById("autonumber_preview").innerHTML = preview_string;
}

function loadGroupMembers() {
    var group_key = document.getElementById('group_key').value;

    if(group_key && group_key != 0){
        Solstice.Remote.run('CrowdControl', 'view_members', {'group_key': group_key});
        return true;
    }else{
        alert("No group selected.");
        return false;
    }
}

function closePreview() {
    window.close();
    return false;
}

function deleteByIdConfirm(id, msg) {
    if (document.getElementById(id).value == "") return true;
    return confirm(msg);
}

/// PARTICIPANT SIDE FUNCTIONS

function setWriteInFocus(obj, id) {
    if (obj.checked) { document.getElementById(id).focus() };
}

function setWriteInSelected(id) {
    document.getElementById(id).checked = true; 
}

function setWriteInConditionalSelected(obj, id) {
    if (obj.value != '') document.getElementById(id).checked = true;     
}

var regrade_score_fields = new Array();
function recalculateTotals() {
    var new_total = 0;     for (i = 0; i < regrade_score_fields.length; i++) {
        var test_val = regrade_score_fields[i][1].value;
        if (parseFloat(test_val) == test_val && parseFloat(test_val) >= 0) {
            new_total += parseFloat(test_val);
        }
        else {
            new_total += parseFloat(regrade_score_fields[i][0]);
        }
    }
    new_total = Math.round(new_total*100)/100;
    var total_field = document.getElementById('participant_total_field');
    total_field.innerHTML = new_total;
}

function registerRequiresGrading(field_id) {
    var field = document.getElementById(field_id);
  field.requires_grading = 1;
}

function registerRegradeField(static_value, field_id) {
    var values = [static_value, document.getElementById(field_id)];
    regrade_score_fields.push(values);
}

function regradeQuestionBlurHandler(id) {
    var field = document.getElementById(id);
    if (field.value == '' && field.requires_grading == 1) {
        field.style.backgroundColor = '#FFDA75';
    }
    else {
        field.style.backgroundColor = 'white';
    }
}

// Just like the question handler, but it resums the participant's score
function regradeParticipantBlurHandler(id) {
    var field = document.getElementById(id);
    if (field.value == '' && field.requires_grading == 1) {
        field.style.backgroundColor = '#FFDA75';
    }
    else {
        field.style.backgroundColor = 'white';
    }
    recalculateTotals();
}


var dropdown_matrix_registry = new Array();

/**
 * Validate a drop-down matrix question that requires unique selections 
 * @param {string} the id of the question block element
 * @returns void 
 */
Solstice.WebQ.checkUniqueDropDownSelections = function(question_identifier) {
    var tracking_hash = new Array();

    var dropdowns = dropdown_matrix_registry[question_identifier];
    var bad_options = new Array();

    for (i = 0; i <  dropdowns.length; i++) {
        var dropdown_id = dropdowns[i];
        var dropdown = document.getElementById(dropdown_id);
        var selected_entry = dropdown.selectedIndex;
        if (tracking_hash["option"+selected_entry] == null) {
            tracking_hash["option"+selected_entry] = new Array();
        }
        tracking_hash["option"+selected_entry].push(dropdown_id);
    }
    for (option in tracking_hash) {
        if (option != 'option0') {
            if (tracking_hash[option].length > 1) {
                for (i = 0; i < tracking_hash[option].length; i++) {
                    bad_options[tracking_hash[option][i]] = 1;
                    Solstice.Element.show('select_error_'+tracking_hash[option][i]);
                }
            }
        }
    }
    
    for (i = 0; i < dropdowns.length; i++) {
        dropdown_id = dropdowns[i];
        if (null == bad_options[dropdown_id]) {
            Solstice.Element.hide('select_error_'+dropdown_id);
        }
    }
}

/**
 * Register drop-down matrix question that requires uniques selections
 * @param {string} the id of the question block element
 * @param {string} the id of the question select element
 * @returns {boolean} true
 */
Solstice.WebQ.registerDropDownMatrixElement = function(question_identifier, element_id) {
    if (null == dropdown_matrix_registry[question_identifier]) {
        dropdown_matrix_registry[question_identifier] = new Array();
    }
    dropdown_matrix_registry[question_identifier].push(element_id);

    var fn = new Function("Solstice.WebQ.checkUniqueDropDownSelections('"+question_identifier+"');");

    Solstice.Event.add(document.getElementById(element_id), 'change', fn);

    return true;
}

Solstice.WebQ.Admin = function() {};

Solstice.WebQ.Admin.restoreSet = function(set_id){
    Solstice.Remote.run('WebQ', 'restore_invalid_set', {response_set_id : set_id});
    return false;
}

Solstice.WebQ.Admin.changeRestoreLabel = function(set_id){
    var td = document.getElementById('is_valid_'+set_id);
    td.innerHTML = 'Yes';
}
/// END PARTICIPANT FUNCTIONS

// For manual grading screens.

var auto_graded_questions = new Array();
function registerAutoGradedQuestion(field) {
    auto_graded_questions.push(field);
}

// This is not currently in use!
function checkAutoGradedQuestions() {
    for (i = 0; i <auto_graded_questions.length; i++) {
        var input = document.getElementById(auto_graded_questions[i]);
        if (input.value == '') {
            return confirm('Missing scores will be reset to the WebQ assigned score.');
        }
    }
    return true;
}

function showRoleInfo() {
    Solstice.Element.hide('collaboration_roles_info_show');
    document.getElementById('collaboration_roles_info_hide').style.display = 'inline';
    Solstice.Element.show('collaboration_roles_info');
}

function hideRoleInfo() {
    Solstice.Element.hide('collaboration_roles_info');
    Solstice.Element.hide('collaboration_roles_info_hide');
    document.getElementById('collaboration_roles_info_show').style.display = 'inline';
}

function initCollaboratorRoles (id) {
    var input = document.getElementById('administrator_'+id);
    if (input.checked) {
        updateAdministratorSubroles(id, true);
    }
}

function selectCollaboratorRole (role, id) {
    var input = document.getElementById(role + '_' + id);
    if (input.disabled) {
        return;
    }
    input.checked = !input.checked;
    updateCollaboratorRole(role, id);
}

function updateCollaboratorRole (role, id, event) {
    var input = document.getElementById(role + '_' + id);
    if (input.checked) {
        YAHOO.util.Dom.addClass(input.parentNode, 'role_selected');   
    } else {
        YAHOO.util.Dom.removeClass(input.parentNode, 'role_selected');
    }

    if (role == 'administrator') {
        updateAdministratorSubroles(id, input.checked);
    }

    if (event) {
        if (typeof(window.event) == "undefined") { 
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    }

    var inputs = document.getElementsByTagName('input');

    var seen_groups = {};
    var all_groups = [];

    var ajax_data = {};
    var length = inputs.length;
    for (var i = 0; i < length; i++) {
        if (inputs[i].type == "checkbox") {
            if (inputs[i].checked) {
                ajax_data[inputs[i].name] = inputs[i].value;
                var matches = inputs[i].name.match(/_([0-9]+)$/);
                if (matches) {
                    seen_groups[matches[1]] = true;
                }
            }
        }
        if (inputs[i].type == "hidden") {
            var matches = inputs[i].name.match(/^attached_group_([0-9]+)$/);
            if (matches) {
                ajax_data[inputs[i].name] = inputs[i].value;
                all_groups.push(matches[1]);
            }
        }
    }

    for (var i = 0; i < all_groups.length; i++) {
        var new_group_input = document.getElementById('new_collab_group_'+all_groups[i]);
        if (seen_groups[all_groups[i]]) {
            if (new_group_input.value == 1) {
                new_group_input.value = 0;
            }
            Solstice.Element.hide('no_longer_collaborating_'+all_groups[i]);
        }
        else {
            if (new_group_input.value == "0") {
                Solstice.Element.showInline('no_longer_collaborating_'+all_groups[i]);
            }
        }
    }

    Solstice.Remote.run('WebQ', 'save_collaboration_roles', ajax_data);

    return true;
}

var collaborator_subroles = new Array('reviewer','editor','grader','settings_manager');
function updateAdministratorSubroles (id, checked) {
    for (x in collaborator_subroles) {
        var subinput = document.getElementById(collaborator_subroles[x]+'_'+id);
        subinput.checked = checked;
        subinput.disabled = checked;
        if (checked) {
            YAHOO.util.Dom.addClass(subinput.parentNode, 'role_selected');
        } else {
            YAHOO.util.Dom.removeClass(subinput.parentNode, 'role_selected');
        }
    } 
    return true;
}

/**
 * Update the results download list asynchronously 
 * @returns {void}
 */
Solstice.WebQ.updateDownloadList = function() {
    // Failures or timeouts silently ignored
    Solstice.Remote.run('WebQ', 'download_list', {}, {
        failure: function() {}
    });
}

/**
 * Delete the selected download 
 * @returns {void}
 */
Solstice.WebQ.deleteDownload = function(id) {
    Solstice.Event.stopEvent(YAHOO.util.Event.getEvent());
    Solstice.Remote.run('WebQ', 'delete_download', {id: id});
};

/**
 * Updates download table after deletion 
 * @returns {void}
 */
Solstice.WebQ.removeDownloadElement = function(id) {
    var el = document.getElementById('webq_download_' + id);
    if (el) {
        var container = el.parentNode;
        container.removeChild(el);

        // Hide the header if there are no more files
        if (container.id.match(/^(webq_download_ready|webq_download_previous)$/)) {
            if (!container.getElementsByTagName('div').length) {
                Solstice.Element.hide(container.id + '_header');
            }
        }
    }
};


/**
 * Displays full question and response content
 * @returns {Boolean} false
 */
Solstice.WebQ.showFullContent = function(str) {
    str = Solstice.String.encodeHTML(str);
    Solstice.YahooUI.PopIn.get('webq_fullcontent_popin').setBody(str);
    return false;
}

/**
 * Updates the Delete Results screen based on the selected option 
 * @returns {Boolean} true 
 */
Solstice.WebQ.updateDeleteResults = function(button_id) {
    var el = document.getElementById('delete_filter');

    Solstice.Element.hide('delete_all_container');
    Solstice.Element.hide('delete_participant_container');
    Solstice.Element.hide('delete_window_container');
    Solstice.Element.hide('delete_date_container');

    if (el.value) {
        var container = document.getElementById(el.value + '_container');
        if (container) {
            Solstice.Element.fadeToBlock(container);
        }
        document.getElementById(button_id).disabled = false;
    } else {
        document.getElementById(button_id).disabled = true;
    }
    return true;
};


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


