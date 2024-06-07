---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'Implementing a Confirmation-Based Action Handler in JavaScript'
pubDate: 2024-06-07
description: 'Learn how to create a versatile JavaScript function that manages user-confirmed actions with AJAX requests.'
author: 'Kadir Yunus Demir'
tags: [
    "JavaScript",
    "AJAX",
    "Web Development",
    "User Experience",
    "Confirmation Dialog",
    "Front-End Development",
    "jQuery",
    "toastr",
    "Error Handling",
    "Code Tutorial"
]
---

Requiring confirmation for critical actions enhances user experience by preventing accidental data loss and adds a layer of security by verifying user intent. This blog post will guide you through implementing a versatile executeActionWithConfirmation function that can be customized for different use cases.

## JavaScript Implementation
Implementing action confirmation event can be achieved with the following JavaScript code with jQuery:
```javascript
/**
* Manages actions that require confirmation before proceeding.
* A default message is set for delete actions.
* Example usage: onclick="utils.executeActionWithConfirmation(event)"
* 
* @param {string} event - The event that triggers the action.
* @param {string} confirmMessage - The message displayed for confirmation.
* @param {string} [ajaxType="POST"] - The type of AJAX request, default is POST.
* @param {string|null} [url=null] - URL for redirection after a successful action.
* @param {Function} successCallback - Function called upon successful response.
* @param {Function} errorCallback - Function called upon error response.
*/
executeActionWithConfirmation: function (event, {
    confirmMessage = "Are you sure you want to delete this data?",
    ajaxType = "POST",
    reloadUrl = null,
    data = null,
    successCallback = function (message) {
        toastr.success(message, "", { timeOut: 2000 });
        if (reloadUrl) {
            location.href = reloadUrl;
        } else {
            location.reload();
        }
    },
    errorCallback = function (message) {
        toastr.error(message);
        $.unblockUI();
    }
} = {}) {
    event.preventDefault();

    let confirmResult = confirm(confirmMessage);

    if (confirmResult) {
        let url = event.target.href;

        $.blockUI({ message: "Please wait..." });

        $.ajax({
            url: url,
            type: ajaxType,
            data: data,
            success: function (response) {
                if (response.statusCode == 0) {
                    successCallback(response.resultMessage);
                } else {
                    errorCallback(response.resultMessage);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error(errorThrown);
                errorCallback('An error occurred.');
            }
        });
    } else {
        $.unblockUI();
    }
}
```
`successCallback` and `errorCallback` object parameters offer the flexibility to tailor the function's behavior based on the AJAX request's outcome. Whether displaying success messages, redirecting users, reloading the page, or managing errors smoothly, these callback functions allow for extensive customization. This adaptability makes the function a powerful tool for developing robust and user-friendly web applications.
