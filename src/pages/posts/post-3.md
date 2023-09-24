---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'Dynamic SQL Query for Retrieving SQL Rows in ASP.NET Core'
pubDate: 2023-09-24
description: 'Learn how to retrieve generic objects from SQL Server using table names and object IDs in ASP.NET Core.'
author: 'Kadir Yunus Demir'
tags: ["asp.net-core", "asp.net6", ".net6", "SQL Server"]
---
If you've ever encountered a situation where you need to fetch generic objects from a SQL Server database using table names and object IDs in an ASP.NET Core application, you might have found it challenging, especially when working with Entity Framework Core. 

## The Challenge

Up until Entity Framework Core 7, there was no built-in support for using the generic `SqlQueryRaw<T>` method for dynamic SQL queries. This made it tricky to construct queries for scalar, non-entity types. To work around this limitation, we can use two different different approaches. 

## Raw SQL Approach
*`inside a Controller:`*
```csharp
[NonAction]
private string RetrieveJsonFromTable(string tableName, int objectId)
{
    // Even if we don't use any user-provided values into a SQL query, 
    // it is good to be mindful about preventing any potential SQL injection attacks. 
    var tableNames = dbContext.Model.GetEntityTypes()
        .Select(t => t.GetSchemaQualifiedTableName())
        .Distinct();

    if (!tableNames.Contains(tableName))
    {
        throw new ArgumentException("Invalid table name.", tableName);
    }

    SqlParameter objectIdParam = new SqlParameter("@ObjectId", objectId);
    SqlParameter returnParam = new SqlParameter
    {
        ParameterName = "ReturnValue",
        SqlDbType = SqlDbType.NVarChar,
        Size = -1,
        Direction = ParameterDirection.Output,
    };

    string query = $"SELECT @ReturnValue = (SELECT * FROM {tableName} WHERE ObjectId = @ObjectId AND Deleted = 0 FOR JSON AUTO, INCLUDE_NULL_VALUES, WITHOUT_ARRAY_WRAPPER);";

    var result = dbContext.Database.ExecuteSqlRaw(query, returnParam, objectIdParam);

    return (string)returnParam.Value;
}
```

## Stored Procedure Approach
*`inside a Controller:`*
```csharp
[NonAction]
private string RetrieveJsonFromTable(string tableName, int objectId)
{
    // Even if we don't use any user-provided values into a SQL query, 
    // it is good to be mindful about preventing any potential SQL injection attacks. 
    var tableNames = dbContext.Model.GetEntityTypes()
        .Select(t => t.GetSchemaQualifiedTableName())
        .Distinct();

    if (!tableNames.Contains(tableName))
    {
        throw new ArgumentException("Invalid table name.", tableName);
    }

    SqlParameter tableNameParam = new SqlParameter("@TableName", tableName);
    SqlParameter objectIdParam = new SqlParameter("@ObjectId", objectId);
    
    // SpGetJson is a keyless entity
    var r = dbContext.SpGetJson.FromSqlRaw("EXEC [dbo].[spGetJson] @TableName, @ObjectId", tableNameParam, objectIdParam).AsEnumerable().FirstOrDefault();
    
    // Equavelent in EF Core 7:
    // dbContext.Database.SqlQuery<string>("EXEC spGetJson @startDate, @endDate", tableNameParam, objectIdParam);
    
    return r == null ? string.Empty : r.JsonString;        
}
```

[more reading](https://learn.microsoft.com/en-us/ef/core/querying/sql-queries)