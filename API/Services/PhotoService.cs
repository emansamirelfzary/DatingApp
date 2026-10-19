using API.Helpers;
using API.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace API.Services;

public class PhotoService : IPhotoService
{
    private readonly CloudinarySettings _settings;
    private readonly IWebHostEnvironment _environment;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly Lazy<Cloudinary> _cloudinary;

    public PhotoService(
        IOptions<CloudinarySettings> config,
        IWebHostEnvironment environment,
        IHttpContextAccessor httpContextAccessor)
    {
        _settings = config.Value;
        _environment = environment;
        _httpContextAccessor = httpContextAccessor;
        _cloudinary = new Lazy<Cloudinary>(() =>
        {
            var account = new Account(
                _settings.CloudName,
                _settings.ApiKey,
                _settings.ApiSecret
            );
            return new Cloudinary(account);
        });
    }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_settings.CloudName)
        && !string.IsNullOrWhiteSpace(_settings.ApiKey)
        && !string.IsNullOrWhiteSpace(_settings.ApiSecret)
        && _settings.CloudName != "your-cloud-name"
        && _settings.ApiKey != "your-api-key"
        && _settings.ApiSecret != "your-api-secret";

    public async Task<PhotoUploadResult> UploadPhotoAsync(IFormFile file)
    {
        if (file is null)
        {
            throw new ArgumentNullException(nameof(file));
        }

        if (file.Length == 0)
        {
            throw new InvalidOperationException("File is empty.");
        }

        if (file.Length > 5 * 1024 * 1024)
        {
            throw new InvalidOperationException("Photo files must be 5 MB or smaller.");
        }

        if (!file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Only image files can be uploaded.");
        }

        if (!IsConfigured)
        {
            if (_environment.IsDevelopment())
            {
                return await UploadLocallyAsync(file);
            }

            throw new InvalidOperationException("Cloudinary must be configured outside Development.");
        }

        using var stream = file.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Transformation = new Transformation().Width(500).Height(500).Crop("fill").Gravity("face")
        };

        var result = await _cloudinary.Value.UploadAsync(uploadParams);
        return new PhotoUploadResult(result.SecureUrl, result.PublicId, result.Error?.Message);
    }

    public async Task<PhotoDeletionResult> DeletePhotoAsync(string publicId)
    {
        const string localPrefix = "local:";
        if (publicId.StartsWith(localPrefix, StringComparison.Ordinal))
        {
            var fileName = publicId[localPrefix.Length..];
            if (string.IsNullOrWhiteSpace(fileName) || fileName != Path.GetFileName(fileName))
            {
                return new PhotoDeletionResult(false, "Invalid local photo identifier.");
            }

            var path = Path.Combine(GetUploadDirectory(), fileName);
            if (File.Exists(path))
            {
                File.Delete(path);
            }

            return new PhotoDeletionResult(true);
        }

        if (!IsConfigured)
        {
            return new PhotoDeletionResult(false, "Cloudinary is not configured for this photo.");
        }

        var deleteParams = new DeletionParams(publicId);
        var result = await _cloudinary.Value.DestroyAsync(deleteParams);
        return new PhotoDeletionResult(result.Error == null, result.Error?.Message);
    }

    private async Task<PhotoUploadResult> UploadLocallyAsync(IFormFile file)
    {
        var extension = file.ContentType.ToLowerInvariant() switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "image/gif" => ".gif",
            "image/webp" => ".webp",
            "image/bmp" => ".bmp",
            _ => throw new InvalidOperationException("Use a JPEG, PNG, GIF, WebP, or BMP image.")
        };

        var fileName = $"{Guid.NewGuid():N}{extension}";
        var directory = GetUploadDirectory();
        Directory.CreateDirectory(directory);

        var fullPath = Path.Combine(directory, fileName);
        await using (var output = File.Create(fullPath))
        await using (var input = file.OpenReadStream())
        {
            await input.CopyToAsync(output);
        }

        var request = _httpContextAccessor.HttpContext?.Request
            ?? throw new InvalidOperationException("The upload request is unavailable.");
        var photoUrl = $"{request.Scheme}://{request.Host}{request.PathBase}/uploads/{fileName}";
        return new PhotoUploadResult(new Uri(photoUrl), $"local:{fileName}");
    }

    private string GetUploadDirectory()
    {
        var webRoot = _environment.WebRootPath
            ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
        return Path.Combine(webRoot, "uploads");
    }

}

