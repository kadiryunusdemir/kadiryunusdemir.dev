---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'Dynamic SQL Query for Retrieving SQL Rows in ASP.NET Core'
pubDate: 2023-09-24
description: 'Learn how to retrieve generic objects from SQL Server using table names and object IDs in ASP.NET Core.'
author: 'Kadir Yunus Demir'
tags: [
    "ASP.NET Core",
    "ASP.NET-Core",
    "ASP.NET 6",
    ".NET 6",
    "Entity Framework Core 7",
    "Entity Framework Core 6",
    "EF CORE 7",
    "EF CORE 6",
    "SQL Server",
    "MSSQL Server",
    "SqlQueryRaw",
    "FromSqlInterpolated",
    "ExecuteSqlRaw",
    "FOR JSON",
    "Dynamic SQL Queries",
    "Database Query Execution",
    "Database Query Interpolation",
    "SQL Query Execution",
    "Database Query Optimization",
    "SQL Server Optimization",
    "Entity Framework Core",
    "JSON Data Retrieval",
    "SQL Injection Prevention",
    "Stored Procedures",
    "Database Table Names",
    "Object IDs",
    ".NET Development",
    "Database Security",
    "JSON Output"
]

---
If you've ever encountered a situation where you need to fetch generic objects from a SQL Server database using table names and object IDs in an ASP.NET Core application, you might have found it challenging, especially when working with Entity Framework Core.

Up until Entity Framework Core 7, there was no built-in support for using the generic SqlQueryRaw<T> method for dynamic SQL queries. This made it tricky to construct queries for scalar, non-entity types. Also, when retrieving JSON results from a SQL Server database, there's often a need to exclude specific columns from the final JSON output. The following codes demonstrate workarounds and proper approaches.

## Raw SQL Approach (Not Recommended)
When opting for the Raw SQL Approach, it's crucial to be mindful of preventing SQL injection attacks, even if you don't use user-provided values in your queries. Here's a snippet from a controller demonstrating the approach:

*`inside a Controller:`*
```csharp
/// <summary>
/// Check if the provided schema and table name is valid and not vulnerable to SQL injection attack.
/// </summary>
/// <remarks>Table name format: schema.name</remarks>
/// <param name="schemaAndTableName">schema.name</param>
/// <returns>True if the table name is valid; otherwise, false</returns>
[NonAction]
private bool IsSchemaAndTableNameValid(string schemaAndTableName)
{
    // Ensure the input is not empty
    if (string.IsNullOrEmpty(schemaAndTableName))
    {  
        return false; 
    }
    
    // Retrieve a list of schema-qualified table names from the database context
    var tableNames = dbContext.Model.GetEntityTypes()
        .Select(t => t.GetSchemaQualifiedTableName())
        .Distinct();

    // Check if the provided schema and table name exists in the database
    return tableNames.Contains(schemaAndTableName);
}

/// <summary>
/// Retrieve JSON data from a specified table for a given object ID.
/// </summary>
/// <remarks>Table name format: schema.name</remarks>
/// <param name="schemaAndTableName">schema.name</param>
/// <param name="objectId">The object identifier</param>
/// <returns>JSON data as a string or an error message</returns>
[NonAction]
private string RetrieveJsonFromTable(string schemaAndTableName, int objectId)
{
    if (!IsSchemaAndTableNameValid(schemaAndTableName))
    {
        return "Invalid table name: " + schemaAndTableName;
    }

    // Create parameters for the SQL query
    SqlParameter objectIdParam = new SqlParameter("@ObjectId", objectId);
    SqlParameter returnParam = new SqlParameter
    {
        ParameterName = "ReturnValue",
        SqlDbType = SqlDbType.NVarChar,
        Size = -1,
        Direction = ParameterDirection.Output,
    };

    // Construct the SQL query to retrieve JSON data
    string query = $"SELECT @ReturnValue = (SELECT * FROM {schemaAndTableName} WHERE ObjectId = @ObjectId AND Deleted = 0 FOR JSON AUTO, INCLUDE_NULL_VALUES, WITHOUT_ARRAY_WRAPPER);";

    // Execute the SQL query and return the JSON result
    var result = dbContext.Database.ExecuteSqlRaw(query, returnParam, objectIdParam);
    return (string)returnParam.Value;
}
```

