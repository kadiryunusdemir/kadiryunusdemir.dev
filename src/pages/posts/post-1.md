---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'Exception Filters in ASP.NET Core'
pubDate: 2023-09-18
description: 'Learn how to use exception filters with dependency injection for effective error handling in ASP.NET Core.'
author: 'Kadir Yunus Demir'
tags: ["asp.net-core", "asp.net6", ".net6"]
---
## Using Service Filters for Exception Handling

Service Filters use the ServiceProvider to resolve the instance of the filter. They need to be registered with the container and provide control over the lifecycle.

*`program.cs:`*
```csharp
builder.Services.AddScoped<ViewExceptionFilter>();

builder.Services.AddControllersWithViews(config =>
{
    config.Filters.AddService(typeof(ViewExceptionFilter));
})
```
*`an action method:`*
```csharp
public OperationResult ActionMethod(int id)
```

## Using Service Filters for Exception Handling
Type Filters are instantiated by ObjectFactory and do not require registration as a service. Their lifetime is limited to the duration of an HTTP request.

*`an action method:`*
```csharp
[TypeFilter(typeof(JsonExceptionFilter))]
public OperationResult ActionMethod(int id)
```

[more reading](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/filters?view=aspnetcore-6.0)