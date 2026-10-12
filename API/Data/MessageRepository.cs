using System;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using API.Extensions;
using Microsoft.EntityFrameworkCore;

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
            "Outbox" => query.Where(x => x.SenderId == messageParams.MemberId && !x.SenderDeleted),
            _ => query.Where(x => x.RecipientId == messageParams.MemberId && !x.RecipientDeleted)
        };

        var messageQuery = query.Select(message => new MessageDTO
        {
            Id = message.Id,
            SenderId = message.SenderId,
            SenderDisplayName = message.Sender.DisplayName,
            SenderImageUrl = message.Sender.ImageUrl,
            RecipientId = message.RecipientId,
            RecipientDisplayName = message.Recipient.DisplayName,
            RecipientImageUrl = message.Recipient.ImageUrl,
            Content = message.Content,
            DateRead = message.DateRead,
            MessageSent = message.MessageSent
        });

        return await PaginatedResult<MessageDTO>.CreateAsync(
            messageQuery,
            messageParams.PageNumber,
            messageParams.PageSize);
    }

    public async Task<IReadOnlyList<MessageDTO>> GetMessageThread(string currentMemberId, string recipientId)
    {
        var query = context.Messages
            .Where(x =>
                (x.RecipientId == currentMemberId && !x.RecipientDeleted && x.SenderId == recipientId) ||
                (x.SenderId == currentMemberId && !x.SenderDeleted && x.RecipientId == recipientId)
            )
            .OrderBy(x => x.MessageSent)
            .AsQueryable();

        var unreadMessages = await query
            .Where(x => x.DateRead == null && x.RecipientId == currentMemberId)
            .ToListAsync();

        if (unreadMessages.Count > 0)
        {
            var now = DateTime.UtcNow;
            unreadMessages.ForEach(m => m.DateRead = now);
            await context.SaveChangesAsync();
        }

        return await query.Select(message => new MessageDTO
        {
            Id = message.Id,
            SenderId = message.SenderId,
            SenderDisplayName = message.Sender.DisplayName,
            SenderImageUrl = message.Sender.ImageUrl,
            RecipientId = message.RecipientId,
            RecipientDisplayName = message.Recipient.DisplayName,
            RecipientImageUrl = message.Recipient.ImageUrl,
            Content = message.Content,
            DateRead = message.DateRead,
            MessageSent = message.MessageSent
        }).ToListAsync();
    }

    public async Task<bool> SaveAllAsync()
    {
        return await context.SaveChangesAsync() > 0;
    }
}
