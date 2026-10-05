using API.Helpers;
using API.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace API.Services;

public class PhotoService : IPhotoService
{
    private readonly Cloudinary _cloudinary;

    public PhotoService(IOptions<CloudinarySettings> config)
    {
        var account = new Account(
            config.Value.CloudName,
            config.Value.ApiKey,
            config.Value.ApiSecret
        );
        _cloudinary = new Cloudinary(account);
    }

    public async Task<ImageUploadResult> UploadPhotoAsync(IFormFile file)
    {
        if (file is null)
        {
            throw new ArgumentNullException(nameof(file));
        }

        if (file.Length == 0)
        {
            throw new InvalidOperationException("File is empty.");
        }

        using var stream = file.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Transformation = new Transformation().Width(500).Height(500).Crop("fill").Gravity("face")
        };

        return await _cloudinary.UploadAsync(uploadParams);
    }

    public async Task<DeletionResult> DeletePhotoAsync(string publicId)
    {
    

        var deleteParams = new DeletionParams(publicId);
        return await _cloudinary.DestroyAsync(deleteParams);
    }

    public async Task<ImageUploadResult> uploadPhotoAsync(IFormFile file)

    {
        var uploadResult = new ImageUploadResult();
        if (file.Length>0)
        {
            await using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Transformation = new Transformation().Width(500).Height(500).Crop("fill").Gravity("face"), 
                Folder = "user_photos"

            };

            uploadResult = await _cloudinary.UploadAsync(uploadParams);
        }
        return uploadResult;
    }
}


