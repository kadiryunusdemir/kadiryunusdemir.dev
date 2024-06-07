---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'Creating a Nested HTML Table from JSON Data with JavaScript'
pubDate: 2024-06-07
description: 'Learn how to create a dynamic, nested HTML table from JSON data using JavaScript and jQuery.'
author: 'Kadir Yunus Demir'
tags: [
    "JavaScript",
    "JSON",
    "Web Development",
    "User Experience",
    "HTML Tables",
    "Nested HTML Tables",
    "Dynamic HTML Tables",
    "Front-End Development",
    "jQuery",
    "toastr",
    "AJAX",
    "Data Visualization",
    "Code Tutorial"
]
---

When working with JSON data, it's often necessary to display it in a structured format. An HTML table is a great choice for this task as it allows for clear and organized data presentation. In this guide, we'll explore how to build a nested HTML table from JSON data, making it expandable to show nested objects.
## HTML Structure
Consider the following HTML and espacially CSS structure for dynamic HTML tables which increases user experience:
```html
<style type="text/css">
    table {
        border: 1px solid #ccc;
        border-radius: 8px;
        border-spacing: 0;
        width: 100%;
        box-shadow: 0 2px 5px grey;
        overflow: hidden;
    }

    th,
    td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #eee;
    }

    th {
        vertical-align: top !important;
        background-color: #f7f7f7;
        user-select: none;
        transition: background-color 0.3s ease;
        position: relative;
        padding-right: 24px;
    }

    td {
        background-color: #fff;
        transition: background-color 0.3s ease;
    }

    .clickable-row:hover > th,
    .clickable-row:hover > td {
        background-color: #f0f0f0;
    }

    .clickable-row:hover > th {
        cursor: pointer;
        background-color: #d6eeee !important;
    }

    .clickable-row > th::after {
        content: "▼";
        position: absolute;
        right: 10px;
        font-size: 12px;
        color: grey;
        transition: transform 0.3s ease;
    }

    .clickable-row:hover > th::after {
        transform: rotate(-90deg);
    }
</style>

<div id="nestedTableDiv">
</div>

<script type="text/javascript">
    $(document).ready(function () {
        var url = "/a/url";

        $.blockUI({ message: "Please wait..." });
        $.get(url, { id: 1 }, function (data) {
            utils.createTableFromJson(data, $("#nestedTableDiv"));
        }).always(function (jqXHR) {
            $.unblockUI();
        });
    });
</script>
```

## JavaScript Implementation
Implementing dynamic HTML tables can be achieved with the following JavaScript code with jQuery:
```javascript
/**
 * Creates a nested HTML table from JSON data and appends it to the specified div.
 * @param {string|Object} jsonData - The JSON data as a string or an object.
 * @param {Object} divRef - The div element to which the table will be appended.
 */
createTableFromJson: function (jsonData, divRef) {

    /**
     * Adds a table header (th) element to the given table row (tr).
     * @param {Object} tr - The table row to which the header will be added.
     * @param {string} key - The key to be displayed in the header.
     */
    function addTableHeader(tr, key) {
        tr.append("<th>" + key + "</th>");
    }

    /**
     * Adds a table data (td) element to the given table row (tr).
     * @param {Object} tr - The table row to which the data will be added.
     * @param {string} value - The value to be displayed in the data cell.
     */
    function addTableData(tr, value) {
        tr.append("<td>" + value + "</td>");
    }

    /**
     * Recursively creates nested tables for objects within the JSON data.
     * @param {Object} table - The table element to which nested tables will be added.
     * @param {Object} obj - The current object to be processed.
     */
    function createNestedTables(table, obj) {
        for (const key in obj) {
            var tr = $("<tr>");
            addTableHeader(tr, key);

            if (obj[key] !== null && typeof obj[key] === "object") {
                // If the property is an object, create a nested table recursively
                tr.addClass("clickable-row");
                var nestedTable = $("<table>").hide();
                createNestedTables(nestedTable, obj[key]);
                var td = $("<td>").append(nestedTable);
                tr.append(td);

                // Add toggle functionality for nested table
                tr.find("th:first").on("click", function () {
                    $(this).closest("tr").find("table:first").toggle();
                });
            } else {
                addTableData(tr, obj[key]);
            }

            table.append(tr);
        }
    }

    /**
     * Creates the main table and adds functionality to expand all nested tables.
     * @param {Object} jsonObject - The parsed JSON object.
     * @returns {Object} - The div element containing the table.
     */
    function createTable(jsonObject) {
        var table = $("<table>");
        createNestedTables(table, jsonObject);

        // Create a div to hold the table and the expand button
        var div = $("<div style='width: 98%; margin: auto;'>");

        // Add a button to expand all nested tables if any exist
        var tables = table.find("table");
        if (tables && tables.length > 0) {
            var button = $("<button class='btn btn-sm btn-default' style='margin:5px'>")
                .text("Open All")
                .on("click", function () {
                    tables.show();
                });
            div.append(button);
        }

        div.append(table);
        return div;
    }

    /**
     * Recursively parses nested JSON strings within an object.
     * @param {Object} obj - The object to be processed.
     */
    function parseNestedJSON(obj) {
        for (const key in obj) {
            if (obj[key] !== null && typeof obj[key] === "object") {
                // If the property is an object, continue recursively
                parseNestedJSON(obj[key]);
            } else if (typeof obj[key] === "string") {
                try {
                    const parsed = JSON.parse(obj[key]);
                    obj[key] = parsed;
                    // If the parsed value is an object, continue recursively
                    if (typeof parsed === "object" && parsed !== null) {
                        parseNestedJSON(parsed);
                    }
                } catch (e) {
                    // Ignore if the string is not a valid JSON
                }
            }
        }
    }

    try {
        if (!jsonData) {
            return;
        }

        if (typeof jsonData === "string") {
            jsonData = jsonData.trim();
        }

        if (!jsonData) {
            return;
        }

        // Determine if jsonData is already an object or a serialized JSON string
        var jsonObject;
        if (typeof jsonData === "object") {
            jsonObject = jsonData;
        } else {
            jsonObject = JSON.parse(jsonData);
            // Uncomment this if nested JSON strings need to be parsed
            //parseNestedJSON(jsonObject);
        }

        divRef.html(createTable(jsonObject));
    } catch (e) {
        console.error(e);
        toastr.error("Error happened.");
    }
}
```
