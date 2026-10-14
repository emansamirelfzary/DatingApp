import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { MessagesService } from '../../../messages/messages.service';
import { Message } from '../../../messages/message';
import { AccountService } from '../../../../core/services/account-service';
import { MembersService } from '../../services/members';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-member-messages',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './member-messages.html',
  styleUrl: './member-messages.css',
})
export class MemberMessages implements OnInit {
  private readonly messagesService = inject(MessagesService);
  private readonly accountService = inject(AccountService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly membersService = inject(MembersService);
  private readonly destroyRef = inject(DestroyRef);

  recipientId = signal('');
  recipientName = signal('');
  recipientPhoto = signal<string | null>(null);

  currentUser = this.accountService.currentUser;
  messages = signal<Message[]>([]);
  isLoading = signal(true);
  isSending = signal(false);
  emojiPickerOpen = signal(false);
  readonly emojis = ['😀', '😍', '🥰', '😊', '😂', '😉', '😘', '❤️', '🔥', '👍', '🎉', '😢'];
  deletingId = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  activeFilter = signal<'all' | 'sent' | 'received'>('all');

  messageForm = this.fb.nonNullable.group({
    content: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  sentCount = computed(() => {
    const currentUserId = this.currentUser()?.id;
    return this.messages().filter((m) => m.senderId === currentUserId).length;
  });

  receivedCount = computed(() => {
    const currentUserId = this.currentUser()?.id;
    return this.messages().filter((m) => m.senderId !== currentUserId).length;
  });

  filteredMessages = computed(() => {
    const currentUserId = this.currentUser()?.id;
    const filter = this.activeFilter();
    const list = this.messages();

    if (filter === 'sent') {
      return list.filter((m) => m.senderId === currentUserId);
    }
    if (filter === 'received') {
      return list.filter((m) => m.senderId !== currentUserId);
    }
    return list;
  });

  ngOnInit(): void {
    (this.route.parent?.paramMap ?? this.route.paramMap).pipe(
      switchMap(params => this.membersService.getMember(params.get('id') ?? '')),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: member => {
        this.recipientId.set(member.id);
        this.recipientName.set(member.displayName);
        this.recipientPhoto.set(member.photoUrl);
        this.loadThread();
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Could not load this member. Please try again.');
      },
    });
  }

  loadThread(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.messagesService
      .getMessageThread(this.recipientId())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (messages) => {
          this.messages.set(messages);
          this.scrollToBottom();
        },
        error: () => {
          this.errorMessage.set('Could not load message history. Please try again.');
        },
      });
  }

  setFilter(filter: 'all' | 'sent' | 'received'): void {
    this.activeFilter.set(filter);
    this.scrollToBottom();
  }

  sendMessage(): void {
    if (this.messageForm.invalid || this.isSending()) {
      this.messageForm.markAllAsTouched();
      return;
    }

    const content = this.messageForm.controls.content.value.trim();
    if (!content) return;

    this.isSending.set(true);
    this.errorMessage.set(null);

    this.messagesService
      .send({ recipientId: this.recipientId(), content })
      .pipe(finalize(() => this.isSending.set(false)))
      .subscribe({
        next: (newMsg) => {
          this.messages.update((prev) => [...prev, newMsg]);
          this.messageForm.reset({ content: '' });
          this.scrollToBottom();
        },
        error: (err) => {
          this.errorMessage.set(
            typeof err.error === 'string'
              ? err.error
              : 'Failed to send message. Please try again.',
          );
        },
      });
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
          this.messages.update((prev) => prev.filter((m) => m.id !== id));
        },
        error: () => {
          this.errorMessage.set('Could not delete the message. Please try again.');
        },
      });
  }

  onEnterKey(event: Event): void {
    event.preventDefault();
    this.sendMessage();
  }

  insertEmoji(emoji: string, textarea: HTMLTextAreaElement): void {
    const control = this.messageForm.controls.content;
    const content = control.value;
    const cursor = textarea.selectionStart ?? content.length;
    const updated = content.slice(0, cursor) + emoji + content.slice(cursor);

    control.setValue(updated);
    control.markAsDirty();
    this.emojiPickerOpen.set(false);
    textarea.focus();
    const nextCursor = cursor + emoji.length;
    textarea.setSelectionRange(nextCursor, nextCursor);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = document.getElementById('member-messages-thread');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 60);
  }
}