## Stored Procedure Approach
The Stored Procedure Approach offers a more secure and powerful way to retrieve JSON data. You can benefit from the power of the database using stored procedure. Here's a code snippet from a controller showcasing this approach:

*`inside a Controller:`*
```csharp
/// <summary>
/// Get JSON data from a specified table.
/// </summary>
/// <remarks>Table name format: schema.name</remarks>
/// <param name="schemaAndTableName">schema.name</param>
/// <returns>JSON data as a string or an error message</returns>
[NonAction]
private string GetJsonListData(string schemaAndTableName)
{
    if (!IsSchemaAndTableNameValid(schemaAndTableName))
    {
        return "Invalid table name: " + schemaAndTableName;
    }

    // Execute the stored procedure and retrieve the JSON list result
    var response = dbContext.spGetDataAsJson
        .FromSqlInterpolated($"EXEC [dbo].[spGetDataAsJson] {schemaAndTableName}, {schemaAndTableName.Split(".")[1]}")
        .AsEnumerable()
        .FirstOrDefault();
    return response.JsonResult;

    // spGetDataAsJson is a keyless entity which has only a string properpty named JsonResult
    // Equavelent in EF Core 7:
    // return dbContext.Database.SqlQuery<string>("EXEC [dbo].[spGetDataAsJson] @SchemaAndTableName, @TableName, @ObjectId", 
    //     schemaAndTableName, schemaAndTableName.Split(".")[1], objectId);
}

/// <summary>
/// Get JSON data for a specific object from a table.
/// </summary>
/// <remarks>Table name format: schema.name</remarks>
/// <param name="schemaAndTableName">schema.name</param>
/// <param name="objectId">The object identifier</param>
/// <returns>JSON data as a string or an error message</returns>
[NonAction]
private string GetJsonData(string schemaAndTableName, int objectId)
{
    if (!IsSchemaAndTableNameValid(schemaAndTableName))
    {
        return "Invalid table name: " + schemaAndTableName;
    }

    // Execute the stored procedure with the object identifier and retrieve the JSON result
    var response = dbContext.spGetDataAsJson
        .FromSqlInterpolated($"EXEC [dbo].[spGetDataAsJson] {schemaAndTableName}, {schemaAndTableName.Split(".")[1]}, {objectId}")
        .AsEnumerable()
        .FirstOrDefault();
    return response.JsonResult;
}
```

*`inside the MSSQL Server:`*
```sql
CREATE PROCEDURE [dbo].[spGetDataAsJson]
    @SchemaAndTableName NVARCHAR(500) = '',
    @TableName NVARCHAR(500) = '',
    @ObjectId INT = NULL
AS
BEGIN
    DECLARE @query NVARCHAR(1000) = '';
    DECLARE @columns NVARCHAR(1000) = '';

    -- Retrieve the column names for the specified table
    -- while excluding unnecessary columns (e.g., 'Deleted')
    SELECT @columns = STRING_AGG(ISNULL(COLUMN_NAME, ' '), ',') 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = @TableName AND COLUMN_NAME NOT IN ('Deleted')

    -- Construct the dynamic SQL query for JSON data retrieval
    SET @query = N'SELECT (SELECT ' + @columns +
        ' FROM ' + @SchemaAndTableName +
        ' WHERE Deleted = 0';

    -- Append the condition for the object ID if provided 
    -- (flexibility to return a list or a single result)
    IF @ObjectId IS NOT NULL
    BEGIN
        SET @query = @query + ' AND ObjectId = ' + CONVERT(NVARCHAR(50), @ObjectId);
    END

    -- Complete the SQL query to return JSON data
    SET @query = @query + ' FOR JSON AUTO, INCLUDE_NULL_VALUES) AS JsonResult';

    -- Execute the dynamic SQL query
    EXEC sp_executesql @query;
END
```

[more reading](https://learn.microsoft.com/en-us/ef/core/querying/sql-queries)