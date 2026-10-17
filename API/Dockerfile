FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY API.csproj ./
RUN dotnet restore API.csproj

COPY . ./
RUN dotnet publish API.csproj --configuration Release --no-restore --output /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish ./

RUN mkdir -p /app/data && chown -R 1654:1654 /app/data
USER 1654

EXPOSE 8080
ENTRYPOINT ["dotnet", "API.dll"]
