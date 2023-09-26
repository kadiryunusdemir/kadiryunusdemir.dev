---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'Creating a Whitespace Trimmer Model Binder in ASP.NET Core'
pubDate: 2023-09-24
description: 'Learn how to implement a custom model binder in ASP.NET Core to trim whitespace from user input.'
author: 'Kadir Yunus Demir'
tags: ["asp.net-core", "asp.net6", ".net6"]
---
Removing leading and trailing whitespaces promotes data consistency and integrity, enhances the user experience by preventing minor input mistakes, and improves data display and search operations. To implement this feature throughout your entire application, you can leverage the ModelBinder with its ModelBinderProvider.

## Creating a Model Binder
*`new binder class:`*
```csharp
public class TrimWhitespaceModelBinder : IModelBinder
{
    public Task BindModelAsync(ModelBindingContext bindingContext)
    {
        if (bindingContext is null)
        {
            throw new ArgumentNullException(nameof(bindingContext));
        }

        // Get the value from the value provider
        var valueProviderResult = bindingContext.ValueProvider.GetValue(bindingContext.ModelName);

        if (valueProviderResult != ValueProviderResult.None)
        {
            // Trim the value
            string trimmedString = valueProviderResult.FirstValue.Trim();

            // Set the result to success with the trimmed value
            bindingContext.Result = ModelBindingResult.Success(trimmedString);

            // Set the model state with the trimmed value. This is important because the ValidationFilter view is built from ModelState.
            bindingContext.ModelState.SetModelValue(bindingContext.ModelName, new ValueProviderResult(trimmedString));
        }

        return Task.CompletedTask;
    }
}
```

## Creating a Model Binder Provider
*`new provider class:`*
```csharp
public class TrimWhitespaceModelBinderProvider : IModelBinderProvider
{
    public IModelBinder GetBinder(ModelBinderProviderContext context)
    {
        if (context is null)
        {
            throw new ArgumentNullException(nameof(context));
        }

        // If the model type is string, return a new instance of TrimWhitespaceModelBinder
        // "!context.Metadata.IsComplexType &&" could be added 
        if (context.Metadata.ModelType == typeof(string)) 
        {
            return new BinderTypeModelBinder(typeof(TrimWhitespaceModelBinder));
        }

        // If the model type is not string, return null
        return null;     
    }
}
```

## Configuring Model Binder
*`inside program.cs:`*
```csharp
builder.Services.AddControllersWithViews(config =>
    {
        config.ModelBinderProviders.Insert(0, new TrimWhitespaceModelBinderProvider());
    });
```