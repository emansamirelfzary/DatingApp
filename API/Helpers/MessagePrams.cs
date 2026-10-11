using System;

namespace API.Helpers;

public class MessageParams
{
    public string? MemberId { get; set; }
    public string Container { get; set; } = "Inbox";
}
