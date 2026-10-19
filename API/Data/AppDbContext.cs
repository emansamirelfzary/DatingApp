using API.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;


namespace API.Data;

public abstract class AppDbContextBase<TContext>(DbContextOptions<TContext> options)
    : IdentityDbContext<AppUser>(options)
    where TContext : DbContext
{

    
    public DbSet<Member> Members { get; set; }
    public DbSet<Photo> Photos { get; set; }
    public DbSet<MemberLike> Likes { get; set; }
    public DbSet<Message> Messages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<MemberLike>(entity =>
        {
            entity.HasKey(like => new { like.SourceMemberId, like.TargetMemberId });

            entity.HasOne(like => like.SourceMember)
                .WithMany(member => member.LikedMembers)
                .HasForeignKey(like => like.SourceMemberId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(like => like.TargetMember)
                .WithMany(member => member.LikedByMembers)
                .HasForeignKey(like => like.TargetMemberId)
                .OnDelete(DeleteBehavior.Restrict);

                
        });
modelBuilder.Entity<IdentityRole>()
    .HasData(
        new IdentityRole { Id = "member-id", Name = "Member", NormalizedName = "MEMBER", ConcurrencyStamp = "11111111-1111-1111-1111-111111111111" },
        new IdentityRole { Id = "moderator-id", Name = "Moderator", NormalizedName = "MODERATOR", ConcurrencyStamp = "22222222-2222-2222-2222-222222222222" },
        new IdentityRole { Id = "admin-id", Name = "Admin", NormalizedName = "ADMIN", ConcurrencyStamp = "33333333-3333-3333-3333-333333333333" }
    );
        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasOne(x => x.Recipient)
                .WithMany(m => m.MessagsRecived)
                .HasForeignKey(x => x.RecipientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Sender)
                .WithMany(m => m.MessagesSent)
                .HasForeignKey(x => x.SenderId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}

public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
    : AppDbContextBase<AppDbContext>(options);
