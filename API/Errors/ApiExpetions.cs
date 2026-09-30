using System;

namespace API.Errors;

public class ApiExpetions (string message, int statusCode, string details) 
{
public int StatusCode { get; set; }= statusCode;
public string Message { get; set; }= message;
public string Details { get; set; }= details;
}
