IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [AspNetRoles] (
    [Id] nvarchar(450) NOT NULL,
    [Name] nvarchar(256) NULL,
    [NormalizedName] nvarchar(256) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetRoles] PRIMARY KEY ([Id])
);

CREATE TABLE [AspNetUsers] (
    [Id] nvarchar(450) NOT NULL,
    [DisplayName] nvarchar(max) NOT NULL,
    [PhotoUrl] nvarchar(max) NULL,
    [Age] int NOT NULL,
    [City] nvarchar(max) NULL,
    [Bio] nvarchar(max) NULL,
    [RefreshToken] nvarchar(max) NULL,
    [RefreshTokenExpiry] datetime2 NULL,
    [UserName] nvarchar(256) NULL,
    [NormalizedUserName] nvarchar(256) NULL,
    [Email] nvarchar(256) NULL,
    [NormalizedEmail] nvarchar(256) NULL,
    [EmailConfirmed] bit NOT NULL,
    [PasswordHash] nvarchar(max) NULL,
    [SecurityStamp] nvarchar(max) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    [PhoneNumber] nvarchar(max) NULL,
    [PhoneNumberConfirmed] bit NOT NULL,
    [TwoFactorEnabled] bit NOT NULL,
    [LockoutEnd] datetimeoffset NULL,
    [LockoutEnabled] bit NOT NULL,
    [AccessFailedCount] int NOT NULL,
    CONSTRAINT [PK_AspNetUsers] PRIMARY KEY ([Id])
);

CREATE TABLE [AspNetRoleClaims] (
    [Id] int NOT NULL IDENTITY,
    [RoleId] nvarchar(450) NOT NULL,
    [ClaimType] nvarchar(max) NULL,
    [ClaimValue] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [AspNetUserClaims] (
    [Id] int NOT NULL IDENTITY,
    [UserId] nvarchar(450) NOT NULL,
    [ClaimType] nvarchar(max) NULL,
    [ClaimValue] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [AspNetUserLogins] (
    [LoginProvider] nvarchar(450) NOT NULL,
    [ProviderKey] nvarchar(450) NOT NULL,
    [ProviderDisplayName] nvarchar(max) NULL,
    [UserId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY ([LoginProvider], [ProviderKey]),
    CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [AspNetUserRoles] (
    [UserId] nvarchar(450) NOT NULL,
    [RoleId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY ([UserId], [RoleId]),
    CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [AspNetUserTokens] (
    [UserId] nvarchar(450) NOT NULL,
    [LoginProvider] nvarchar(450) NOT NULL,
    [Name] nvarchar(450) NOT NULL,
    [Value] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name]),
    CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [Members] (
    [Id] nvarchar(450) NOT NULL,
    [DisplayName] nvarchar(max) NOT NULL,
    [DateOfBirth] date NOT NULL,
    [ImageUrl] nvarchar(max) NULL,
    [Created] datetime2 NOT NULL,
    [LastActive] datetime2 NOT NULL,
    [Gender] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [City] nvarchar(max) NOT NULL,
    [Country] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Members] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Members_AspNetUsers_Id] FOREIGN KEY ([Id]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [Likes] (
    [SourceMemberId] nvarchar(450) NOT NULL,
    [TargetMemberId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_Likes] PRIMARY KEY ([SourceMemberId], [TargetMemberId]),
    CONSTRAINT [FK_Likes_Members_SourceMemberId] FOREIGN KEY ([SourceMemberId]) REFERENCES [Members] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Likes_Members_TargetMemberId] FOREIGN KEY ([TargetMemberId]) REFERENCES [Members] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [Messages] (
    [Id] nvarchar(450) NOT NULL,
    [Content] nvarchar(max) NOT NULL,
    [DateRead] datetime2 NULL,
    [MessageSent] datetime2 NOT NULL,
    [SenderDeleted] bit NOT NULL,
    [RecipientDeleted] bit NOT NULL,
    [SenderId] nvarchar(450) NOT NULL,
    [RecipientId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_Messages] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Messages_Members_RecipientId] FOREIGN KEY ([RecipientId]) REFERENCES [Members] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Messages_Members_SenderId] FOREIGN KEY ([SenderId]) REFERENCES [Members] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [Photos] (
    [Id] int NOT NULL IDENTITY,
    [Url] nvarchar(max) NOT NULL,
    [IsMain] bit NOT NULL,
    [PublicId] nvarchar(max) NULL,
    [MemberId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_Photos] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Photos_Members_MemberId] FOREIGN KEY ([MemberId]) REFERENCES [Members] ([Id]) ON DELETE CASCADE
);

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'ConcurrencyStamp', N'Name', N'NormalizedName') AND [object_id] = OBJECT_ID(N'[AspNetRoles]'))
    SET IDENTITY_INSERT [AspNetRoles] ON;
INSERT INTO [AspNetRoles] ([Id], [ConcurrencyStamp], [Name], [NormalizedName])
VALUES (N'admin-id', N'706a6443-be1d-42cf-a8b8-8f95fbb0d953', N'Admin', N'ADMIN'),
(N'member-id', N'9e120f41-3b62-452d-b4b7-31b28fa39c13', N'Member', N'MEMBER'),
(N'moderator-id', N'0ad57468-5eaf-4a00-a52f-3bee99d5a6e6', N'Moderator', N'MODERATOR');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'ConcurrencyStamp', N'Name', N'NormalizedName') AND [object_id] = OBJECT_ID(N'[AspNetRoles]'))
    SET IDENTITY_INSERT [AspNetRoles] OFF;

CREATE INDEX [IX_AspNetRoleClaims_RoleId] ON [AspNetRoleClaims] ([RoleId]);

CREATE UNIQUE INDEX [RoleNameIndex] ON [AspNetRoles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL;

CREATE INDEX [IX_AspNetUserClaims_UserId] ON [AspNetUserClaims] ([UserId]);

CREATE INDEX [IX_AspNetUserLogins_UserId] ON [AspNetUserLogins] ([UserId]);

CREATE INDEX [IX_AspNetUserRoles_RoleId] ON [AspNetUserRoles] ([RoleId]);

CREATE INDEX [EmailIndex] ON [AspNetUsers] ([NormalizedEmail]);

CREATE UNIQUE INDEX [UserNameIndex] ON [AspNetUsers] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL;

CREATE INDEX [IX_Likes_TargetMemberId] ON [Likes] ([TargetMemberId]);

CREATE INDEX [IX_Messages_RecipientId] ON [Messages] ([RecipientId]);

CREATE INDEX [IX_Messages_SenderId] ON [Messages] ([SenderId]);

CREATE INDEX [IX_Photos_MemberId] ON [Photos] ([MemberId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20261018200157_SqlServerInitialCreate', N'10.0.13');

COMMIT;
GO

