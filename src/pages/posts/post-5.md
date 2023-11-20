---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'Cascaded Dropdown List Operations in ASP.NET Core'
pubDate: 2023-11-17
description: 'Explore techniques for implementing cascaded dropdown lists in ASP.NET Core applications.'
author: 'Kadir Yunus Demir'
tags: [
    "ASP.NET Core",
    "ASP.NET 6",
    ".NET 6",
    "Dropdown Lists",
    "Cascaded Dropdown Lists",
    "Dependent Dropdown Lists",
    "Entity Framework Core",
    "JavaScript",
    "C#",
    "Web Development",
    "Select2",
    "jQuery"
]
---

Implementing cascaded dropdown lists enhances user experience and improves the overall functionality of your ASP.NET Core application. This post gives a solid structure for handling cascaded dropwdown list operation.

## HTML Structure
Consider the following HTML structure for cascaded dropdown lists:

```html
<div class="data-control">
    <label class="data-control-label">
        Academic Unit
    </label>
    <div class="data-control-element">
        <select asp-for="AcademicUnitId" asp-items="Model.AcademicUnits" class="form-control">
            <option></option>
        </select>
    </div>
</div>
<div class="data-control">
    <label class="data-control-label">
        Academic Department
    </label>
    <div class="data-control-element">
        <select asp-for="AcademicDepartmentId" asp-items="Model.AcademicDepartments" class="form-control">
            <option></option>
        </select>
    </div>
</div>
```
## JavaScript Implementation
Implementing cascaded dropdown lists can be achieved with the following JavaScript code with jQuery and Select2 libraries:
```javascript
<script type="text/javascript">
    $(document).ready(function () {
        function cascadedDropdownList(parentSelector, childSelector, url) {
            $(parentSelector).on('change', function () {
                var parentId = $(this).val();
                var childDropdown = $(childSelector);

                if (parentId) {
                    $.blockUI({ message: "Please wait..." });

                    $.ajax({
                        url: url,
                        type: 'GET',
                        data: { id: parentId },
                        success: function (data) {
                            childDropdown.empty();
                            childDropdown.append(new Option());
                            $.each(data, function (index, item) {
                                childDropdown.append(new Option(item.text, item.value));
                            });

                            childDropdown.trigger('change');
                            $.unblockUI();
                        },
                        error: function () {
                            $.unblockUI();
                        }
                    });
                }
                else {
                    childDropdown.empty();
                    childDropdown.val(null).trigger('change');
                }
            });
        }

        // Use nameof to prevent naming corruptions
        cascadedDropdownList('#@nameof(Model.AcademicUnitId)', '#@nameof(Model.AcademicDepartmentId)', '@(Url.ActionDynamic<DepartmentController>(nameof(DepartmentController.AcademicDepartments)))');
    });
</script>
```

