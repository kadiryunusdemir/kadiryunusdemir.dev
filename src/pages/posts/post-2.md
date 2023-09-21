---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'URL Extension Methods in ASP.NET Core'
pubDate: 2023-09-18
description: 'Learn how to use extension methods for compile-time checked urls.'
author: 'Kadir Yunus Demir'
tags: ["asp.net-core", "asp.net6", ".net6"]
---
When developing web applications, creating and managing URLs is a common task. However, manually constructing URLs can be error-prone, especially when referencing controllers and actions. Mistyped names or code changes can lead to broken links that may not be immediately apparent. Unfortunately, the provided methods offer no such help. To address this issue, it's essential to use compile-time checked methods for URL generation. 

### The Traditional Approach
Here's an example of the traditional, error-prone way to create URLs in ASP.NET Core:

*`the ugly one:`*
```csharp
Url.Action("Index", "Home")
```

### Leveraging Extension Methods for Compile-Time URL Control
Extension methods can be particularly beneficial for creating URLs that are checked for correctness at compile time. Let's explore better ways to handle URL generation using extension methods.

*`Extensions.cs:`*
```csharp
public static class Extensions
{
    /// <summary>
    /// Dynamically generates a URL for a controller action using compile-time checks.
    /// </summary>
    /// <param name="action">The name of the action (e.g., nameof(Controller.Action)).</param>
    /// <returns>The generated URL.</returns>
    public static string DynamicAction<T>(this IUrlHelper url, string action = "") where T : Controller
    {
        return url.Action(action, typeof(T).Name).Replace(nameof(Controller), string.Empty);
    }

    /// <summary>
    /// Dynamically generates a URL for a controller action using compile-time checks.
    /// </summary>
    /// <param name="urlHelper">The IUrlHelper instance.</param>
    /// <param name="nameOfAction">The name of the action using nameof syntax (e.g., nameof(Controller.Action)).</param>
    /// <param name="fullTypeName">The full type name of the controller.</param>
    /// <returns>The generated URL.</returns>
    public static string ActionBuilder(this IUrlHelper urlHelper, string nameOfAction, [CallerArgumentExpression("nameOfAction")] string fullTypeName = "")
    {
        if (!fullTypeName.Contains("Controller"))
        {
            return string.Empty;
        }

        string[] array = fullTypeName
            .Replace("nameof(", string.Empty)
            .Replace("Controller", string.Empty)
            .Replace(")", string.Empty)
            .Split(".");
        string controllerName = array[0];
        string actionName = array.Length > 1 ? array[1] : string.Empty;

        if (string.IsNullOrWhiteSpace(controllerName))
        {
            return string.Empty;
        }

        return urlHelper.Action(actionName, controllerName);
    }
}
```

Once you've added the extension methods, generating URLs becomes a breeze. Here's how you can do it:

*`the magic:`*
```csharp
Url.ActionBuilder(nameof(HomeController.Index))
```
```html
<a href="@(Url.ActionBuilder(nameof(HomeController.Index)))">Home Link</a>
```

By leveraging extension methods for compile-time URL control, you can significantly reduce the risk of runtime errors related to URL construction, leading to more robust and maintainable ASP.NET Core applications.

>*Kudos to Mustafa Soysal for ActionBuilder.*