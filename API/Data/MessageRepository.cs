using System;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using API.Extensions;

namespace API.Data;

public class MessageRepository(AppDbContext context) : IMessageRepository
{
    public void AddMessage(Message message)
    
    {
        context.Messages.Add(message);
    }

    public void DeleteMessage(Message message)
    {
        context.Messages.Remove(message);
    }

    public async Task<Message?> GetMessage(string messageId)
    {
return await context.Messages.FindAsync(messageId);
   }

    public async Task<PaginatedResult<MessageDTO>> GetMessagesForMember(MessageParams messageParams)
    {
       var query = context.Messages
        .OrderByDescending(x => x.MessageSent)
        .AsQueryable();

    query = messageParams.Container switch
    {
        "Outbox" => query.Where(x => x.SenderId == messageParams.MemberId),
        _ => query.Where(x => x.RecipientId == messageParams.MemberId)
    };

    var messageQuery = query.Select(message => message.ToDto());

    return await PaginationHelper.CreateAsync(messageQuery, messageParams.PageNumber, messageParams.PageSize);
}

    public Task<IReadOnlyList<MessageDTO>> GetMessageThread(string currentMemberId, string recipientId)
    {
        throw new NotImplementedException();
    }

    public async  Task<bool> SaveAllAsync()
    {
        return await context.SaveChangesAsync() >0;
    }
}
