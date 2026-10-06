using API.Helpers;
using API.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace API.Services;

public class PhotoService : IPhotoService
{
    private readonly CloudinarySettings _settings;
    private readonly Lazy<Cloudinary> _cloudinary;

    public PhotoService(IOptions<CloudinarySettings> config)
    {
        _settings = config.Value;
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

    public async Task<ImageUploadResult> UploadPhotoAsync(IFormFile file)
    {
        if (!IsConfigured)
        {
            throw new InvalidOperationException("Cloudinary is not configured.");
        }

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

        using var stream = file.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Transformation = new Transformation().Width(500).Height(500).Crop("fill").Gravity("face")
        };

        return await _cloudinary.Value.UploadAsync(uploadParams);
    }

    public async Task<DeletionResult> DeletePhotoAsync(string publicId)
    {
        if (!IsConfigured)
        {
            throw new InvalidOperationException("Cloudinary is not configured.");
        }

        var deleteParams = new DeletionParams(publicId);
        return await _cloudinary.Value.DestroyAsync(deleteParams);
    }

}

