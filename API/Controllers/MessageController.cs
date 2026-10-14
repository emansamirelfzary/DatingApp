using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers;

[Authorize]
public class MessagesController(IMessageRepository messageRepository, IMemberRepository memberRepository) : BaseApiController
{
    [HttpPost]
    public async Task<ActionResult<MessageDTO>> CreateMessage(CreateMessageDTO createMessageDto)
    {
        var senderId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(senderId))
            return Unauthorized();

        if (senderId == createMessageDto.RecipientId)
            return BadRequest("You cannot send messages to yourself");

        var sender = await memberRepository.GetMemberByIdAsync(senderId);
        var recipient = await memberRepository.GetMemberByIdAsync(createMessageDto.RecipientId);

        if (recipient == null || sender == null || sender.Id == createMessageDto.RecipientId)
            return BadRequest("Cannot send this message");

        var message = new Message
        {
            SenderId = sender.Id,
            RecipientId = recipient.Id,
            Content = createMessageDto.Content
        };

        messageRepository.AddMessage(message);

        if (await messageRepository.SaveAllAsync()) 
        {
            return Ok(new MessageDTO
            {
                Id = message.Id,
                SenderId = sender.Id,
                SenderDisplayName = sender.DisplayName,
                SenderImageUrl = sender.ImageUrl,
                RecipientId = recipient.Id,
                RecipientDisplayName = recipient.DisplayName,
                RecipientImageUrl = recipient.ImageUrl,
                Content = message.Content,
                DateRead = message.DateRead,
                MessageSent = message.MessageSent
            });
        }

        return BadRequest("Failed to send message");
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResult<MessageDTO>>> GetMessages([FromQuery] MessageParams messageParams)
    {
        var memberId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(memberId)) return Unauthorized();

        messageParams.MemberId = memberId;
        return Ok(await messageRepository.GetMessagesForMember(messageParams));
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<int>> GetUnreadMessageCount()
    {
        var memberId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(memberId)) return Unauthorized();

        return Ok(await messageRepository.GetUnreadMessageCount(memberId));
    }

    [HttpGet("unread")]
    public async Task<ActionResult<IReadOnlyList<MessageDTO>>> GetUnreadMessages()
    {
        var memberId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(memberId)) return Unauthorized();

        return Ok(await messageRepository.GetUnreadMessages(memberId));
    }

    [HttpGet("thread/{recipientId}")]
    public async Task<ActionResult<IReadOnlyList<MessageDTO>>> GetMessageThread(string recipientId)
    {
        var currentMemberId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(currentMemberId)) return Unauthorized();

        return Ok(await messageRepository.GetMessageThread(currentMemberId, recipientId));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMessage(string id)
    {
        var memberId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(memberId)) return Unauthorized();

        var message = await messageRepository.GetMessage(id);
        if (message == null) return NotFound();

        if (message.SenderId != memberId && message.RecipientId != memberId)
            return Forbid();

        if (message.SenderId == memberId) message.SenderDeleted = true;
        if (message.RecipientId == memberId) message.RecipientDeleted = true;

        if (message.SenderDeleted && message.RecipientDeleted)
        {
            messageRepository.DeleteMessage(message);
        }

        if (await messageRepository.SaveAllAsync()) return Ok();

        return BadRequest("Problem deleting the message");
    }
}
