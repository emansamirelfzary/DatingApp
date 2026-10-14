import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MessagesService } from '../../messages.service';
import { Message } from '../../message';
import { Paginator } from '../../../../shared/components/paginator/paginator';
import { PaginationMetadata } from '../../../../shared/types/pagination';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-my-messages',
  imports: [DatePipe, RouterLink, Paginator],
  templateUrl: './my-messages.html',
  styleUrl: './my-messages.css',
})
export class MyMessages implements OnInit {
  private readonly messagesService = inject(MessagesService);

  protected readonly container = signal<'Inbox' | 'Outbox'>('Inbox');
  protected readonly pageNumber = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly pagination = signal<PaginationMetadata | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly messages = signal<Message[]>([]);
  protected readonly deletingId = signal<string | null>(null);
  protected readonly conversations = computed(() => {
    const conversations = new Map<string, { peerId: string; latest: Message; messageCount: number; unreadCount: number }>();

    for (const message of this.messages()) {
      const peerId = this.container() === 'Inbox' ? message.senderId : message.recipientId;
      const conversation = conversations.get(peerId);
      if (conversation) {
        conversation.messageCount++;
        if (this.container() === 'Inbox' && !message.dateRead) conversation.unreadCount++;
      } else {
        conversations.set(peerId, {
          peerId,
          latest: message,
          messageCount: 1,
          unreadCount: this.container() === 'Inbox' && !message.dateRead ? 1 : 0,
        });
      }
    }

    return [...conversations.values()];
  });

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.messagesService
      .getMessages(this.container(), this.pageNumber(), this.pageSize())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (result) => {
          this.messages.set(result.items);
          this.pagination.set(result.metadata);
        },
        error: () => {
          this.errorMessage.set('Could not load messages. Please try again.');
        },
      });
  }

  setContainer(newContainer: 'Inbox' | 'Outbox'): void {
    if (this.container() === newContainer) return;
    this.container.set(newContainer);
    this.pageNumber.set(1);
    this.loadMessages();
  }

  onPageChange(event: { pageNumber: number; pageSize: number }): void {
    this.pageNumber.set(event.pageNumber);
    this.pageSize.set(event.pageSize);
    this.loadMessages();
  }

  deleteMessage(id: string, event: MouseEvent): void {
    event.stopPropagation();
    if (this.deletingId() === id) return;

    this.deletingId.set(id);
    this.messagesService
      .deleteMessage(id)
      .pipe(finalize(() => this.deletingId.set(null)))
      .subscribe({
        next: () => {
          this.messages.update((list) => list.filter((m) => m.id !== id));
          const meta = this.pagination();
          if (meta) {
            this.pagination.set({
              ...meta,
              totalCount: Math.max(0, meta.totalCount - 1),
            });
          }
        },
        error: () => {
          this.errorMessage.set('Could not delete the message. Please try again.');
        },
      });
  }
}

